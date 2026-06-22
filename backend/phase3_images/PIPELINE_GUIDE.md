# 📸 Image Pipeline — Çalıştırma Rehberi

> **2500 tarifin görselini sıfırdan toplama/üretme planı.**

---

## ✅ ÖN KOŞULLAR

### API Anahtarları (Gerekli Hesaplar)

| Servis | URL | Tier | Limit |
|--------|-----|------|-------|
| **Unsplash** | https://unsplash.com/developers | Production | 50 req/saat (başvuru gerekiyor, 1-3 gün) |
| **Pexels** | https://www.pexels.com/api/ | Free | 200 req/saat (anında) |
| **Pixabay** | https://pixabay.com/api/docs/ | Free | 100 req/saat (anında) |
| **OpenAI** | https://platform.openai.com/api-keys | Pay-as-you-go | 50 req/dakika (tier 1) |
| **Firebase** | https://console.firebase.google.com | Spark/Blaze | Bkz. seed.js |

### Python Paketleri
```bash
pip install aiohttp Pillow blurhash openai numpy firebase-admin
```

---

## 🎯 ADIM ADIM ÇALIŞTIRMA

### ADIM 1: Pilot Batch Hazırla (✅ HAZIR)
```bash
python phase3_images/select_pilot_batch.py
# Output: phase3_images/pilot_batch.json (50 tarif, 13 cuisine)
```

### ADIM 2: Environment Variables Set Et
```bash
export UNSPLASH_ACCESS_KEY="your_key_here"
export PEXELS_API_KEY="your_key_here"
export PIXABAY_API_KEY="your_key_here"
export OPENAI_API_KEY="sk-..."
```

### ADIM 3: Pilot Pipeline'ı Çalıştır
```bash
# Önce dry-run (API çağrısı yapmaz, akış kontrolü)
python phase3_images/image_pipeline_v2.py --dry-run --limit 5

# Şimdi gerçek — 5 tarif test
python phase3_images/image_pipeline_v2.py --limit 5

# Memnun kalırsan 50 tarif (pilot)
python phase3_images/image_pipeline_v2.py
```

Çıktı:
```
output/
├── full/{recipe_id}.webp     # 1200×900 (~150 KB)
├── thumb/{recipe_id}.webp    # 400×300 (~30 KB)
├── blur/{recipe_id}.txt      # BlurHash placeholder
└── results_YYYYMMDD_HHMMSS.json
```

### ADIM 4: Sonuçları Manuel İncele
```bash
# 50 resme bak — kalite ve tutarlılığı doğrula
ls output/full/ | head
# Görsel inceleme: bir image viewer ile output/full/'a bak
```

**Kabul Kriterleri:**
- ✅ Kompozisyon tutarlı (top-down, doğal ışık)
- ✅ Türk yemekleri authentic
- ✅ AI üretimleri Instagram filtreden uzak
- ✅ Stok fotoğraf hissi yok

**Yetersizse:**
- Prompt iterate et (`migrate_to_v2.py`'deki `build_ai_prompt`)
- `MATCH_SCORE_THRESHOLD`'u arttır (kalite filtresi sıkı)
- Sadece o tariflerin id'lerini bir liste yap, AI-only modda yeniden üret

### ADIM 5: Firebase'e Yükle
```bash
python phase3_images/upload_to_firebase.py \
  --service-account /path/to/serviceAccount.json \
  --bucket my-project.appspot.com \
  --results output/results_20260519_120000.json \
  --output-dir output/
```

Bu komut:
1. Storage'a `recipes/tr/full/...`, `recipes/tr/thumb/...` upload
2. Firestore `recipes_tr/{id}.image` günceller
3. Firestore `image_jobs/{job_id}` status = 'review'
4. Firestore `image_review_queue` ekler

### ADIM 6: Admin Review (Tarayıcıdan)
Firebase Console → Firestore → `image_review_queue` koleksiyonunu kontrol et.
Resimleri tek tek:
- ✅ Approve: `image_status: 'ready'`, `published_at: now()` set et
- ❌ Reject: `image_jobs` status'ı 'pending' yap, AI prompt iterate et, yeniden üret

İlerleyen aşamada bu işlemi yapmak için **Admin Dashboard** (React/Next.js) yapılır.

### ADIM 7: Tam Ölçeğe Geç (Yavaş Yavaş)
50 pilot başarılı olunca:
```bash
# Bir kategoriyi hedefle (günde 200-300)
python phase3_images/image_pipeline_v2.py \
  --input phase3_images/category_breakfast.json \
  --output ./output_breakfast/

# 1-2 hafta boyunca her gün
# Premium tarifler öncelikli (image_jobs.priority = 1)
```

---

## 💰 MALİYET TAKİBİ

Her run sonunda `results_*.json` içinde:
```json
{
  "summary": {
    "total": 50,
    "success": 48,
    "failed": 2,
    "source_distribution": {
      "unsplash": 25,
      "pexels": 8,
      "pixabay": 3,
      "dalle": 12
    },
    "dalle_calls": 12,
    "total_cost_usd": 0.48
  }
}
```

**Tahmin (2500 tarif tam ölçek):**
- Unsplash 45% (1125): $0
- Pexels 15% (375): $0  
- Pixabay 5% (125): $0
- DALL-E 25% (625): $25
- Flux 10% (250): $14
- **TOPLAM: ~$40-60**

---

## 🚨 SORUN GİDERME

### Unsplash 403 Forbidden
- API key Production tier mi? (Demo tier saatte 50 değil 50/saat per app)
- Başvuru süreci: https://unsplash.com/developers → "Production access" talep et

### DALL-E "content_policy_violation"
- Prompt çok agresif kelimeler içeriyor olabilir
- `migrate_to_v2.py`'de prompt'tan "raw"/"authentic"/"rustic" gibi kelimeleri iterate et

### Tutarsız stil
- AI'ı `--ai-only` modunda yeniden üret
- AI prompt'a daha spesifik referanslar ekle: "shot in style of Bon Appétit magazine"

### Rate limit
- Pipeline `semaphore = 3` ile sınırlı, asla limit aşmaz
- 2500 tarif için saatte ~50 işlenir → tam ölçek **3-4 gün**

---

## 📊 İLERLEME TAKİBİ

Firestore Console üzerinden:
```javascript
// Pending kalan kaç?
db.collection('image_jobs').where('status', '==', 'pending').count()

// Review bekleyen
db.collection('image_jobs').where('status', '==', 'review').count()

// Ready (yayında)
db.collection('image_jobs').where('status', '==', 'ready').count()

// Failed
db.collection('image_jobs').where('status', '==', 'failed').count()
```

---

## 🎯 SONRAKİ ADIMLAR

✅ Faz 3.1 — Firebase backend hazır
🟡 Faz 3.2 — **Image pipeline ÇALIŞTIR** (BU AŞAMA)
⏭️ Faz 3.3 — 12 dile çeviri
⏭️ Faz 4 — App'te 3 modlu UX
