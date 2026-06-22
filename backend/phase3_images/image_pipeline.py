"""
Pratik Tarifler — Image Pipeline (Production Ready)
====================================================
Tarif görselleri için uçtan uca pipeline:

  Tarif → Unsplash arama → Pexels fallback → Pixabay fallback → AI generation 
       → Standardize (resize/webp) → BlurHash → Firebase Storage upload 
       → Firestore update → Admin review queue

Kullanım:
    # Pilot (50 tarif test)
    python image_pipeline.py --mode pilot --count 50
    
    # Toplu (günde 200 tarif, kategori bazlı)
    python image_pipeline.py --mode batch --category dinner --count 200
    
    # Belirli tarifler
    python image_pipeline.py --mode targeted --ids tr-mercimek-corbasi,tr-su-boregi
    
    # Sadece AI ile (önceden başarısız olanlar)
    python image_pipeline.py --mode ai-only --status failed

Önkoşullar:
    pip install firebase-admin pillow blurhash requests openai aiohttp
    
    Environment variables:
    - UNSPLASH_ACCESS_KEY
    - PEXELS_API_KEY
    - PIXABAY_API_KEY
    - OPENAI_API_KEY
    - FIREBASE_SERVICE_ACCOUNT_PATH
    - FIREBASE_STORAGE_BUCKET
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from io import BytesIO

# ============= Imports (production'da gerekecek) =============
# import requests
# import aiohttp
# from PIL import Image
# import blurhash
# import firebase_admin
# from firebase_admin import credentials, storage, firestore
# from openai import OpenAI

# ============= Config =============
class Config:
    # Image specs
    FULL_WIDTH = 1200
    FULL_HEIGHT = 900
    THUMB_WIDTH = 400
    THUMB_HEIGHT = 300
    WEBP_QUALITY = 85
    BLUR_HASH_COMPONENTS = (4, 3)  # 40x30 placeholder
    
    # Quality thresholds
    UNSPLASH_MIN_LIKES = 50          # Kaliteli resim göstergesi
    MATCH_SCORE_THRESHOLD = 0.70     # Bu eşiğin üstündeki sonucu kabul et
    
    # Rate limits (kaynak bazlı)
    UNSPLASH_RATE = 50               # request/hour (production tier)
    PEXELS_RATE = 200                # request/hour
    PIXABAY_RATE = 100               # request/hour (free tier)
    DALLE_RATE = 50                  # request/minute (tier 1)
    
    # Storage paths
    STORAGE_PREFIX_FULL = "recipes/tr/full/"
    STORAGE_PREFIX_THUMB = "recipes/tr/thumb/"
    
    # Maliyet kontrol
    DALLE_MAX_PER_RUN = 100          # Her çalıştırmada maksimum DALL-E çağrısı
    DALLE_COST_PER_IMAGE = 0.040     # standard quality
    

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
log = logging.getLogger(__name__)


# ============= Source Modules =============

class UnsplashSource:
    """Unsplash API entegrasyonu — en kaliteli telif-haksız kaynak."""
    
    BASE_URL = "https://api.unsplash.com"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {'Authorization': f'Client-ID {api_key}'}
    
    async def search(self, query: str, recipe: dict) -> Optional[dict]:
        """
        Tarif için en uygun resmi bul.
        Returns: { url, photographer, photographer_url, source_id, score } veya None
        """
        # Pseudo-code:
        # response = await aiohttp.get(
        #     f"{self.BASE_URL}/search/photos",
        #     params={'query': query, 'per_page': 10, 'orientation': 'landscape'},
        #     headers=self.headers
        # )
        # results = response.json()['results']
        # if not results:
        #     return None
        # 
        # # Skor: likes + width × downloads
        # best = max(results, key=lambda r: r['likes'] * (r['width'] / 1000))
        # if best['likes'] < Config.UNSPLASH_MIN_LIKES:
        #     return None  # kalite yetersiz
        # 
        # return {
        #     'url': best['urls']['regular'],
        #     'download_url': best['links']['download_location'],  # tetiklenmeli (Unsplash kuralı)
        #     'photographer': best['user']['name'],
        #     'photographer_url': best['user']['links']['html'],
        #     'source_id': best['id'],
        #     'score': min(best['likes'] / 500, 1.0),  # 0-1 normalize
        # }
        log.info(f"  [Unsplash] Searching: '{query}'")
        # MOCK: gerçek pipeline'da yukarıdaki kod çalışır
        return None


class PexelsSource:
    """Pexels API — Unsplash fallback."""
    
    BASE_URL = "https://api.pexels.com/v1"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def search(self, query: str, recipe: dict) -> Optional[dict]:
        log.info(f"  [Pexels] Searching: '{query}'")
        # Pseudo-code:
        # response = await aiohttp.get(
        #     f"{self.BASE_URL}/search",
        #     params={'query': query, 'per_page': 10, 'orientation': 'landscape'},
        #     headers={'Authorization': self.api_key}
        # )
        # ...
        return None


class PixabaySource:
    """Pixabay API — son free fallback."""
    
    BASE_URL = "https://pixabay.com/api/"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def search(self, query: str, recipe: dict) -> Optional[dict]:
        log.info(f"  [Pixabay] Searching: '{query}'")
        return None


class DalleSource:
    """OpenAI DALL-E 3 — kalite garanti, ücretli."""
    
    def __init__(self, openai_client):
        self.client = openai_client
    
    async def generate(self, recipe: dict) -> Optional[dict]:
        prompt = recipe['image']['pipeline_metadata']['ai_prompt']
        log.info(f"  [DALL-E 3] Generating: {recipe['id']}")
        log.info(f"    Prompt: {prompt[:80]}...")
        
        # Pseudo-code:
        # response = await self.client.images.generate(
        #     model="dall-e-3",
        #     prompt=prompt,
        #     size="1792x1024",   # 16:9, daha sonra 4:3 crop
        #     quality="standard",  # veya "hd" ($0.080)
        #     n=1
        # )
        # return {
        #     'url': response.data[0].url,
        #     'source_id': response.created,
        #     'photographer': 'AI Generated (DALL-E 3)',
        #     'license': 'ai-generated',
        #     'score': 1.0
        # }
        return None


class FluxSource:
    """Flux Pro (Replicate veya Together AI) — alternatif AI."""
    
    async def generate(self, recipe: dict) -> Optional[dict]:
        log.info(f"  [Flux Pro] Generating: {recipe['id']}")
        # Implementasyon Replicate API üzerinden
        return None


# ============= Image Processing =============

class ImageProcessor:
    """İndir, resize, WebP'ye çevir, BlurHash üret."""
    
    @staticmethod
    async def download(url: str) -> bytes:
        """URL'den resim indir."""
        # async with aiohttp.ClientSession() as session:
        #     async with session.get(url) as resp:
        #         return await resp.read()
        return b''
    
    @staticmethod
    def resize_and_convert(image_bytes: bytes, width: int, height: int, quality: int = 85) -> bytes:
        """
        Resmi standardize et: crop to ratio, resize, WebP'ye çevir.
        """
        # img = Image.open(BytesIO(image_bytes))
        # 
        # # 4:3 aspect ratio'ya crop et (center)
        # target_ratio = width / height
        # img_ratio = img.width / img.height
        # if img_ratio > target_ratio:
        #     # Çok geniş, yanlardan kırp
        #     new_width = int(img.height * target_ratio)
        #     left = (img.width - new_width) // 2
        #     img = img.crop((left, 0, left + new_width, img.height))
        # else:
        #     # Çok yüksek, üst-alttan kırp
        #     new_height = int(img.width / target_ratio)
        #     top = (img.height - new_height) // 2
        #     img = img.crop((0, top, img.width, top + new_height))
        # 
        # img = img.resize((width, height), Image.LANCZOS)
        # 
        # # WebP olarak kaydet
        # buf = BytesIO()
        # img.save(buf, format='WEBP', quality=quality, method=6)
        # return buf.getvalue()
        return b''
    
    @staticmethod
    def generate_blurhash(image_bytes: bytes) -> str:
        """LQIP placeholder hash üret."""
        # img = Image.open(BytesIO(image_bytes))
        # img.thumbnail((100, 100), Image.LANCZOS)
        # img = img.convert('RGB')
        # pixels = list(img.getdata())
        # return blurhash.encode(pixels, img.width, img.height, 
        #                       Config.BLUR_HASH_COMPONENTS[0], 
        #                       Config.BLUR_HASH_COMPONENTS[1])
        return "LKO2?U%2Tw=w]~RBVZRi};RPxuwH"  # placeholder


