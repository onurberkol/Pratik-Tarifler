# 📸 Pratik Tarifler — Faz 3 Görsel Stratejisi (v1.0)

## 🎯 HEDEF
2500 tarifin her biri için **AYNI STANDARTTA, AYNI ESTETİKTE** profesyonel kalite tarif fotoğrafı.
- Bulabilirsek: telif-haksız kaynaklardan (Unsplash, Pexels, Pixabay)
- Bulamazsak: AI ile üretim (DALL-E 3, Stable Diffusion, Flux)
- Hepsi: aynı estetik kuralları altında

---

## 🎨 GÖRSEL STANDARTLARI (Style Bible)

### Boyut & Format
- **Çözünürlük:** 1200x900 px (4:3 oranı)
- **Format:** WebP (kalite 85), JPG fallback
- **Hedef boyut:** ~150 KB per resim
- **Renk profili:** sRGB
- **Toplam:** 2500 × 150 KB = ~375 MB total storage

### Stil Kuralları
| Kural | Değer |
|-------|-------|
| **Açı** | Top-down (45° opsiyonel — yemeğe göre) |
| **Işık** | Doğal, yumuşak, soldan |
| **Arka plan** | Tarafsız (ahşap, mermer, beyaz, açık gri) |
| **Sunum** | Sade, gerçekçi (Instagram-style minimal) |
| **Kompozisyon** | Yemek %70, prop %20, boşluk %10 |
| **Renk paleti** | Sıcak (Türk yemekleri), soğuk (modern) |
| **Doku** | Net, gerçekçi, abartısız |
| **Stil** | NO instagram filtreleri, NO aşırı işleme |

### KAÇINILACAKLAR
- ❌ Stok fotoğraf çakışması (CocaCola masada, AI watermark)
- ❌ Aşırı şık restoran sunumu (gerçek değil)
- ❌ Karikatürize/cizgi tarz
- ❌ Beyaz arka plan + reklamcılık tarzı
- ❌ Üzerinde yazı/grafik

---

## 📊 KAYNAK STRATEJİSİ

### Kaynak Önceliği (sırasıyla deneyip)

```
1. UNSPLASH (en kaliteli, telifsiz, ~60% klasik yemek bulunur)
   ↓ bulunamazsa
2. PEXELS (Unsplash alternatifi)
   ↓ bulunamazsa
3. PIXABAY (geniş havuz, kalite değişken)
   ↓ bulunamazsa
4. AI GENERATION (DALL-E 3 / Flux Pro)
   ↓ memnun değilsen
5. MANUEL DÜZELTME (kullanıcı/admin override)
```

### Tahmini Dağılım (2500 tarif için)
| Kaynak | % | Adet | Tahmini Maliyet |
|--------|---|------|-----------------|
| Unsplash | %45 | 1125 | $0 (free) |
| Pexels | %15 | 375 | $0 (free) |
| Pixabay | %5 | 125 | $0 (free) |
| AI (DALL-E 3) | %25 | 625 | $0.040 × 625 = **$25** |
| AI (Flux Pro) | %10 | 250 | $0.055 × 250 = **$14** |
| **TOPLAM** | %100 | 2500 | **~$40-60** |

> **Not:** DALL-E 3 standard quality $0.040, HD $0.080. Flux Pro $0.055.
> Yöresel Türk yemekleri için DALL-E 3 + özel prompt mühendisliği şart.

---

## 🏗️ FIREBASE MİMARİSİ (Görsel Odaklı)

### Storage Yapısı
```
firebasestorage://pratik-tarifler-images/
├── recipes/
│   ├── tr/
│   │   ├── full/             # 1200x900 ana resim
│   │   │   ├── tr-mercimek-corbasi.webp
│   │   │   ├── tr-su-boregi.webp
│   │   │   └── ...
│   │   ├── thumb/            # 400x300 thumbnail (liste/grid)
│   │   │   ├── tr-mercimek-corbasi.webp
│   │   │   └── ...
│   │   ├── blur/             # 40x30 LQIP (placeholder)
│   │   │   ├── tr-mercimek-corbasi.webp
│   │   │   └── ...
│   │   └── step_thumbnails/  # OPSIYONEL: adım resimleri ileride
│   ├── en/ (gelecekte aynı path, çeviri sonrası)
│   ├── de/
│   └── ...
```

