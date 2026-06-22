"""
Local test — gerçek API kullanmadan image processing'i doğrula.
Sample bir food fotoğrafıyla pipeline'ın resize/WebP/BlurHash kısımlarını test eder.
"""
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(__file__))

from image_pipeline_v2 import ImageProcessor, Config
from pathlib import Path
import urllib.request

# Public domain food image (Wikipedia)
TEST_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Spaghetti_alla_Carbonara.jpg/1280px-Spaghetti_alla_Carbonara.jpg"

print("=" * 60)
print("LOCAL IMAGE PROCESSING TEST")
print("=" * 60)

# 1. Download
print(f"\n1. İndiriliyor: {TEST_URL[:60]}...")
try:
    req = urllib.request.Request(TEST_URL, headers={'User-Agent': 'Mozilla/5.0 (test)'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        raw_bytes = resp.read()
    print(f"   ✓ İndirildi: {len(raw_bytes)/1024:.1f} KB")
except Exception as e:
    print(f"   ✗ İndirme hatası (internet yok mu?): {e}")
    print("   Lokal test paketleri tek başına test edelim:")
    # PIL ile basit bir test resmi üret
    from PIL import Image
    from io import BytesIO
    img = Image.new('RGB', (1920, 1080), color=(220, 180, 100))
    buf = BytesIO()
    img.save(buf, format='JPEG', quality=90)
    raw_bytes = buf.getvalue()
    print(f"   → Test resmi üretildi: {len(raw_bytes)/1024:.1f} KB (1920x1080 turuncu)")

# 2. Resize to full (1200x900)
print(f"\n2. Resize → 1200x900 WebP...")
processor = ImageProcessor()
full_bytes = processor.crop_and_resize(raw_bytes, 1200, 900, 85)
print(f"   ✓ Full: {len(full_bytes)/1024:.1f} KB")

# 3. Resize to thumb (400x300)
print(f"\n3. Resize → 400x300 WebP thumb...")
thumb_bytes = processor.crop_and_resize(raw_bytes, 400, 300, 80)
print(f"   ✓ Thumb: {len(thumb_bytes)/1024:.1f} KB")

# 4. BlurHash
print(f"\n4. BlurHash üretiliyor...")
blur_hash = processor.generate_blurhash(raw_bytes)
print(f"   ✓ BlurHash: {blur_hash}")

# 5. Diske yaz
out_dir = Path('/home/claude/recipes_db/phase3_images/output')
(out_dir / 'full').mkdir(parents=True, exist_ok=True)
(out_dir / 'thumb').mkdir(parents=True, exist_ok=True)
(out_dir / 'blur').mkdir(parents=True, exist_ok=True)

(out_dir / 'full' / 'TEST.webp').write_bytes(full_bytes)
(out_dir / 'thumb' / 'TEST.webp').write_bytes(thumb_bytes)
(out_dir / 'blur' / 'TEST.txt').write_text(blur_hash)

print(f"\n5. Dosyalar kaydedildi:")
print(f"   {out_dir}/full/TEST.webp")
print(f"   {out_dir}/thumb/TEST.webp")
print(f"   {out_dir}/blur/TEST.txt")
print(f"\n✅ TÜM AŞAMALAR BAŞARILI!")
