# 🌍 Pratik Tarifler — Çeviri Stratejisi (Faz 3.3)

> **2500 TR tarifin 12 dile çevrilmesi** — kalite, maliyet ve zaman optimizasyonu

---

## 🎯 HEDEF DİLLER

| Dil | Kod | Öncelik | Konuşur Sayısı | Pazar Notu |
|-----|-----|---------|----------------|------------|
| İngilizce | `en` | 🥇 1 | 1.5B | Uluslararası standart |
| Almanca | `de` | 🥈 2 | 130M | Türk göçmenler büyük pazar |
| Fransızca | `fr` | 🥈 2 | 280M | Akdeniz/Magreb yakın |
| Hollandaca | `nl` | 🥉 3 | 24M | Türk diaspora |
| İtalyanca | `it` | 🥉 3 | 65M | Mediterranean yakın |
| İspanyolca | `es` | 🥉 3 | 500M | Latin pazarı |
| Portekizce | `pt` | 4 | 260M | Brezilya/PT |
| Yunanca | `el` | 4 | 13M | Komşu/benzer mutfak |
| Rusça | `ru` | 4 | 260M | Türki dünya |
| Sırpça | `sr` | 5 | 9M | Balkan |
| Arapça | `ar` | 5 | 420M | Orta Doğu (RTL!) |
| İbranice | `he` | 5 | 9M | Komşu (RTL!) |

**Toplam:** 12 dil × 2500 tarif = **30.000 tarif çevirisi**

---

## 📐 ÇEVRİLECEK ALANLAR

### ✅ ÇEVRİLİR (her dilde farklı)
```typescript
{
  title: string;              // "Mercimek Çorbası" → "Lentil Soup"
  description: string;        // Tam cümle çevrilir
  ingredients: [{
    note: string;             // "kırmızı mercimek" → "red lentil"
    // amount: SADELEŞTİR/LOKALİZE: "1 su bardağı" → "1 cup" (en), "240 ml" (de)
  }],
  steps: [{
    title: string;            // "Soğan kavur" → "Sauté the onion"
    body: string;             // Tam talimat
  }],
  tips: string[];             // İpuçları çevrilir
  search_keywords: string[];  // Yeniden üretilir (token + dil-spesifik kelimeler)
}
```

### 🔒 SABİT KALIR (tüm dillerde aynı)
```typescript
{
  id: string;                          // "tr-mercimek-corbasi" (slug değişmez)
  schema_version: 2;
  ingredient_tokens: string[];         // ["lentil", "onion"] — uluslararası token
  primary_ingredients: string[];       // Aynı
  cuisine: string;                     // "turkish"
  diet_tags: string[];                 // ["vegan", "gluten_free"]
  meal_type: string[];                 // ["lunch", "dinner"]
  difficulty: string;                  // "easy"
  total_time_min: number;              // 35
  active_time_min: number;
  servings: number;
  is_premium: boolean;
  rating_avg: number;                  // global rating
  rating_count: number;
  
  image: { ... };                      // GÖRSEL TEK SEFER → tüm diller paylaşır 🔥
  image_status: string;
}
```

> **KRİTİK:** Görseller dile bağımsız! 2500 görsel tek seferlik üretilir, 12 dilin hepsi aynı `url_full`'u kullanır. **400 MB total storage** (12× değil).

---

## 🤖 PROVIDER KARŞILAŞTIRMASI

### Sözcük başına ortalama maliyet ($)

| Provider | $/M karakter | Kalite (1-10) | Hız | Özellik |
|----------|--------------|---------------|-----|---------|
| **DeepL** | $25 | **9.5** | Hızlı | En kaliteli, yiyecek alanında zayıf değil |
| **GPT-4o** | $5 (input), $15 (output) | 9 | Orta | Bağlam koruması mükemmel |
| **Claude 3.5 Sonnet** | $3 (input), $15 (output) | 9 | Orta | Yemek bağlamı + ton koruma |
| **Google Translate** | $20 | 7 | Çok hızlı | Cheap, fakat formal/robotik |
| **Azure Translate** | $10 | 7.5 | Hızlı | Toplu için iyi |
| **Anthropic Claude Haiku** | $0.25 (input), $1.25 (output) | 8 | Hızlı | Maliyet/kalite oranı yüksek |

### Toplam Hacim Tahmini
- Ortalama tarif boyutu: ~1500 karakter (TR)
- 2500 tarif × 1500 = **3.75M karakter / dil**
- 12 dil × 3.75M = **45M karakter toplam**

### Maliyet Tahmini