### Firestore Doküman Şeması (GÜNCELLENMİŞ)
```json
{
  "id": "tr-mercimek-corbasi",
  "title": "Mercimek Çorbası",
  // ... mevcut alanlar
  
  // YENİ GÖRSEL ALANLARI:
  "image": {
    "url_full": "https://firebasestorage.googleapis.com/.../full/tr-mercimek-corbasi.webp",
    "url_thumb": "https://firebasestorage.googleapis.com/.../thumb/tr-mercimek-corbasi.webp",
    "blur_hash": "L9AS}j%MIUofWBj[ayfQayofj[fQ",  // 40x30 base64 placeholder
    "width": 1200,
    "height": 900,
    "source": "unsplash",  // unsplash | pexels | pixabay | dalle | flux | manual
    "source_id": "ABC123",  // Unsplash photo ID veya AI generation ID
    "photographer": "John Doe",  // Atıf gerekli kaynaklar için
    "photographer_url": "https://unsplash.com/@johndoe",
    "license": "unsplash",  // unsplash | pexels | pixabay | ai-generated | custom
    "created_at": "2026-05-19T10:00:00Z",
    "status": "ready"  // pending | searching | generating | review | ready | failed
  },
  
  "image_status": "ready"  // hızlı sorgu için (status alanı duplike, indexlenir)
}
```

### Firestore Koleksiyonları
```
firestore/
├── recipes_tr/              # Ana koleksiyon, dil bazlı
│   └── {recipe_id}: { ...recipe + image: {...} }
├── image_jobs/              # GÖRSEL İŞ KUYRUĞU (yeni!)
│   └── {job_id}: {
│         recipe_id: "tr-mercimek-corbasi",
│         status: "pending|searching|generating|review|done",
│         attempts: [
│           { source: "unsplash", result: "no_match", at: "..." },
│           { source: "dalle", result: "generated", url: "...", at: "..." }
│         ],
│         current_image_url: "...",
│         requires_review: true,
│         created_at: "...",
│         updated_at: "..."
│       }
├── image_review_queue/      # ADMİN İNCELEME (yeni!)
│   └── {recipe_id}: { url, source, score, ... }
└── translations_xx/         # Çevirilerden sonra (Faz 3 sonraki adım)
    └── ...
```

