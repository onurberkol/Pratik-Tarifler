# 🍎 Apple App Store — Submission Rehberi

> Bu rehber, **Pratik Tarifler**'i Apple App Store'a göndermek için her adımı içerir. Ekran ekran, hangi alana ne yazılacağı, hangi dosyanın nereye yükleneceği detaylıdır.

**Tahmini süre:** İlk kez gönderim ~6-8 saat (hesap kurulumu dahil). Review süresi ~24-48 saat.

---

## 📋 ÖN GEREKSİNİMLER

| Gereksinim | Detay |
|------------|-------|
| Apple Developer Program üyeliği | $99/yıl — [developer.apple.com](https://developer.apple.com/programs/) |
| Mac bilgisayar | Xcode için zorunlu |
| App Store Connect erişimi | Apple Developer üyeliğiyle gelir |
| Tamamlanmış üretim build | EAS Build veya Xcode Archive |
| Tüm ekran görüntüleri | `06_STORE_ASSETS/ios/` klasöründe |
| Privacy Policy URL | Canlıda erişilebilir |

---

## 🗺️ GENEL AKIŞ

```
1. App Store Connect'te uygulama kaydı oluştur
   ↓
2. App Information doldur (kategori, dil, vb.)
   ↓
3. Pricing & Availability ayarla
   ↓
4. Subscription products oluştur
   ↓
5. App Privacy anketini doldur
   ↓
6. Version 1.0.0 oluştur
   ↓
7. Ekran görüntülerini ve metinleri yükle
   ↓
8. App Review Information doldur (demo hesap)
   ↓
9. Build'i EAS Submit ile gönder
   ↓
10. Build'i versiyona ekle, "Submit for Review"
   ↓
11. Apple Review (~24-48 saat)
   ↓
12. Onaylandı → Manuel/Otomatik release
```

---

## 1️⃣ APP STORE CONNECT'TE UYGULAMA KAYDI

### Adım 1.1 — App Store Connect'e gir
→ [appstoreconnect.apple.com](https://appstoreconnect.apple.com/)

### Adım 1.2 — "My Apps" → sağ üstte `+` butonu → "New App"

### Adım 1.3 — Form alanlarını doldur:

| Alan | Değer |
|------|-------|
| **Platform** | iOS |
| **Name** | `Pratik Tarifler` (30 karakter limiti) |
| **Primary Language** | Turkish (tr) |
| **Bundle ID** | `app.pratiktarifler` (Önceden Identifiers'ta oluşturulmuş olmalı) |
| **SKU** | `pratik-tarifler-ios-2026` (kendin belirle, unique olsun) |
| **User Access** | Full Access |

> ⚠️ **Bundle ID** önceden Apple Developer → Certificates, Identifiers & Profiles → Identifiers'ta oluşturulmuş olmalı. Sign In with Apple capability'sini de aktif et.

→ **Create**'e tıkla.

---

## 2️⃣ APP INFORMATION

Sol menüde **App Information**'a git.

### Localizable Information (Türkçe)
| Alan | Değer | Karakter Limit |
|------|-------|----------------|
| **Name** | `Pratik Tarifler` | 30 |
| **Subtitle** | `Eldekiyle 2500 lezzet keşfet` | 30 |
| **Privacy Policy URL** | `https://pratiktarifler.app/privacy` | — |

### General Information
| Alan | Değer |
|------|-------|
| **Category — Primary** | Food & Drink |
| **Category — Secondary** | Lifestyle |
| **Content Rights** | Does NOT contain third-party content |
| **Age Rating** | 4+ (sonraki adımda anket dolduruluyor) |

---

## 3️⃣ PRICING & AVAILABILITY

Sol menüden **Pricing and Availability**'e git.

| Alan | Değer |
|------|-------|
| **Price Schedule** | Free (Tier 0) |
| **Availability** | All countries and regions |
| **App Distribution** | Public on the App Store |

> Uygulama freemium — temel uygulama ücretsiz, abonelik IAP olarak ayrı satılır.

---

## 4️⃣ SUBSCRIPTION PRODUCTS

Sol menüden **Subscriptions** → **Subscription Groups** → "Create Subscription Group".

### Subscription Group
- **Reference Name**: `Pratik Tarifler Premium`
- **App Store Localization (TR)**:
  - Display Name: `Pratik Tarifler Premium`
  - Custom App Name: (boş bırak)

### Subscription Product 1 — Aylık
- **Product ID**: `app.pratiktarifler.premium.monthly`
- **Reference Name**: `Premium Monthly`
- **Duration**: 1 Month
- **Subscription Price**: 49.00 TRY
- **Localization (TR)**:
  - Display Name: `Aylık Premium`
  - Description: `Sınırsız buzdolabı taraması, favori, premium tarifler ve reklamsız deneyim. Her ay yenilenir.`

### Subscription Product 2 — Yıllık
- **Product ID**: `app.pratiktarifler.premium.yearly`
- **Reference Name**: `Premium Yearly`
- **Duration**: 1 Year
- **Subscription Price**: 399.00 TRY
- **Localization (TR)**:
  - Display Name: `Yıllık Premium`
  - Description: `Aylık plana göre %32 indirim. Sınırsız buzdolabı taraması, favori, premium tarifler ve reklamsız deneyim. Yıllık yenilenir.`

### Introductory Offer (Her iki ürün için)
- **Free Trial**: 7 days
- **Eligibility**: New subscribers only

### Shared Secret (KRİTİK!)
Bu group içinde **App-Specific Shared Secret** üret:
1. Subscription Group sayfasında en altta "Generate Shared Secret"
2. Üretilen secret'ı kopyala
3. Cloud Functions'a set et:
   ```bash
   firebase functions:secrets:set APPLE_SHARED_SECRET
   # secret'ı yapıştır + Enter
   firebase deploy --only functions
   ```

---

## 5️⃣ APP PRIVACY ANKETİ

Sol menüden **App Privacy** → "Get Started" veya "Edit".

### Data Types Collected
Şu verileri topluyoruz işaretle:

#### 1. Contact Info
- ☑️ **Email Address**
  - Used for: App Functionality, Account Management
  - Linked to user: Yes
  - Used for tracking: No

#### 2. User Content
- ☑️ **Photos or Videos** (buzdolabı fotoğrafları)
  - Used for: App Functionality
  - Linked to user: Yes
  - Used for tracking: No
- ☑️ **Customer Support** (geri bildirim)
  - Used for: App Functionality
  - Linked to user: Yes
  - Used for tracking: No

#### 3. Identifiers
- ☑️ **User ID**
  - Used for: App Functionality, Analytics
  - Linked to user: Yes
  - Used for tracking: No

#### 4. Usage Data
- ☑️ **Product Interaction**
  - Used for: Analytics, Product Personalization
  - Linked to user: Yes
  - Used for tracking: No

#### 5. Diagnostics
- ☑️ **Crash Data**
  - Used for: App Functionality, Analytics
  - Linked to user: No
  - Used for tracking: No
- ☑️ **Performance Data**
  - Used for: App Functionality, Analytics
  - Linked to user: No

> Tüm cevaplar için **"Used for tracking" = No** çünkü 3. parti ile veri paylaşmıyoruz.

→ **Publish** butonuna basma — bir sonraki adımdan sonra basacaksın.

---

## 6️⃣ VERSION 1.0.0 OLUŞTUR

Sol menüden **App Store** → **iOS App** → "+ Version or Platform" → 1.0.0

### Version Information (Türkçe)

#### What's New in This Version
```
🎉 Pratik Tarifler ile tanış!
Buzdolabını çek, yapay zeka ne pişireceğini söylesin.

✨ 3 akıllı mod: elindekiyle, biraz ek malzemeyle, sınırsız keşif
🍳 2500+ özenle seçilmiş tarif, 14 dünya mutfağı
📸 AI buzdolabı taraması
🛒 Akıllı alışveriş listesi
👨‍🍳 Pişirme modu — büyük yazı, otomatik sayaç
🌐 13 dil desteği
🎁 7 gün ücretsiz Premium denemesi
```

#### Promotional Text (170 karakter — istediğin zaman güncel)
```
✨ Yeni: Buzdolabı fotoğrafını çek, yapay zeka senin için tarif önersin! 2500+ Türk ve dünya mutfağı tarifi seni bekliyor. Premium ile sınırsız keşfet.
```

#### Description (4000 karakter)
> Tam metin: `../07_METIN_BANKASI/01_app_store_tr.md` → "Description" bölümünden kopyala-yapıştır.

#### Keywords (100 karakter)
```
tarif,yemek,buzdolabı,mutfak,türk yemekleri,akıllı,ai,pratik,tarif app,malzeme,vejetaryen
```

#### Support URL
```
https://pratiktarifler.app/support
```

#### Marketing URL (opsiyonel)
```
https://pratiktarifler.app
```

---

## 7️⃣ EKRAN GÖRÜNTÜLERİ YÜKLE

### Gerekli Boyutlar (iOS)

| Cihaz | Çözünürlük | Adet | Klasör |
|-------|-----------|------|--------|
| **iPhone 6.7"** (15 Pro Max) | 1290 × 2796 | 3-10 | `06_STORE_ASSETS/ios/iphone_6_7/` |
| **iPhone 6.5"** (11 Pro Max) | 1242 × 2688 | 3-10 | `06_STORE_ASSETS/ios/iphone_6_5/` |
| **iPhone 5.5"** (8 Plus) | 1242 × 2208 | 3-10 | `06_STORE_ASSETS/ios/iphone_5_5/` |
| **iPad Pro 12.9"** (3. nesil+) | 2048 × 2732 | 3-10 (eğer iPad destekleniyor) | `06_STORE_ASSETS/ios/ipad_12_9/` |

> Önerilen: her cihaz için **6 ekran görüntüsü** yükle. Sırasıyla: Ana Sayfa, Mod 1 Buzdolabı Tarama, Mod 1 Sonuçlar, Tarif Detay, Pişirme Modu, Premium.

### Yükleme Adımları
1. Her cihaz boyutunun sekmesine git
2. Görselleri sürükle-bırak veya "Choose File"
3. **Önemli**: Sıra önemlidir — soldakini sürükleyerek değiştirebilirsin
4. **App Preview** (video) opsiyonel — 30 saniyelik tanıtım videosu (önerilir)

### App Icon
- **1024 × 1024 px**, PNG, alpha kanal YOK
- `06_STORE_ASSETS/ios/app_icon_1024.png`
- App Store Connect → Version sayfasında "App Icon" bölümünde yükle

---

## 8️⃣ APP REVIEW INFORMATION

Bu kısım Apple reviewer'ı içindir. Eksik bilgi = reject.

### Sign-In Required
- ☑️ Sign-in required

### Demo Account
| Alan | Değer |
|------|-------|
| **Username** | `apple.reviewer@pratiktarifler.app` |
| **Password** | `AppleReview2026!` |

> Bu hesabı Firebase Authentication'da önceden oluştur. Premium aktif et:
> ```
> Cloud Functions → grantPremiumToUser({email: "apple.reviewer@..."})
> ```

### Contact Information
| Alan | Değer |
|------|-------|
| **First Name** | (sizin adınız) |
| **Last Name** | (soyadınız) |
| **Phone Number** | +90 5XX XXX XXXX |
| **Email** | destek@pratiktarifler.app |

### Notes
```
Pratik Tarifler is a recipe discovery app that uses AI to recognize 
ingredients from a refrigerator photo and suggest recipes accordingly.

Test instructions:
1. Sign in with the provided demo account (already has Premium activated)
2. Tap "Mod 1 — Evdeki Kalanlarla" on the home screen
3. The app will request camera permission — please allow
4. Take any photo or use a sample image — AI will detect ingredients
5. Edit the ingredient list if needed
6. Tap "Tarifleri Gör" to see matching recipes
7. Open any recipe and try "Pişirmeye Başla" for the cooking mode

Demo account has unlimited scans and access to premium features.
Camera permission is required for the core feature (ingredient scanning).
Microphone permission is for hands-free voice commands during cooking 
mode (e.g., "next step").

Contact destek@pratiktarifler.app for any questions.
```

---

## 9️⃣ BUILD'İ YÜKLE — EAS SUBMIT

### Yerel makinende:

```bash
# 1. Production build oluştur (cloud'da derlenir)
eas build --profile production --platform ios

# Bu komut ~15-30 dakika sürer. Bitince TestFlight'a otomatik yüklenir.

# 2. Build hazır olunca App Store'a submit et
eas submit --platform ios --latest
```

### Veya manuel olarak Xcode'dan
1. `eas build`'in çıktısı olan `.ipa` dosyasını indir
2. Xcode → Window → Organizer → "Distribute App" → "App Store Connect"

### App Store Connect'te
- TestFlight → iOS Builds → build'in işlenmesini bekle (~10-30 dakika)
- Build hazır olunca App Store sayfasında "Build" bölümünde görünür

---

## 🔟 BUILD'İ VERSIYONA EKLE

App Store Connect → Version → **Build** bölümü → "+" tıkla → yeni build'i seç.

### Export Compliance
- Sorular gelirse: "Does your app use encryption?" → **No** (sadece HTTPS kullanıyoruz)
- `Info.plist`'te zaten `ITSAppUsesNonExemptEncryption: false` set edilmiş.

---

## 1️⃣1️⃣ SUBMIT FOR REVIEW

Sayfanın sağ üstünde **"Add for Review"** veya **"Submit for Review"** butonu görünür.

### Son Kontroller (otomatik)
Apple birkaç soru daha sorar:
- **Idle Device Permission**: No (varsayılan)
- **Content Rights**: We do not display third-party content (selected before)

### Release Option
- ☑️ **Manually release this version** (önerilen — onayı bekleyip kendin yayınla)
- veya ☐ Automatically release after approval

→ **Submit**!

---

## 1️⃣2️⃣ İNCELEMEDE NE OLACAK?

| Aşama | Süre |
|-------|------|
| **Waiting for Review** | 0-24 saat |
| **In Review** | 1-12 saat |
| **Pending Developer Release** (onaylı) veya **Rejected** | sonuç |

### Onaylanırsa
- E-posta gelir → "Ready for Sale"
- App Store Connect → "Release This Version" butonu
- Tıklayınca ~2 saat içinde App Store'da canlı

### Reject Olursa
- E-posta + Resolution Center'da sebep yazar
- Yaygın reject sebepleri: `03_reject_durumlari.md` dosyasına bak
- Düzeltme yapıp yeni build gönderip tekrar review'a koy

---

## ⚠️ YAYGIN HATALAR

### 1. "Missing Encryption Compliance"
- `app.config.ts` → `ios.config.usesNonExemptEncryption = false` set et

### 2. "Invalid Subscription Configuration"
- Tüm subscription product'ların "Approved" durumunda olduğundan emin ol
- Shared secret Cloud Functions'a set edildi mi kontrol et

### 3. "Missing Privacy Policy"
- `https://pratiktarifler.app/privacy` linkinin **gerçekten çalıştığından** emin ol
- HTML olarak hazır olmalı, PDF değil

### 4. "Demo Account Doesn't Work"
- Apple reviewer'ı için oluşturduğun hesabın Firestore'da Premium status'te olduğunu doğrula
- Şifreyi `App Review Information`'da yazdığınla aynı

### 5. "App Crashes on Launch"
- Cihazda kendi build'ini test et
- Sentry'de crash raporlarını kontrol et
- Firebase config dosyaları (`GoogleService-Info.plist`) yerinde mi?

---

## 📅 SUBMIT SONRASI

Onaylandıktan sonra:
- → **`../10_YAYIN_SONRASI/01_post_launch_checklist.md`** dosyasını oku

---

*Yardım için: destek@pratiktarifler.app*
