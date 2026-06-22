# 🎨 Store Assets — Tam Envanter ve Boyut Tablosu

> Tüm görsellerin **hangi boyutta olması gerektiği** ve **hangi mağazaya yükleneceği** bu dokümanda. Yanlış boyut = mağaza reddi.

---

## 📐 GENEL ÖZET TABLOSU

| Asset | iOS | Android | Boyut |
|-------|-----|---------|-------|
| App Icon | 1024×1024 PNG | 512×512 PNG | Köşeleri yuvarlatma yok, alpha kanal yok |
| Splash Screen | 2732×2732 PNG | 1242×2436 PNG | Merkez ortalı |
| Adaptive Icon (Android) | — | 432×432 + 432×432 | Foreground + Background |
| Feature Graphic | — | 1024×500 JPG/PNG | Sadece Play Store, alpha yok |
| Phone Screenshots | 6 cihaz boyutu | 1080×1920 (16:9) | 3-10 adet |
| Tablet Screenshots | 12.9" iPad | 7" + 10" tablet | Opsiyonel ama önerilir |
| App Preview Video | 30 sn iOS | 30 sn YouTube | Opsiyonel ama tavsiye edilir |

---

## 🍎 APPLE APP STORE — ASSET DETAYI

### 1. App Icon
| Özellik | Değer |
|---------|-------|
| **Boyut** | 1024 × 1024 px |
| **Format** | PNG (24-bit, alpha kanal YOK) |
| **Yer** | App Store Connect → Version → App Icon |
| **Dosya** | `06_STORE_ASSETS/ios/app_icon_1024.png` |
| **Notlar** | Apple otomatik yuvarlatır; sen yuvarlatma. Şeffaflık yok. |

### 2. iPhone Screenshots
Her cihaz için ayrı boyut. **En az bir cihaz boyutu zorunlu** ama tüm boyutları doldurmak önerilir.

#### 6.7" Display — iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max
| Özellik | Değer |
|---------|-------|
| **Çözünürlük** | 1290 × 2796 px |
| **Adet** | 3-10 (önerilen: 6) |
| **Format** | PNG veya JPG |
| **Klasör** | `06_STORE_ASSETS/ios/iphone_6_7/` |

#### 6.5" Display — iPhone 11 Pro Max, XS Max
| Özellik | Değer |
|---------|-------|
| **Çözünürlük** | 1242 × 2688 px |
| **Klasör** | `06_STORE_ASSETS/ios/iphone_6_5/` |

#### 5.5" Display — iPhone 8 Plus (eski, bazı bölgelerde zorunlu)
| Özellik | Değer |
|---------|-------|
| **Çözünürlük** | 1242 × 2208 px |
| **Klasör** | `06_STORE_ASSETS/ios/iphone_5_5/` |

### 3. iPad Screenshots (Eğer iPad destekleniyorsa)

#### iPad Pro 12.9" (3. nesil ve sonrası)
| Özellik | Değer |
|---------|-------|
| **Çözünürlük** | 2048 × 2732 px |
| **Adet** | 3-10 |
| **Klasör** | `06_STORE_ASSETS/ios/ipad_12_9/` |

### 4. App Preview Video (Opsiyonel ama önerilen)
| Özellik | Değer |
|---------|-------|
| **Süre** | 15-30 saniye |
| **Format** | .mov veya .mp4 |
| **Codec** | H.264, ProRes 422 (HQ) |
| **Çözünürlük** | iPhone için 1080×1920, iPad için 1200×1600 |
| **Klasör** | `06_STORE_ASSETS/ios/app_preview/` |

### 5. Promotional Image (Featured için)
| Özellik | Değer |
|---------|-------|
| **Çözünürlük** | 4096 × 2304 px |
| **Format** | PNG/JPG |
| **Yer** | App Store Connect → Featuring (opsiyonel — Apple seçer) |
| **Dosya** | `06_STORE_ASSETS/ios/promotional_4096x2304.png` |

---

## 🤖 GOOGLE PLAY STORE — ASSET DETAYI

### 1. App Icon
| Özellik | Değer |
|---------|-------|
| **Boyut** | 512 × 512 px |
| **Format** | PNG (32-bit, alpha kanal YOK) |
| **Yer** | Play Console → Main store listing → Graphics |
| **Dosya** | `06_STORE_ASSETS/android/app_icon_512.png` |

