# 📸 Screenshot Rehberi — Pratik Tarifler

> Apple ve Google için screenshot tasarım rehberi. Conversion rate'i 2-3x artırır.

---

## 📏 BOYUTLAR

### iOS (App Store Connect)
| Cihaz | Boyut (px) | Adet | Zorunlu? |
|-------|-----------|------|----------|
| **iPhone 6.9"** (15 Pro Max, 16 Pro Max) | 1320 × 2868 | min 3, max 10 | ✅ |
| **iPhone 6.5"** (11 Pro Max, XS Max) | 1242 × 2688 | min 3, max 10 | ✅ (auto-fallback varsa hayır) |
| iPhone 5.5" | 1242 × 2208 | min 3, max 10 | ❌ (eski cihaz) |
| iPad 13" Pro | 2064 × 2752 | min 3, max 10 | iPad app ise ✅ |

> **İpucu**: 6.9" en yüksek çözünürlük. Bunu hazırla, App Store Connect diğerleri için otomatik downscale yapar.

### Android (Play Console)
| Tip | Boyut | Adet |
|-----|-------|------|
| **Phone screenshots** | 1080 × 1920 önerilen (min 320, max 3840) | 2-8 |
| 7" Tablet | 1024 × 600+ | (opsiyonel) |
| 10" Tablet | 1280 × 800+ | (opsiyonel) |
| **Feature graphic** | 1024 × 500 | 1 (zorunlu) |

> **Format**: PNG (alpha kanalsız) veya JPG. Boyut < 8 MB.

---

## 🎬 SCREENSHOT SIRASI (KRİTİK!)

İlk 3 screenshot, App Store search sonuçlarında otomatik görünür. Bu 3'ü ALTIN.

### Screenshot 1 — HOOK (En önemli)
**Mesaj**: "Buzdolabını çek, AI tarif önersin"  
**Görsel**: 
- ModeSelectionScreen'in 3 modlu görünümü
- "🥘 Evdeki Kalanlarla" kartı vurgulu (zoom effect)
- Üst başlık: **"Buzdolabını çek 📸"**
- Alt başlık: "AI saniyeler içinde tarif önersin"

### Screenshot 2 — VALUE PROP
**Mesaj**: "2500+ tarif, sadece elindekilerle"  
**Görsel**:
- PantryResultsScreen — tarif kartları "✓ Tüm malzemen var" badge'leriyle
- Üst başlık: **"Markete gitmeden 🍳"**
- Alt başlık: "Elindeki malzemelerle 2500+ tarif"

### Screenshot 3 — DIFFERENTIATOR
**Mesaj**: "AI senin için bulsun"  
**Görsel**:
- PhotoCameraScreen + PhotoReviewScreen split
- Buzdolabı fotoğrafı → tanınan malzemeler chip'leri
- Üst başlık: **"Yapay zeka mutfağında 🤖"**
- Alt başlık: "60+ malzemeyi otomatik tanır"

### Screenshot 4 — Mod 2
**Mesaj**: "Eksik malzemeleri tek listede"  
**Görsel**:
- SupplyResultsScreen — "🛒 Eksik: tavuk, maydanoz"
- Shopping list export butonu vurgulu
- Üst başlık: **"Akıllı alışveriş listesi 🛒"**

### Screenshot 5 — Mod 3 (Discovery)
**Mesaj**: "14 dünya mutfağı"  
**Görsel**:
- DiscoverScreen — yatay scroll feed'ler, kategori chip'leri
- Üst başlık: **"14 mutfak, sınırsız tarif 🌍"**

### Screenshot 6 — Cook Mode
**Mesaj**: "Pişirme modu — eller meşgul"  
**Görsel**:
- CookModeScreen — büyük yazı, timer, "Sonraki adım" butonu
- Üst başlık: **"Pişirme modu 👩‍🍳"**
- Alt başlık: "Büyük yazı, sesli okuma, otomatik timer"

### Screenshot 7 — Premium
**Mesaj**: "Premium ile sınırsız"  
**Görsel**:
- SubscriptionScreen — 3 plan kartı, "7 gün ücretsiz" badge
- Üst başlık: **"Premium'u ücretsiz dene ✨"**

### Screenshot 8 — Social Proof / Çoklu Dil
**Mesaj**: "13 dilde, dünya çapında"  
**Görsel**:
- Recipe detail multiple language toggle preview
- Üst başlık: **"13 dilde keşfet 🌐"**

---

## 🎨 TASARIM KURALLARI

### Renkler
| Element | Renk | Hex |
|---------|------|-----|
| Background gradient (top) | Terracotta açık | `#F5C77E` |
| Background gradient (bottom) | Krem | `#FAF7F2` |
| Main text | Koyu kahve | `#2D2419` |
| Highlight text | Terracotta | `#D89A1E` |
| Premium accent | Altın | `#D4A847` |

### Tipografi
- **Başlık (Hook)**: 64-72pt, Bold, Sans-Serif (Inter veya SF Pro Display)
- **Alt başlık**: 36-44pt, Medium
- **App ekranı**: gerçek ekran görüntüsü, gölge ile