### CDN & Caching
- **Firebase Hosting CDN** otomatik (Storage URL'leri global cache)
- **App-side cache:** AsyncStorage'da son 100 resim 7 gün
- **Progressive loading:** blur_hash → thumb → full

---

## 🔄 PİPELİNE — Adım Adım Yavaş Yavaş

### FAZ 3.1 — Hazırlık (1-2 gün)
- [ ] Firebase Storage bucket kur
- [ ] Service account JSON üret
- [ ] API anahtarları: Unsplash (Production), Pexels, OpenAI, BlurHash
- [ ] Image jobs koleksiyonunu Firestore'da kur
- [ ] Admin review UI taslağı

### FAZ 3.2 — Pilot Batch (1 gün) — **ÖNEMLİ**
- 50 farklı tarif seç (her kategoriden 3-4)
- Pipeline'ı uçtan uca çalıştır
- Sonuçları manuel incele:
  - Hangi tarifler Unsplash'te bulundu?
  - DALL-E sonuçları yeterli mi?
  - Stil tutarlı mı?
- Prompt'ları iterate et

### FAZ 3.3 — Toplu Üretim (1-2 hafta, yavaş yavaş)
- Günde 200-300 tarif (rate limit + maliyet kontrolü)
- Her batch sonrası admin review queue'ya 10-20 rastgele örnek
- Reddedilenler için tekrar üretim (farklı kaynak/prompt)

### FAZ 3.4 — Kalite Kontrolü (3-5 gün)
- Tüm 2500 resmin admin tarafından gözden geçirilmesi
- Stil sapmaları yeniden üretilir
- Final approval

### FAZ 3.5 — Optimizasyon (1-2 gün)
- WebP dönüştürme
- Thumbnail üretimi (sharp/imagemagick)
- BlurHash üretimi
- Firebase Storage'a upload
- Firestore'a URL'leri yaz

---

## 🤖 PROMPT KÜTÜPHANESİ (AI Üretim İçin)

### Base Prompt Template
```
{recipe_title}, traditional Turkish home-cooked food, 
top-down view, natural soft window light from left, 
rustic wooden table or marble surface, 
shallow depth of field, professional food photography, 
authentic Turkish presentation, no text, no watermarks, 
photorealistic, warm color tones, minimal styling, 
cookbook style, 4:3 aspect ratio, --style raw --quality 2
```

### Yöresel Türk Yemekleri (Özel Prompt)
```
Authentic {recipe_title} from {region}, 
served in traditional copper/ceramic vessel, 
fresh herbs garnish, soft natural lighting, 
homemade rustic feel, Anatolian table setting, 
{key_ingredients} visible, 
photorealistic, 1200x900, magazine quality
```

### Modern/Akdeniz Yemekleri
```
{recipe_title}, Mediterranean cuisine, 
white plate on marble surface, 
fresh herbs and lemon wedges, 
bright natural light from above, 
minimalist styling, modern food photography, 
high contrast, vibrant colors, photorealistic
```

### Tatlılar
```
{recipe_title}, dessert close-up, 
served on vintage ceramic plate, 
soft diffused window light, 
syrup glaze visible, garnish detail, 
warm bakery atmosphere, 
indulgent food photography, photorealistic
```

### Kahvaltılıklar
```
Turkish breakfast spread featuring {recipe_title}, 
overhead flat lay, copper teapot in corner, 
fresh tomatoes, cucumber, olives, cheese, 
morning light, cozy home kitchen vibe, 
authentic Turkish breakfast culture, photorealistic
```

---

## 🛠️ TEKNİK İMPLEMENTASYON İSKELETI

### Sözde-kod: Toplu Resim Pipeline
```python
async def process_recipe_image(recipe):
    # 1. Önce job kaydı
    job = create_image_job(recipe.id)
    
    # 2. Anahtar terimler çıkar (TR → EN translit)
    search_terms = extract_search_terms(recipe)
    
    # 3. Kaynak öncelik sırasıyla dene
    for source in ['unsplash', 'pexels', 'pixabay']:
        result = await search_image(source, search_terms)
        if result and result.score > 0.75:
            # Yeterli kalite, indir + işle
            image = await download(result.url)
            break
    else:
        # Bulamadı, AI üret
        prompt = build_prompt(recipe)
        image = await generate_ai_image('dall-e-3', prompt)
        source = 'dalle'
    
    # 4. Standardize et (boyut, format, renk)
    full = resize_and_convert(image, 1200, 900, 'webp', quality=85)
    thumb = resize_and_convert(image, 400, 300, 'webp', quality=80)
    blur = generate_blurhash(image)
    
    # 5. Firebase Storage'a yükle
    full_url = await upload_to_storage(f'recipes/tr/full/{recipe.id}.webp', full)
    thumb_url = await upload_to_storage(f'recipes/tr/thumb/{recipe.id}.webp', thumb)
    
    # 6. Firestore'a yaz
    await update_recipe(recipe.id, {
        'image': {
            'url_full': full_url,
            'url_thumb': thumb_url,
            'blur_hash': blur,
            'source': source,
            'status': 'review'  # admin onayı bekliyor
        }
    })
    
    # 7. Review queue'ya ekle
    await add_to_review_queue(recipe.id)
```

---

## 💰 NIHAİ MALİYET TAHMİNİ

| Kalem | Maliyet |
|-------|---------|
| AI image generation (~875 resim, hibrit DALL-E + Flux) | **$40-60** |
| Firebase Storage (~400 MB, 1 yıl) | ~$0.10/ay = **$1.20/yıl** |
| Firebase egress (CDN traffic, 10K user × 50 image/ay) | **$5-10/ay** |
| API costs (Unsplash, Pexels — free tier yeterli) | $0 |
| **TOPLAM tek seferlik** | **~$50** |
| **Aylık operasyonel** | **~$10** |

> Bu sadece **TR için**. 12 dile çevirisi yapılırsa görsel maliyet 0 olur (aynı resimleri kullanırız, dil bazlı).

---

## ✅ BAŞARI METRİKLERİ

| Metrik | Hedef |
|--------|-------|
| Toplam tarif görselleri | 2500/2500 (%100) |
| Unsplash/Pexels oranı | ≥%60 (telif güvenli) |
| AI oranı | ≤%40 |
| Görsel boyut tutarlılığı | %100 (1200x900) |
| Admin onay oranı | ≥%85 ilk üretimde |
| Ortalama yüklenme süresi (3G) | <2 saniye thumb |
| Stil tutarlılığı (manuel skor 1-10) | ≥8/10 |

---

## 🎯 SONRAKİ ADIM

**Önerim:** FAZ 3.1 → Hazırlık + 50 tariflik **PILOT** ile başlayalım.
- Önce pipeline'ı 50 tarifle test et
- Sonuçlara bakıp prompt'ları iterate et
- Tam memnun olunca 2500'e ölçekle