### 2. Adaptive Icon (App içi — Play Store değil)
Cihazda görünen icon için. `app.config.ts` üzerinden ayarlanır.

| Katman | Boyut | Açıklama |
|--------|-------|----------|
| **Foreground** | 432 × 432 px PNG (alpha YES) | Logo/grafik, tüm kenarları ortala |
| **Background** | 432 × 432 px PNG veya hex renk | Düz renk veya gradient (alpha YES yok) |
| **Konum** | `01_Uygulama_Kodu/assets/adaptive-icon.png` (foreground) |
| **Background** | `app.config.ts` → `android.adaptiveIcon.backgroundColor: "#E14328"` |

### 3. Feature Graphic (ZORUNLU)
| Özellik | Değer |
|---------|-------|
| **Boyut** | 1024 × 500 px |
| **Format** | JPG veya PNG 24-bit (alpha YOK) |
| **Yer** | Play Console → Main store listing → Graphics → Feature Graphic |
| **Dosya** | `06_STORE_ASSETS/android/feature_graphic_1024x500.png` |
| **Notlar** | Listeleme sayfasının üst banner'ı. Yoksa Play Store kabul etmez. |

### 4. Phone Screenshots
| Özellik | Değer |
|---------|-------|
| **Çözünürlük** | 1080 × 1920 (16:9) veya 1080 × 2340 (uzun) |
| **Format** | PNG veya JPG (alpha YOK) |
| **Adet** | 2-8 (önerilen: 6) |
| **Klasör** | `06_STORE_ASSETS/android/screenshots_tr/` |

### 5. 7" Tablet Screenshots (Önerilen)
| Özellik | Değer |
|---------|-------|
| **Çözünürlük** | 1200 × 1920 px |
| **Adet** | 1-8 (en az 1) |
| **Klasör** | `06_STORE_ASSETS/android/tablet_7/` |

### 6. 10" Tablet Screenshots (Önerilen)
| Özellik | Değer |
|---------|-------|
| **Çözünürlük** | 1600 × 2560 px |
| **Klasör** | `06_STORE_ASSETS/android/tablet_10/` |

### 7. Promo Video (Opsiyonel)
| Özellik | Değer |
|---------|-------|
| **Format** | YouTube link |
| **Süre** | 30 saniye önerilen, max 2 dk |
| **Yer** | Play Console → Main store listing → Promo video |

---

## 📸 EKRAN GÖRÜNTÜSÜ İÇERİK STRATEJİSİ

> Tüm ekran görüntülerinde **aynı görsel dili** kullan — başlık + alt başlık + uygulama ekranı.

### Önerilen 6 Ekran (Sıralı)

#### 1. Hero — "Buzdolabını çek, yapay zeka ne pişireceğini söylesin!"
- Mockup: Ana sayfa (`v2_screen_01.png`)
- Üst metin: "AI ile akıllı tarif önerileri"
- Alt metin: "2500+ tarif · 14 mutfak"

#### 2. Mod 1 — "Sadece elindekilerle yapılabilenler"
- Mockup: Buzdolabı kamera (`v2_screen_02.png`)
- Üst metin: "Buzdolabı fotoğrafını çek"
- Alt metin: "AI 60+ malzemeyi tanır"

#### 3. Sonuçlar — "Tarifin saniyeler içinde gelsin"
- Mockup: Mod 1 sonuçlar (`v2_screen_04.png`)
- Üst metin: "Sana özel tarifler"
- Alt metin: "Sıfır eksik, sıfır israf"

#### 4. Tarif Detay — "Adım adım rehber"
- Mockup: Tarif detay (`v2_screen_06.png`)
- Üst metin: "Detaylı tarifler"
- Alt metin: "Porsiyon ayarı, malzemeler"

#### 5. Pişirme Modu — "Mutfak dostu arayüz"
- Mockup: Pişirme modu (`v2_screen_07.png`)
- Üst metin: "Pişirme modu"
- Alt metin: "Büyük yazı · sayaç · sesli okuma"

#### 6. Premium — "Daha fazla özellik için Premium"
- Mockup: Premium ekranı (`v2_screen_08.png`)
- Üst metin: "Premium'a geç"
- Alt metin: "7 gün ücretsiz · sınırsız tarama"

