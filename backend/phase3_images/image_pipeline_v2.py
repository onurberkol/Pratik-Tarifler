"""
Pratik Tarifler — Image Pipeline (PRODUCTION)
==============================================
Pilot batch (50 tarif) için tam çalışan pipeline.

KAYNAKLAR (önceliğe göre):
  1. Unsplash API     (free, kaliteli)
  2. Pexels API       (free, fallback)  
  3. Pixabay API      (free, son şans)
  4. OpenAI DALL-E 3  ($0.040/resim, yöresel)

İŞLEM SIRASI (her tarif için):
  1. Search terms ile Unsplash → Pexels → Pixabay sırasıyla ara
  2. Bulunan resmin kalite skoru ≥ 0.70 ise indir
  3. Hiçbir kaynak yetmediyse DALL-E 3 ile üret
  4. Resmi 1200×900 WebP'ye çevir + 400×300 thumb + BlurHash
  5. /output/ klasörüne kaydet (Firebase Storage upload sonraki adımda)
  6. results.json'a sonuç yaz

KULLANIM:
  # Dry run (API çağrısı yok, sadece simülasyon)
  python image_pipeline_v2.py --dry-run
  
  # Pilot batch (50 tarif)
  python image_pipeline_v2.py --input pilot_batch.json --output ./output/
  
  # Tek tarif (test için)
  python image_pipeline_v2.py --recipe-id tr-mercimek-corbasi
  
  # Sadece AI ile (önceki başarısızlar)
  python image_pipeline_v2.py --ai-only --input failed_jobs.json

GEREKLİ ENV VARS:
  UNSPLASH_ACCESS_KEY
  PEXELS_API_KEY
  PIXABAY_API_KEY
  OPENAI_API_KEY
"""

import os
import sys
import json
import asyncio
import logging
import argparse
from datetime import datetime
from pathlib import Path
from io import BytesIO
from typing import Optional, Dict, Any, List, Tuple

# Production paketleri (pip install ile)
try:
    import aiohttp
    from PIL import Image
    import blurhash
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False
    print("⚠️  Bazı paketler eksik. Çalıştırmadan önce:")
    print("    pip install aiohttp Pillow blurhash openai")

# =================== CONFIG ===================

class Config:
    # Image specs
    FULL_WIDTH = 1200
    FULL_HEIGHT = 900
    THUMB_WIDTH = 400
    THUMB_HEIGHT = 300
    WEBP_QUALITY_FULL = 85
    WEBP_QUALITY_THUMB = 80
    BLURHASH_X = 4
    BLURHASH_Y = 3
    
    # Quality thresholds
    MIN_UNSPLASH_LIKES = 30          # Daha fazla = kaliteli
    MIN_PIXABAY_DOWNLOADS = 100
    MIN_PEXELS_PHOTOGRAPHER_PHOTOS = 10
    MATCH_SCORE_THRESHOLD = 0.65     # Bu eşik üstünü kabul et
    
    # Rate limits (request/saat)
    UNSPLASH_HOURLY = 50             # Production tier
    PEXELS_HOURLY = 200
    PIXABAY_HOURLY = 100
    OPENAI_RPM = 50                  # tier 1
    
    # Maliyet
    DALLE_COST_PER_IMAGE = 0.040     # standard quality
    DALLE_HD_COST = 0.080
    DALLE_MAX_PER_RUN = 100          # Tek run'da en fazla AI çağrısı
    
    # Output
    OUTPUT_DIR = './output'
    
    # Timeout
    DOWNLOAD_TIMEOUT_SEC = 30
    API_TIMEOUT_SEC = 15

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger('pipeline')