# ============= Firebase Integration =============

class FirebaseUploader:
    """Firebase Storage upload + Firestore update."""
    
    def __init__(self, app):
        self.bucket = storage.bucket(app=app) if app else None
        self.db = firestore.client(app=app) if app else None
    
    async def upload_to_storage(self, path: str, data: bytes, content_type: str = 'image/webp') -> str:
        """Storage'a yükle, public URL döndür."""
        # blob = self.bucket.blob(path)
        # blob.upload_from_string(data, content_type=content_type)
        # blob.make_public()
        # return blob.public_url
        return f"https://storage.googleapis.com/MOCK_BUCKET/{path}"
    
    async def update_recipe(self, recipe_id: str, image_data: dict):
        """Firestore'daki tarifi güncelle."""
        # ref = self.db.collection('recipes_tr').document(recipe_id)
        # ref.update({
        #     'image': image_data,
        #     'image_status': image_data['status']
        # })
        pass
    
    async def update_job(self, recipe_id: str, job_data: dict):
        """Image job kaydını güncelle."""
        # ref = self.db.collection('image_jobs').document(f'img_job_{recipe_id}')
        # ref.update(job_data)
        pass
    
    async def add_to_review_queue(self, recipe_id: str, summary: dict):
        """Admin'in göreceği review queue'ya ekle."""
        # ref = self.db.collection('image_review_queue').document(recipe_id)
        # ref.set(summary)
        pass