### Layout
```
┌────────────────────┐
│                    │ ← 12% boşluk
│   HOOK BAŞLIK      │
│   Alt açıklama     │ ← 18% header alanı
│                    │
│  ┌──────────────┐  │
│  │              │  │
│  │  GERÇEK      │  │ ← 70% ekran görüntüsü
│  │  EKRAN       │  │
│  │              │  │
│  └──────────────┘  │
│                    │ ← 12% boşluk
└────────────────────┘
```

### Stil
- **Konsist mat fon** (gradient veya solid)
- **Phone mockup** kullan (Pixel veya iPhone frame) — ekranın gerçek olduğunu gösterir
- **Drop shadow** + slight tilt (5-10°) — derinlik
- **Annotations**: kırmızı oklar, vurgu çemberleri (sparingly!)

---

## 🛠️ ÜRETIM YÖNTEMİ

### Seçenek A — Figma + Plugin (önerilen)
```
1. Figma'da yeni Frame: 1320x2868 (iOS 6.9")
2. Plugin: "Mockuuups Studio" veya "Angle Mockups" indir
3. Phone mockup'ı drag-drop
4. Gerçek ekran screenshot'ını mockup içine koy
5. Header text + alt text ekle
6. Export PNG @1x
```

### Seçenek B — Code (programmatic, batch için ideal)
```bash
# screenshot tooling
npm install -g app-store-screenshot-builder

# config (screenshots/builder.config.json)
{
  "device": "iPhone 16 Pro Max",
  "frames": [
    { "image": "raw/01_mode_selection.png", "text": "Buzdolabını çek 📸" },
    { "image": "raw/02_results.png", "text": "Markete gitmeden 🍳" }
  ]
}

# build
app-store-screenshot-builder build
```

### Seçenek C — Fastlane Snapshot (otomatik)
```bash
# iOS — UI test ile otomatik screenshot
fastlane snapshot init
# fastlane/Snapfile düzenle (cihaz listesi)
fastlane snapshot
```

---

## 🌐 LOCALIZED SCREENSHOTS

Her dil için **kendi screenshot setini** hazırla. Apple algoritma localized listing'i sever.

### Phase 1 (Launch)
- TR — Türkçe başlıklar
- EN — English başlıklar

### Phase 2
- DE — Almanca başlıklar
- FR — Fransızca başlıklar
- IT — İtalyanca başlıklar
- ES — İspanyolca başlıklar

> **Hata**: Aynı screenshot'a Türkçe başlık koyup tüm dillerde aynı kullanma. Algoritma ve user her ikisi de cezalandırır.

---

## 🎥 APP PREVIEW VIDEO (önerilir, zorunlu değil)

### iOS App Preview
| Özellik | Detay |
|---------|-------|
| Süre | 15-30 saniye |
| Boyut | 1080 × 1920 (portre) veya 1920 × 1080 |
| Format | .mov (H.264) |
| Ses | Optional (çoğu user mute izler) |
| Adet | iPhone başına 1, iPad başına 1 |

### İçerik akışı (30 saniye)
```
[0-3s]   Hook: "Akşam ne pişireyim?" sorusu
[3-7s]   Mod 1 demo: buzdolabı fotoğrafı çekme
[7-12s]  AI sonucu: malzeme tanıma
[12-18s] Tarif önerileri carousel
[18-23s] Recipe detail + cook mode
[23-28s] Ödülün: tabakta lezzet
[28-30s] Logo + "Pratik Tarifler" + CTA
```

### Müzik
Royalty-free, enerjik, instrumental:
- Epidemic Sound (önerilen, $15/ay)
- Artlist
- YouTube Audio Library (bedava)

---

## ✅ CHECKLİST — Yayın Öncesi

### Per language (TR + EN)
- [ ] Screenshot 1 (Hook) — 6.9" + 6.5"
- [ ] Screenshot 2 (Value) — 6.9" + 6.5"
- [ ] Screenshot 3 (Differentiator) — 6.9" + 6.5"
- [ ] Screenshot 4-8 (opsiyonel ama önerilen)
- [ ] App Preview Video (TR + EN)
- [ ] App Icon 1024x1024
- [ ] Feature Graphic 1024x500 (Play Store)
- [ ] Phone screenshots Play Store 1080x1920

### Quality check
- [ ] Tüm metinler hatasız, gramer kontrolü
- [ ] Real device data (test users'ın gerçek tarifleri, sample değil)
- [ ] No private info (gerçek e-mail, telefon, isim yok)
- [ ] Status bar dolu görünüyor (saat 9:41, signal full, batarya %100)
- [ ] No "Sample Recipe" placeholder
- [ ] Dark mode versiyonu da var mı? (opsiyonel)

---

## 📊 A/B TEST FİKİRLERİ

App Store Product Page Optimization veya Play Store Custom Listings ile:

| Test | Variant A | Variant B |
|------|-----------|-----------|
| Test 1 — Icon | Çanak + kaşık | Buzdolabı + AI rozeti |
| Test 2 — SS#1 Header | "Buzdolabını çek 📸" | "Akşama ne yiyelim? 🤔" |
| Test 3 — Color | Terracotta dominant | Mavi dominant |
| Test 4 — Order | Mode selection ilk | Result page ilk |

> Her test 14 gün + 5000+ impression hedefi.

---

🦁 **SONUÇ**: Screenshot'lar conversion'ı %50-200 değiştirebilir. Bu doküman + 1 hafta tasarım yatırımı = 6 ay daha fazla download.