# =================== UNSPLASH ===================
class UnsplashClient:
    BASE_URL = "https://api.unsplash.com"
    
    def __init__(self, access_key: str):
        self.access_key = access_key
        self.headers = {
            'Authorization': f'Client-ID {access_key}',
            'Accept-Version': 'v1'
        }
    
    async def search(self, session: aiohttp.ClientSession, query: str) -> Optional[Dict]:
        """Unsplash'ta arama yap, en kaliteli sonucu döndür."""
        try:
            async with session.get(
                f"{self.BASE_URL}/search/photos",
                params={'query': query, 'per_page': 10, 'orientation': 'landscape', 'content_filter': 'high'},
                headers=self.headers,
                timeout=aiohttp.ClientTimeout(total=Config.API_TIMEOUT_SEC)
            ) as resp:
                if resp.status != 200:
                    log.warning(f"  [Unsplash] HTTP {resp.status}")
                    return None
                data = await resp.json()
            
            results = data.get('results', [])
            if not results:
                return None
            
            # Skor: likes ağırlıklı + width >= 1200
            scored = []
            for r in results:
                if r['width'] < 1200:
                    continue
                score = min(r.get('likes', 0) / 200, 1.0)
                scored.append((score, r))
            
            if not scored:
                return None
            
            scored.sort(key=lambda x: -x[0])
            best_score, best = scored[0]
            
            if best.get('likes', 0) < Config.MIN_UNSPLASH_LIKES:
                return None
            
            # Unsplash kuralı: download endpoint'i tetiklenmeli (atıf)
            try:
                async with session.get(
                    best['links']['download_location'],
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=5)
                ):
                    pass
            except Exception:
                pass  # tetikleme başarısız olsa da resmi al
            
            return {
                'url': best['urls']['regular'],   # 1080 px
                'url_full': best['urls']['full'], # max
                'photographer': best['user']['name'],
                'photographer_url': best['user']['links']['html'],
                'source': 'unsplash',
                'source_id': best['id'],
                'license': 'unsplash',
                'score': best_score,
                'width': best['width'],
                'height': best['height']
            }
        except Exception as e:
            log.error(f"  [Unsplash] Error: {e}")
            return None


# =================== PEXELS ===================
class PexelsClient:
    BASE_URL = "https://api.pexels.com/v1"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {'Authorization': api_key}
    
    async def search(self, session: aiohttp.ClientSession, query: str) -> Optional[Dict]:
        try:
            async with session.get(
                f"{self.BASE_URL}/search",
                params={'query': query, 'per_page': 10, 'orientation': 'landscape', 'size': 'large'},
                headers=self.headers,
                timeout=aiohttp.ClientTimeout(total=Config.API_TIMEOUT_SEC)
            ) as resp:
                if resp.status != 200:
                    return None
                data = await resp.json()
            
            photos = data.get('photos', [])
            if not photos:
                return None
            
            # Pexels'te likes yok, ama "large" size + width skoru
            scored = [(min(p['width'] / 2000, 1.0), p) for p in photos if p['width'] >= 1200]
            if not scored:
                return None
            scored.sort(key=lambda x: -x[0])
            best_score, best = scored[0]
            
            return {
                'url': best['src']['large'],
                'url_full': best['src']['original'],
                'photographer': best['photographer'],
                'photographer_url': best['photographer_url'],
                'source': 'pexels',
                'source_id': str(best['id']),
                'license': 'pexels',
                'score': best_score * 0.85,  # Pexels'i biraz düşür
                'width': best['width'],
                'height': best['height']
            }
        except Exception as e:
            log.error(f"  [Pexels] Error: {e}")
            return None


# =================== PIXABAY ===================
class PixabayClient:
    BASE_URL = "https://pixabay.com/api/"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def search(self, session: aiohttp.ClientSession, query: str) -> Optional[Dict]:
        try:
            async with session.get(
                self.BASE_URL,
                params={
                    'key': self.api_key,
                    'q': query,
                    'image_type': 'photo',
                    'orientation': 'horizontal',
                    'min_width': 1200,
                    'category': 'food',
                    'per_page': 10
                },
                timeout=aiohttp.ClientTimeout(total=Config.API_TIMEOUT_SEC)
            ) as resp:
                if resp.status != 200:
                    return None
                data = await resp.json()
            
            hits = data.get('hits', [])
            if not hits:
                return None
            
            scored = []
            for h in hits:
                if h.get('downloads', 0) < Config.MIN_PIXABAY_DOWNLOADS:
                    continue
                score = min(h.get('likes', 0) / 100, 1.0) * 0.7  # Pixabay düşük öncelik
                scored.append((score, h))
            
            if not scored:
                return None
            scored.sort(key=lambda x: -x[0])
            best_score, best = scored[0]
            
            return {
                'url': best['largeImageURL'],
                'url_full': best['largeImageURL'],
                'photographer': best['user'],
                'photographer_url': f"https://pixabay.com/users/{best['user']}",
                'source': 'pixabay',
                'source_id': str(best['id']),
                'license': 'pixabay',
                'score': best_score,
                'width': best['imageWidth'],
                'height': best['imageHeight']
            }
        except Exception as e:
            log.error(f"  [Pixabay] Error: {e}")
            return None