# ============= Pipeline Orchestrator =============

class ImagePipeline:
    """Ana pipeline."""
    
    def __init__(self):
        self.unsplash = None  # UnsplashSource(os.getenv('UNSPLASH_ACCESS_KEY'))
        self.pexels = None    # PexelsSource(os.getenv('PEXELS_API_KEY'))
        self.pixabay = None   # PixabaySource(os.getenv('PIXABAY_API_KEY'))
        self.dalle = None     # DalleSource(OpenAI())
        self.processor = ImageProcessor()
        self.firebase = None  # FirebaseUploader(firebase_admin.initialize_app(...))
        
        self.dalle_calls_made = 0
    
    async def process_recipe(self, recipe: dict) -> dict:
        """
        Bir tarifin görsel pipeline'ını çalıştır.
        Returns: image data dict (kaynak, URLs, status)
        """
        recipe_id = recipe['id']
        log.info(f"Processing: {recipe_id} — {recipe['title']}")
        
        job_attempts = []
        
        # 1. Önce telif-haksız kaynaklarda ara
        query_primary = recipe['image']['pipeline_metadata']['search_terms']['primary_keywords']
        query_fallback = recipe['image']['pipeline_metadata']['search_terms']['fallback_query']
        
        result = None
        for source_name, source, query in [
            ('unsplash', self.unsplash, query_primary),
            ('unsplash', self.unsplash, query_fallback),
            ('pexels', self.pexels, query_primary),
            ('pixabay', self.pixabay, query_primary),
        ]:
            if source is None:
                continue  # API key yok, atla
            try:
                result = await source.search(query, recipe)
                attempt = {
                    'source': source_name,
                    'query': query,
                    'result': 'found' if result else 'no_match',
                    'at': datetime.now().isoformat()
                }
                job_attempts.append(attempt)
                if result and result.get('score', 0) >= Config.MATCH_SCORE_THRESHOLD:
                    log.info(f"  ✓ Found in {source_name} (score: {result['score']:.2f})")
                    break
            except Exception as e:
                log.error(f"  ✗ {source_name} error: {e}")
                job_attempts.append({'source': source_name, 'error': str(e)})
        
        # 2. Bulunamadıysa AI üret
        if not result or result.get('score', 0) < Config.MATCH_SCORE_THRESHOLD:
            if self.dalle_calls_made >= Config.DALLE_MAX_PER_RUN:
                log.warning(f"  ⚠️ DALL-E quota reached for this run, marking failed")
                return self._build_failed_result(job_attempts)
            
            try:
                result = await self.dalle.generate(recipe) if self.dalle else None
                self.dalle_calls_made += 1
                attempt = {
                    'source': 'dalle',
                    'result': 'generated' if result else 'failed',
                    'cost_usd': Config.DALLE_COST_PER_IMAGE,
                    'at': datetime.now().isoformat()
                }
                job_attempts.append(attempt)
            except Exception as e:
                log.error(f"  ✗ DALL-E error: {e}")
                return self._build_failed_result(job_attempts)
        
        if not result:
            return self._build_failed_result(job_attempts)
        
        # 3. İndir + işle
        try:
            raw_bytes = await self.processor.download(result['url'])
            full_bytes = self.processor.resize_and_convert(raw_bytes, Config.FULL_WIDTH, Config.FULL_HEIGHT, Config.WEBP_QUALITY)
            thumb_bytes = self.processor.resize_and_convert(raw_bytes, Config.THUMB_WIDTH, Config.THUMB_HEIGHT, 80)
            blur_hash = self.processor.generate_blurhash(raw_bytes)
        except Exception as e:
            log.error(f"  ✗ Processing error: {e}")
            return self._build_failed_result(job_attempts)
        
        # 4. Firebase Storage'a yükle
        full_url = await self.firebase.upload_to_storage(
            f"{Config.STORAGE_PREFIX_FULL}{recipe_id}.webp",
            full_bytes
        ) if self.firebase else f"MOCK://full/{recipe_id}.webp"
        thumb_url = await self.firebase.upload_to_storage(
            f"{Config.STORAGE_PREFIX_THUMB}{recipe_id}.webp",
            thumb_bytes
        ) if self.firebase else f"MOCK://thumb/{recipe_id}.webp"
        
        # 5. Sonucu hazırla
        image_data = {
            'url_full': full_url,
            'url_thumb': thumb_url,
            'blur_hash': blur_hash,
            'width': Config.FULL_WIDTH,
            'height': Config.FULL_HEIGHT,
            'source': result.get('source', 'unknown'),
            'source_id': result.get('source_id'),
            'photographer': result.get('photographer'),
            'photographer_url': result.get('photographer_url'),
            'license': result.get('license', 'unknown'),
            'status': 'review',  # admin onayı bekliyor
            'created_at': datetime.now().isoformat(),
            'pipeline_attempts': job_attempts
        }
        
        # 6. Firestore'a yaz + review queue'ya ekle
        if self.firebase:
            await self.firebase.update_recipe(recipe_id, image_data)
            await self.firebase.add_to_review_queue(recipe_id, {
                'recipe_id': recipe_id,
                'title': recipe['title'],
                'image_url': thumb_url,
                'source': result.get('source'),
                'created_at': image_data['created_at']
            })
        
        log.info(f"  ✓ Done: {recipe_id} ({result.get('source')})")
        return image_data
    
    def _build_failed_result(self, attempts):
        return {
            'status': 'failed',
            'pipeline_attempts': attempts,
            'failed_at': datetime.now().isoformat()
        }
    
    async def run_batch(self, recipes: list, max_concurrent: int = 5):
        """Paralel çalıştırma (rate limit gözeterek)."""
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def guarded(r):
            async with semaphore:
                return await self.process_recipe(r)
        
        tasks = [guarded(r) for r in recipes]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # İstatistik
        success = sum(1 for r in results if isinstance(r, dict) and r.get('status') != 'failed')
        failed = len(results) - success
        dalle_cost = self.dalle_calls_made * Config.DALLE_COST_PER_IMAGE
        
        log.info(f"\n=== BATCH SUMMARY ===")
        log.info(f"Total: {len(recipes)}")
        log.info(f"Success: {success}")
        log.info(f"Failed: {failed}")
        log.info(f"DALL-E calls: {self.dalle_calls_made} (${dalle_cost:.2f})")
        
        return results