| Provider | 1 dil (3.75M char) | 12 dil (45M char) |
|----------|-------------------|-------------------|
| DeepL | $94 | **$1,125** |
| GPT-4o (input+output ~3x) | $75 | **$900** |
| Claude Sonnet 3.5 | $60 | **$720** |
| Google Translate | $75 | **$900** |
| **Claude Haiku** | $5 | **$60** ✅ |

> **ÖNERİM:** **Hibrit Yaklaşım**
> - **Claude Haiku** (toplu çeviri, $60) — tüm tarifler için ana çevirmen
> - **GPT-4o / DeepL** (~%5 quality review) — Türk yöresel terimler ($50)
> - **TOPLAM: ~$110-150** (insan editörü olmadan)

---

## 🏗️ ÇEVİRİ MİMARİSİ

### Veri Akışı
```
recipes_tr/{recipe_id}
       │
       ├──► translation_jobs/{job_id} (status: pending)
       │
       ▼
  [Cloud Function: translateRecipe]
       │
       ├──► Claude Haiku API
       │     • Tüm metin alanlarını batch çevirir
       │     • Yemek bağlamını korur
       │
       ├──► Validation
       │     • Token sayısı korunmuş mu
       │     • JSON şema bozulmamış mı
       │     • Pişirme terimleri doğru mu
       │
       └──► recipes_{xx}/{recipe_id} (kayıt)
```

### Firestore Koleksiyonları (YENİ)

#### `translation_jobs/{job_id}`
```typescript
{
  job_id: string;              // "trans_tr_en_mercimek-corbasi"
  recipe_id: string;
  source_lang: "tr";
  target_lang: "en" | "de" | ...;
  status: "pending" | "translating" | "review" | "done" | "failed";
  
  provider: "claude-haiku" | "gpt-4o" | "deepl";
  attempts: TranslationAttempt[];
  
  cost_usd: number;
  tokens_used: { input: number; output: number };
  
  // Kalite
  validation_passed: boolean;
  warnings: string[];           // ["pişirme terimi tutarsız", ...]
  
  created_at: Timestamp;
  completed_at: Timestamp | null;
}
```

#### `translation_review_queue/{job_id}`
Admin'in incelemesi için:
```typescript
{
  recipe_id: string;
  target_lang: string;
  source_text: { title, description, ... };
  translated_text: { title, description, ... };
  warnings: string[];
  decision: "approved" | "needs_edit" | "rejected" | null;
  reviewer_id: string | null;
  reviewed_at: Timestamp | null;
}
```

---

## 🎨 KÜLTÜREL UYARLAMA KURALI

### 1. ÖLÇÜ BİRİMLERİ (Ülke bazlı)
```python
unit_localization = {
    "en": {"su_bardagi": "cup", "yemek_kasigi": "tbsp", "cay_kasigi": "tsp", "gram": "g (~0.04 oz)"},
    "de": {"su_bardagi": "Tasse (240ml)", "yemek_kasigi": "EL", "cay_kasigi": "TL", "gram": "g"},
    "fr": {"su_bardagi": "tasse (240ml)", "yemek_kasigi": "c. à soupe", "cay_kasigi": "c. à café", "gram": "g"},
    "es": {"su_bardagi": "taza", "yemek_kasigi": "cda", "cay_kasigi": "cdta", "gram": "g"},
    "it": {"su_bardagi": "tazza", "yemek_kasigi": "cucchiaio", "cay_kasigi": "cucchiaino", "gram": "g"},
    # ...
}
```

### 2. PİŞİRME TERİMLERİ — KONSİSTENS SÖZLÜĞÜ
Her dile özel **glossary** (sözlük):
```yaml
# glossary_en.yml
sauté: "kavur" / "söndür" / "kavurma" → "sauté"
boil: "haşla" / "kayna" → "boil"
simmer: "kıs ateşte pişir" → "simmer"
fold: "harman et" → "fold in"
whisk: "çırp" → "whisk"
brown: "altın et" → "brown"
caramelize: "karamelize et" → "caramelize"
```

### 3. KÜLTÜREL OLARAK ÖZEL TERİMLER (transliterate, ÇEVİRME)
```python
# Türk yemek isimleri her dilde aynı kalır
keep_original = [
    "menemen", "pide", "lahmacun", "köfte", "döner", "kebap", "kebab",
    "baklava", "künefe", "katmer", "böreği", "dolma", "sarma",
    "ayran", "raki", "rakı", "bulgur", "yufka",
    "simit", "açma", "lokum", "halva", "helva"
]

# Bu kelimeler İngilizcede de "menemen" kalır, açıklama parantez içinde:
# Title: "Menemen (Turkish-style scrambled eggs with peppers)"
```