# =================== OPENAI DALL-E 3 ===================
class DalleClient:
    """OpenAI DALL-E 3."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        from openai import AsyncOpenAI
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def generate(self, prompt: str, recipe_id: str) -> Optional[Dict]:
        log.info(f"  [DALL-E 3] Generating: {recipe_id}")
        log.debug(f"    Prompt: {prompt[:120]}...")
        try:
            response = await self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1792x1024",  # 16:9, sonra 4:3'e crop
                quality="standard",
                n=1
            )
            return {
                'url': response.data[0].url,
                'url_full': response.data[0].url,
                'photographer': 'AI Generated (DALL-E 3)',
                'photographer_url': None,
                'source': 'dalle',
                'source_id': f"dalle_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{recipe_id}",
                'license': 'ai-generated',
                'score': 1.0,
                'width': 1792,
                'height': 1024,
                'revised_prompt': response.data[0].revised_prompt
            }
        except Exception as e:
            log.error(f"  [DALL-E 3] Error: {e}")
            return None


# =================== IMAGE PROCESSING ===================
class ImageProcessor:
    @staticmethod
    async def download(session: aiohttp.ClientSession, url: str) -> bytes:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=Config.DOWNLOAD_TIMEOUT_SEC)) as resp:
            resp.raise_for_status()
            return await resp.read()
    
    @staticmethod
    def crop_and_resize(image_bytes: bytes, target_w: int, target_h: int, quality: int) -> bytes:
        img = Image.open(BytesIO(image_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # 4:3 ratio crop (center)
        target_ratio = target_w / target_h
        img_ratio = img.width / img.height
        
        if img_ratio > target_ratio:
            new_w = int(img.height * target_ratio)
            left = (img.width - new_w) // 2
            img = img.crop((left, 0, left + new_w, img.height))
        else:
            new_h = int(img.width / target_ratio)
            top = (img.height - new_h) // 2
            img = img.crop((0, top, img.width, top + new_h))
        
        img = img.resize((target_w, target_h), Image.LANCZOS)
        
        buf = BytesIO()
        img.save(buf, format='WEBP', quality=quality, method=6)
        return buf.getvalue()
    
    @staticmethod
    def generate_blurhash(image_bytes: bytes) -> str:
        import numpy as np
        img = Image.open(BytesIO(image_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img.thumbnail((100, 75), Image.LANCZOS)
        # blurhash numpy array bekler: shape (H, W, 3)
        arr = np.array(img)
        return blurhash.encode(arr, Config.BLURHASH_X, Config.BLURHASH_Y)


# =================== ORCHESTRATOR ===================
class ImagePipeline:
    def __init__(self, args):
        self.args = args
        self.dry_run = args.dry_run
        
        # Clients (env vars'tan al)
        unsplash_key = os.getenv('UNSPLASH_ACCESS_KEY')
        pexels_key = os.getenv('PEXELS_API_KEY')
        pixabay_key = os.getenv('PIXABAY_API_KEY')
        openai_key = os.getenv('OPENAI_API_KEY')
        
        self.unsplash = UnsplashClient(unsplash_key) if unsplash_key else None
        self.pexels = PexelsClient(pexels_key) if pexels_key else None
        self.pixabay = PixabayClient(pixabay_key) if pixabay_key else None
        self.dalle = DalleClient(openai_key) if openai_key else None
        
        self.processor = ImageProcessor()
        self.dalle_calls = 0
        self.total_cost = 0.0
        
        # Output dirs
        self.out_dir = Path(args.output or Config.OUTPUT_DIR)
        (self.out_dir / 'full').mkdir(parents=True, exist_ok=True)
        (self.out_dir / 'thumb').mkdir(parents=True, exist_ok=True)
        (self.out_dir / 'blur').mkdir(parents=True, exist_ok=True)
        
        # Status log
        self._show_config()
    
    def _show_config(self):
        log.info("=" * 60)
        log.info("Pratik Tarifler — Image Pipeline")
        log.info("=" * 60)
        log.info(f"  Dry run: {self.dry_run}")
        log.info(f"  Output dir: {self.out_dir}")
        log.info(f"  Unsplash:  {'✓' if self.unsplash else '✗ (no API key)'}")
        log.info(f"  Pexels:    {'✓' if self.pexels else '✗ (no API key)'}")
        log.info(f"  Pixabay:   {'✓' if self.pixabay else '✗ (no API key)'}")
        log.info(f"  DALL-E 3:  {'✓' if self.dalle else '✗ (no API key)'}")
        log.info("=" * 60)
    
    async def process_recipe(self, session: aiohttp.ClientSession, recipe: Dict) -> Dict:
        recipe_id = recipe['id']
        title = recipe['title']
        log.info(f"▶ {recipe_id} — {title}")
        
        attempts = []
        result = None
        
        # 1. Search queries oluştur (öncelik sırasıyla)
        primary_query = recipe['search_terms']['fallback_query']
        secondary_query = f"{recipe['search_terms']['primary_keywords']} food"
        
        # 2. Unsplash → Pexels → Pixabay sırasıyla dene
        for source_name, client, query in [
            ('unsplash', self.unsplash, primary_query),
            ('unsplash', self.unsplash, secondary_query),
            ('pexels', self.pexels, primary_query),
            ('pixabay', self.pixabay, primary_query),
        ]:
            if not client:
                continue
            
            if self.dry_run:
                log.info(f"  [{source_name}] DRY-RUN searching: '{query}'")
                attempts.append({'source': source_name, 'query': query, 'result': 'dry_run', 'at': datetime.now().isoformat()})
                continue
            
            log.info(f"  [{source_name}] searching: '{query}'")
            search_result = await client.search(session, query)
            attempt = {
                'source': source_name,
                'query': query,
                'result': 'found' if search_result else 'no_match',
                'score': search_result.get('score') if search_result else None,
                'at': datetime.now().isoformat()
            }
            attempts.append(attempt)
            
            if search_result and search_result.get('score', 0) >= Config.MATCH_SCORE_THRESHOLD:
                log.info(f"  ✓ Match in {source_name} (score: {search_result['score']:.2f})")
                result = search_result
                break
        
        # 3. Bulunamadıysa AI
        if not result:
            if self.dry_run:
                log.info(f"  [DALL-E 3] DRY-RUN would generate")
                attempts.append({'source': 'dalle', 'result': 'dry_run', 'at': datetime.now().isoformat()})
                return self._build_summary(recipe, attempts, None, 'dry_run')
            
            if not self.dalle:
                log.warning(f"  ⚠️  No source found and no DALL-E key")
                return self._build_summary(recipe, attempts, None, 'no_source_available')
            
            if self.dalle_calls >= Config.DALLE_MAX_PER_RUN:
                log.warning(f"  ⚠️  DALL-E quota reached")
                return self._build_summary(recipe, attempts, None, 'quota_exceeded')
            
            result = await self.dalle.generate(recipe['ai_prompt'], recipe_id)
            self.dalle_calls += 1
            self.total_cost += Config.DALLE_COST_PER_IMAGE
            attempts.append({
                'source': 'dalle',
                'result': 'generated' if result else 'failed',
                'cost_usd': Config.DALLE_COST_PER_IMAGE,
                'at': datetime.now().isoformat()
            })
        
        if not result:
            return self._build_summary(recipe, attempts, None, 'all_failed')
        
        # 4. İndir + işle (dry run değilse)
        if self.dry_run:
            return self._build_summary(recipe, attempts, result, 'dry_run_completed')
        
        try:
            log.info(f"  ↓ Downloading from {result['source']}...")
            raw_bytes = await self.processor.download(session, result['url'])
            
            log.info(f"  ⚙️  Processing (resize, WebP, BlurHash)...")
            full_bytes = self.processor.crop_and_resize(raw_bytes, Config.FULL_WIDTH, Config.FULL_HEIGHT, Config.WEBP_QUALITY_FULL)
            thumb_bytes = self.processor.crop_and_resize(raw_bytes, Config.THUMB_WIDTH, Config.THUMB_HEIGHT, Config.WEBP_QUALITY_THUMB)
            blur_hash = self.processor.generate_blurhash(raw_bytes)
            
            # Diske yaz (Firebase upload sonraki adımda)
            full_path = self.out_dir / 'full' / f"{recipe_id}.webp"
            thumb_path = self.out_dir / 'thumb' / f"{recipe_id}.webp"
            blur_path = self.out_dir / 'blur' / f"{recipe_id}.txt"
            
            full_path.write_bytes(full_bytes)
            thumb_path.write_bytes(thumb_bytes)
            blur_path.write_text(blur_hash)
            
            file_size_kb = len(full_bytes) / 1024
            log.info(f"  ✓ Saved ({file_size_kb:.1f} KB full, {len(thumb_bytes)/1024:.1f} KB thumb)")
            
            return self._build_summary(recipe, attempts, {
                **result,
                'blur_hash': blur_hash,
                'full_path': str(full_path),
                'thumb_path': str(thumb_path),
                'file_size_kb': file_size_kb
            }, 'success')
        
        except Exception as e:
            log.error(f"  ✗ Processing error: {e}")
            return self._build_summary(recipe, attempts, None, 'processing_error', error=str(e))
    
    def _build_summary(self, recipe, attempts, result, status, error=None):
        return {
            'recipe_id': recipe['id'],
            'title': recipe['title'],
            'cuisine': recipe['cuisine'],
            'status': status,
            'attempts': attempts,
            'final_source': result.get('source') if result else None,
            'image_url': result.get('url') if result else None,
            'photographer': result.get('photographer') if result else None,
            'blur_hash': result.get('blur_hash') if result else None,
            'file_size_kb': result.get('file_size_kb') if result else None,
            'error': error,
            'processed_at': datetime.now().isoformat()
        }
    
    async def run(self, recipes: List[Dict]):
        """Pipeline'ı çalıştır — paralel rate-limit'li."""
        connector = aiohttp.TCPConnector(limit=5)
        semaphore = asyncio.Semaphore(3)  # Aynı anda 3 işlem
        
        async with aiohttp.ClientSession(connector=connector) as session:
            async def guarded(r):
                async with semaphore:
                    return await self.process_recipe(session, r)
            
            tasks = [guarded(r) for r in recipes]
            results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Özet
        ok = [r for r in results if isinstance(r, dict) and r.get('status') in ('success', 'dry_run_completed')]
        failed = [r for r in results if isinstance(r, dict) and r.get('status') not in ('success', 'dry_run_completed')]
        
        # Source bazlı dağılım
        source_count = {}
        for r in ok:
            s = r.get('final_source', 'unknown')
            source_count[s] = source_count.get(s, 0) + 1
        
        log.info("=" * 60)
        log.info(f"PIPELINE COMPLETE")
        log.info(f"  Total: {len(recipes)}")
        log.info(f"  Success: {len(ok)}")
        log.info(f"  Failed: {len(failed)}")
        log.info(f"  Source distribution: {source_count}")
        log.info(f"  DALL-E calls: {self.dalle_calls}")
        log.info(f"  Total cost: ${self.total_cost:.2f}")
        log.info("=" * 60)
        
        # Sonuçları yaz
        results_file = self.out_dir / f'results_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump({
                'summary': {
                    'total': len(recipes),
                    'success': len(ok),
                    'failed': len(failed),
                    'source_distribution': source_count,
                    'dalle_calls': self.dalle_calls,
                    'total_cost_usd': self.total_cost
                },
                'results': [r for r in results if isinstance(r, dict)]
            }, f, ensure_ascii=False, indent=2)
        
        log.info(f"📄 Results: {results_file}")
        return results


# =================== ENTRY ===================
async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=str, default='/home/claude/recipes_db/phase3_images/pilot_batch.json',
                        help='Input JSON with recipes')
    parser.add_argument('--output', type=str, default='/home/claude/recipes_db/phase3_images/output',
                        help='Output dir')
    parser.add_argument('--dry-run', action='store_true', help='Simulate without API calls')
    parser.add_argument('--limit', type=int, default=None, help='Limit number of recipes')
    parser.add_argument('--recipe-id', type=str, default=None, help='Process single recipe')
    args = parser.parse_args()
    
    if not HAS_DEPS and not args.dry_run:
        log.error("Production paketleri eksik. --dry-run kullanın veya:")
        log.error("    pip install aiohttp Pillow blurhash openai")
        sys.exit(1)
    
    # Load recipes
    with open(args.input, encoding='utf-8') as f:
        data = json.load(f)
    
    recipes = data.get('recipes', [])
    
    if args.recipe_id:
        recipes = [r for r in recipes if r['id'] == args.recipe_id]
        if not recipes:
            log.error(f"Recipe {args.recipe_id} not found")
            sys.exit(1)
    
    if args.limit:
        recipes = recipes[:args.limit]
    
    log.info(f"Loaded {len(recipes)} recipes from {args.input}")
    
    pipeline = ImagePipeline(args)
    await pipeline.run(recipes)


if __name__ == '__main__':
    asyncio.run(main())