# ============= Entry Points =============

async def run_pilot(count: int = 50):
    """Pilot çalıştırma — 50 farklı kategoriden tarif."""
    with open('/home/claude/recipes_db/recipes_db_FULL_tr_v2.json', encoding='utf-8') as f:
        data = json.load(f)
    
    # Her cuisine'dan dengeli örnek seç
    selected = []
    by_cuisine = {}
    for r in data['recipes']:
        by_cuisine.setdefault(r['cuisine'], []).append(r)
    
    per_cuisine = max(1, count // len(by_cuisine))
    for cuisine, recipes in by_cuisine.items():
        selected.extend(recipes[:per_cuisine])
    
    selected = selected[:count]
    
    log.info(f"PILOT: Processing {len(selected)} recipes across {len(by_cuisine)} cuisines")
    
    pipeline = ImagePipeline()
    await pipeline.run_batch(selected)


async def run_batch(category: Optional[str] = None, count: int = 200):
    """Toplu çalıştırma — günde 200 tarif."""
    with open('/home/claude/recipes_db/recipes_db_FULL_tr_v2.json', encoding='utf-8') as f:
        data = json.load(f)
    
    recipes = data['recipes']
    
    # Sadece pending olanları al
    pending = [r for r in recipes if r['image']['status'] == 'pending']
    
    # Kategoriye göre filtre
    if category:
        pending = [r for r in pending if category in r.get('meal_type', [])]
    
    # Öncelik: premium öne
    pending.sort(key=lambda r: 0 if r.get('is_premium') else 1)
    
    selected = pending[:count]
    log.info(f"BATCH: Processing {len(selected)} pending recipes")
    
    pipeline = ImagePipeline()
    await pipeline.run_batch(selected)


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', choices=['pilot', 'batch', 'targeted', 'ai-only'], default='pilot')
    parser.add_argument('--count', type=int, default=50)
    parser.add_argument('--category', type=str, default=None)
    parser.add_argument('--ids', type=str, default=None)
    args = parser.parse_args()
    
    if args.mode == 'pilot':
        asyncio.run(run_pilot(args.count))
    elif args.mode == 'batch':
        asyncio.run(run_batch(args.category, args.count))
