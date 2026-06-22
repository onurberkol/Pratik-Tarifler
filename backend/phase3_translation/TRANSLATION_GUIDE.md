# 🌍 Translation Pipeline — Çalıştırma Rehberi (Faz 3.3)

> **2500 TR tarifi 12 dile çevirmek için adım adım**

---

## ✅ ÖN KOŞULLAR

### API Anahtarı (1 hesap yeterli)
```bash
# Anthropic Console: https://console.anthropic.com/
# Settings → API Keys → Create Key
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Python Paketleri
```bash
pip install anthropic firebase-admin
```

---

## 💰 BEKLENEN MALİYETLER

Detaylı analiz (50 sample tarif üzerinden):
- Ortalama prompt: **~3700 karakter (~930 token)**
- Ortalama output: **~750 token**

| Model | 1 Tarif | 1 Dil (2500) | 12 Dil (30K) |
|-------|---------|--------------|--------------|
| Haiku 3.5 | $0.0012 | $2.93 | **$35** |
| Haiku 4.5 | $0.0047 | $11.71 | **$140** |
| Sonnet 4 | $0.015 | $38 | $456 |

> **ÖNERİ:** Pilot için Haiku 4.5 (daha kaliteli), tam ölçek için Haiku 3.5 ($35).
> Yöresel Türk tariflerine sadece spot-check Sonnet eklenebilir.

---

## 🎯 ADIM ADIM ÇALIŞTIRMA

### ADIM 1: Dry-Run Doğrulama
```bash
# Prompt yapısını gör, API çağrısı yok
python phase3_translation/translate_recipes.py \
  --dry-run --target en --limit 3

# Çıktı: 3 tarif için prompt önizleme + tahmini token
```

### ADIM 2: Pilot — 3 Tarifi Gerçekten Çevir
```bash
export ANTHROPIC_API_KEY="sk-ant-..."

# Hızlı test (3 tarif × 1 dil = ~$0.004)
python phase3_translation/translate_recipes.py \
  --target en --limit 3
```

**Çıktıya bak:**
- `phase3_translation/output/results_en.json` — tam sonuçlar
- `phase3_translation/output/recipes_en_firestore.json` — Firestore-ready

```bash
# Çevrilen tarifleri incele
cat phase3_translation/output/recipes_en_firestore.json | jq '."tr-menemen" | {title, description}'
```

### ADIM 3: Pilot Batch — 50 Tarif (~$0.06)
```bash
python phase3_translation/translate_recipes.py \
  --target en --limit 50
```

- Kalite kontrolü yap (5-10 tarif manuel oku)
- Yanlış çeviriler varsa promptu iterate et
- Memnun kaldığında devam

### ADIM 4: Tam Ölçek — Bir Dil (~$3)
```bash
# Bir dil için 2500 tarif (~30 dk - 1 saat)
python phase3_translation/translate_recipes.py --target en
```

### ADIM 5: Tüm 12 Dil (~$35, 12 saat)
```bash
# Tüm dilleri sıralı çalıştır
python phase3_translation/translate_recipes.py --target all
```

> ⏱️ **Süre:** 12 dil × 2500 tarif = 30K çeviri. Concurrent=5 ile saatte ~3000 = **10 saat**
> Parallel olarak farklı dilleri ayrı terminal'lerde çalıştırırsan **2-3 saat**

### ADIM 6: Firestore'a Yükle
```bash
# Tek dil
python phase3_translation/upload_translations.py \
  --service-account /path/to/serviceAccount.json \
  --lang en

# Veya hepsi
python phase3_translation/upload_translations.py \
  --service-account /path/to/serviceAccount.json \
  --all
```

---

## 🔍 KALITE KONTROL

### Otomatik Validation
`translate_recipes.py` zaten kontrol eder:
- ✅ Step sayısı korunmuş mu
- ✅ Ingredient note sayısı korunmuş mu
- ✅ Tips sayısı korunmuş mu
- ✅ Title boş değil

### Manuel Spot Check Önerisi
Her dilden rastgele 25 tarif seç (=300 total) — yaklaşık 1 günlük iş:
```bash
# Rastgele örnek seç
python -c "
import json, random
with open('phase3_translation/output/recipes_en_firestore.json') as f:
    data = json.load(f)
sample = random.sample(list(data.values()), 25)
for r in sample:
    print(f\"\n📋 {r['id']}\")
    print(f\"   TR: {r.get('source_title', '?')}\")
    print(f\"   EN: {r['title']}\")
    print(f\"   Desc: {r['description'][:100]}\")
"
```

### Yöresel Türk Yemekleri Özel Kontrolü
Bu tariflerin çevirisi en kritik — özgünlük korunmuş mu:
- Menemen, Lahmacun, Köfte, Manti
- Karnıyarık, İmam Bayıldı
- Baklava, Künefe, Kazandibi
- Sucuklu, Pastırmalı tarifler

```bash
python -c "
import json
critical_ids = ['tr-menemen', 'tr-lahmacun-ev', 'tr-baklava-fistikli', 'tr-imam-bayildi', 'tr-karniyarik']
with open('phase3_translation/output/recipes_en_firestore.json') as f:
    data = json.load(f)
for cid in critical_ids:
    if cid in data:
        r = data[cid]
        print(f\"\n📋 {cid}: {r['title']}\")
        print(f\"   {r['description']}\")
"
```

---

## 🚨 SORUN GİDERME

### JSON Parse Errors
Claude bazen JSON dışı text döndürebilir. Pipeline 3 kez retry yapar.
Eğer hala başarısız:
- `--temperature` 0.3 → 0.5'e çık (daha esnek)
- Prompt'a daha sert format kural ekle

### "needs_review" Etiketleri
- Step/ingredient sayısı bozulmuş tarifler
- Pipeline bunları `recipes_xx_firestore.json`'a yine kaydeder
- Admin tarafından sonradan düzeltilir

### Yavaş Hızlanma
```bash
# Concurrent'i arttır (Anthropic tier 1 = 50 RPM)
# translate_recipes.py içinde Config.MAX_CONCURRENT = 10
```

### Rate Limit (429)
Pipeline otomatik 3 kez retry yapar (2s, 4s, 8s gecikmelerle).
Sürekli 429 alıyorsan:
- Tier upgrade
- MAX_CONCURRENT'ı 3'e düşür

---

## 📊 İLERLEME TAKİBİ

```bash
# Pipeline çalışırken başka terminalde:
watch -n 5 "ls -la phase3_translation/output/ | tail -20"

# Tamamlanan tarif sayısı:
jq 'length' phase3_translation/output/recipes_en_firestore.json
```

---

## 🎯 SONRAKİ ADIM

✅ Faz 3.1 — Firebase backend kuruldu
✅ Faz 3.2 — Image pipeline hazır (görseller toplanıyor)
✅ Faz 3.3 — **Translation pipeline ÇALIŞTIRMAYA HAZIR** (bu aşama)
⏭️ Faz 4 — App'te 3 modlu UX (en son)

### Önerilen Sıra
1. **Önce EN** (en büyük pazar, en hızlı feedback)
2. Sonra DE + FR + ES (büyük Avrupa)
3. Sonra IT + PT + EL + NL
4. En son RU + SR + AR + HE