### 4. DİL ÖZELLİKLERİ
- **Arapça (`ar`) ve İbranice (`he`):** RTL (sağdan sola) — app rendering ayrı (✅ React Native otomatik)
- **Almanca:** Compound word ("Hackfleischpfanne") — bağlamı sıkı tut
- **Rusça:** Cyril — fontlar dahil

---

## 📋 ÇEVİRİ PROMPT'U (Claude Haiku için)

```python
TRANSLATION_PROMPT = """
You are a professional culinary translator specializing in Turkish cuisine.

Translate the following recipe from Turkish to {target_language}.

CRITICAL RULES:
1. Preserve the JSON structure EXACTLY — only translate string values
2. DO NOT translate ingredient tokens or recipe ID
3. Keep Turkish dish names in their original form, add brief clarification in parentheses if needed
   Example: "Menemen" → "Menemen (Turkish scrambled eggs)" only on first mention in title
4. Use {target_language} cooking terminology naturally (e.g., "sauté" not "fry slowly")
5. Adapt measurements where helpful:
   - "1 su bardağı" → "1 cup (240 ml)" for English
   - "1 yemek kaşığı" → "1 tablespoon"
6. Keep tone warm and accessible (home cook level, not Michelin)
7. Time references stay in minutes (do not change "20 dakika" → "20 min")

CULTURAL CONTEXT:
- This dish is from {cuisine} cuisine
- Difficulty: {difficulty}
- Meal type: {meal_type}

GLOSSARY (use these specific translations for consistency):
{glossary_terms}

JSON INPUT:
{source_json}

Return ONLY valid JSON in same structure, with translated string fields.
"""
```

---

## 🚀 İŞ AKIŞI

### Faz 3.3.1 — Hazırlık (1 gün)
- [ ] Anthropic API key al
- [ ] Glossary'leri hazırla (her dil için 50-100 terim)
- [ ] Translation jobs koleksiyonunu Firestore'da kur

### Faz 3.3.2 — Pilot Çeviri (1 gün)
- 50 tarif × 1 dil (en) = test
- Validation script
- Kalite kontrol

### Faz 3.3.3 — Toplu Çeviri (3-5 gün)
- 2500 tarif × 12 dil
- Paralel batch'ler (10'arlı gruplar)
- Her dil ayrı job → `recipes_{xx}` koleksiyonuna yazılır

### Faz 3.3.4 — Kalite Kontrol (2-3 gün)
- %5 manuel inceleme (~125 tarif/dil)
- Hataları işaretle, prompt iterate et, batch re-run

---

## 💰 NIHAİ MALİYET TAHMİNİ

| Kalem | Maliyet |
|-------|---------|
| **Claude Haiku** (ana çeviri, 12 dil) | $60-80 |
| **Spot check GPT-4o** (kalite kontrol, %5) | $50 |
| **Glossary hazırlık** (insan, opsiyonel) | $0-500 |
| **Validation Cloud Function** çalışma | $5 |
| **TOPLAM** | **~$115-635** |

> **MVP ile başla:** Sadece **EN + DE + FR** (en büyük pazarlar) → **$30** ile başla.
> Tüm 12 dil sonradan kademeli açılır.

---

## 🎯 ÖZEL DURUM: TARIF ÖZGÜN ALANLARININ KORUNMASI

Bazı tariflerin sadece Türk kültüründe anlamı var. Çeviride **kaybolmamalı:**

### Korunacak Türk yemek bağlamı:
- ✅ Adının yöre kökeni: "Tarsus Kebabı" → "Tarsus Kebab (from southern Turkey)"
- ✅ Geleneksel pişirme yöntemleri: "saç" → "sac (Turkish convex griddle)"
- ✅ Özgün malzeme adları: "isot biber" → "isot pepper (Urfa-style smoked pepper)"
- ✅ Festival/özel günler: "ramazan pidesi" → "Ramadan pide (special bread for fasting month)"

Bu, **tarif başına 5-10 saniye ekstra Claude düşünmesi** demek — ama ürünün **özgünlüğünü korur**.

---

## 🎬 SONRAKİ ADIM

✅ Mimari hazır  
🟡 **Translation pipeline scriptini yaz** (`translate_recipes.py`)  
⏭️ Pilot 50 tarif × 1 dil (en) test  
⏭️ Tam ölçek 2500 × 12  
⏭️ Faz 4 → 3 modlu UX