### Tasarım Şablonu
- **Üst banner**: ~120 px yükseklikte, `#E14328` arka plan, beyaz yazı
- **Alt banner**: ~80 px, `#FFF3E0` arka plan, koyu yazı
- **Orta**: Telefon mockup'ı (gerçek ekran görüntüsü çerçeve içinde)
- **Tipografi**: Plus Jakarta Sans Bold üst, Regular alt

> Tasarım taslağı için: `06_STORE_ASSETS/template/screenshot_template.fig` (Figma)

---

## 🔢 ASSET ÜRETIM ÖNCELİĞİ

İlk submit için **minimum** gerekenler:

| # | Asset | Zorunluluk | Tahmini Süre |
|---|-------|------------|--------------|
| 1 | iOS App Icon 1024 | ✅ ZORUNLU | 30 dk |
| 2 | Android App Icon 512 | ✅ ZORUNLU | 30 dk |
| 3 | Feature Graphic 1024×500 | ✅ ZORUNLU (Android) | 1 saat |
| 4 | iPhone 6.7" Screenshots (3+) | ✅ ZORUNLU (iOS) | 2 saat |
| 5 | Android Phone Screenshots (2+) | ✅ ZORUNLU (Android) | 2 saat |
| 6 | Adaptive Icon (Android) | ✅ ZORUNLU | 30 dk |
| 7 | Splash Screen | ✅ Kod tarafında zaten var | — |
| 8 | iPhone 6.5" + 5.5" Screenshots | ⚪ Önerilen | 1 saat (her biri) |
| 9 | iPad 12.9" Screenshots | ⚪ Önerilen | 1 saat |
| 10 | Tablet 7" + 10" (Android) | ⚪ Önerilen | 1 saat (her biri) |
| 11 | App Preview Video | 🟢 Opsiyonel — high impact | 4-8 saat |
| 12 | Promotional Image 4096×2304 | 🟢 Opsiyonel | 1 saat |

**Toplam minimum**: ~7 saat tasarım çalışması.

---

## 🛠️ ÜRETIM ARAÇLARI ÖNERİSİ

### Tasarım
- **Figma** (en iyi, ücretsiz) — şablonlar `06_STORE_ASSETS/template/`
- Sketch (sadece Mac)
- Adobe XD

### Boyut Dönüşümü ve Optimizasyon
- **ImageOptim** (Mac, ücretsiz) — PNG/JPG sıkıştırma
- **TinyPNG** (web) — toplu görsel sıkıştırma
- **Squoosh** (Google, web) — modern format dönüşüm

### App Icon Boyut Üretici
- **App Icon Generator** (web): tek bir 1024×1024 yükle, tüm boyutlar otomatik
- `expo-cli` zaten ikon boyutlarını derler

### Screenshot Mockup Aracı
- **Mockuphone** (mockuphone.com) — ücretsiz, hızlı cihaz çerçeveleri
- **Smartmockups** — daha kaliteli, ücretli
- **Figma Mockup Templates** — özelleştirilebilir

---

## ✅ SUBMIT ÖNCESİ ASSET KONTROL LİSTESİ

### iOS
- [ ] 1024×1024 App Icon — alpha YOK, köşe yuvarlama YOK
- [ ] En az **iPhone 6.7"** screenshot'ları (3+)
- [ ] Tüm screenshot'lar **aynı oran**, **aynı görsel dil**
- [ ] Screenshot'lar **canlı veri** gibi görünüyor (Lorem Ipsum yok)
- [ ] App Preview video varsa **15-30 sn**, doğru codec
- [ ] Her dil için ayrı screenshot seti (TR + EN minimum)

### Android
- [ ] 512×512 App Icon
- [ ] 1024×500 Feature Graphic
- [ ] Adaptive Icon hem foreground hem background ayarlı
- [ ] En az **2 phone screenshot**, önerilen 6
- [ ] Tablet screenshot'ları (Google önerir, ranking'i etkiler)
- [ ] Her dil için screenshot seti
- [ ] Promo video YouTube'a yüklenmiş (linkli)

### Genel
- [ ] **Hiçbir görselde marka/logo** (Apple/Google logosu, başka uygulama logoları)
- [ ] **Hiçbir görselde "Awarded by Apple/Google"** gibi yanıltıcı ifade
- [ ] Tüm metinler **doğru yazılmış** (yazım hatası reject sebebi)
- [ ] Screenshot'larda **hassas bilgi yok** (gerçek e-posta, telefon)

---

*Şüpheniz varsa: destek@pratiktarifler.app*
