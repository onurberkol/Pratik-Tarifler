# 🤖 Google Play Store — Submission Rehberi

> **Pratik Tarifler**'i Google Play Store'a göndermek için her adım. Apple'dan farklı olarak Google'ın inceleme süreci biraz daha esnek ama **kuralları katı** — özellikle Data Safety ve Content Rating.

**Tahmini süre:** İlk kez gönderim ~4-6 saat. Review süresi ~2-7 gün (ilk submit), sonraki güncellemeler ~24 saat.

---

## 📋 ÖN GEREKSİNİMLER

| Gereksinim | Detay |
|------------|-------|
| Google Play Developer hesabı | **$25 tek seferlik** — [play.google.com/console](https://play.google.com/console) |
| Geçerli Google hesabı | Developer hesabı için |
| Tamamlanmış AAB (Android App Bundle) | EAS Build veya `./gradlew bundleRelease` |
| Tüm ekran görüntüleri | `06_STORE_ASSETS/android/` klasöründe |
| Privacy Policy URL | Canlıda erişilebilir |
| Feature Graphic (1024×500) | `06_STORE_ASSETS/android/feature_graphic_1024x500.png` |

---

## 🗺️ GENEL AKIŞ

```
1. Play Console'da uygulama oluştur
   ↓
2. App Content sorularını cevapla (Privacy, Data Safety, vd.)
   ↓
3. Subscription products oluştur
   ↓
4. Store Listing — metin ve görseller
   ↓
5. Production track'e build yükle
   ↓
6. Content rating al
   ↓
7. Target audience belirle
   ↓
8. Roll out — % bazlı veya tam yayın
   ↓
9. Google Review (~2-7 gün)
   ↓
10. Live!
```

---

## 1️⃣ PLAY CONSOLE'DA UYGULAMA OLUŞTUR

→ [play.google.com/console](https://play.google.com/console)

### Adım 1.1 — "Create app"

| Alan | Değer |
|------|-------|
| **App name** | Pratik Tarifler |
| **Default language** | Turkish — tr-TR |
| **App or game** | App |
| **Free or paid** | Free |
| **Developer Program Policies** | ☑️ kabul |
| **US Export Laws** | ☑️ kabul |

→ **Create app**

---

## 2️⃣ APP CONTENT — POLICY SORULARI

Sol menüden **Policy** → **App content**. Tüm aşağıdaki bölümleri tamamlamalısın:

### 2.1 — Privacy Policy
| Alan | Değer |
|------|-------|
| **Privacy policy URL** | `https://pratiktarifler.app/privacy` |

### 2.2 — App Access
- "All functionality is available without special access" — **Hayır**, çünkü Premium IAP var
- → "All or some functionality is restricted"
- **Instructions for accessing restricted parts**:
  ```
  Demo account for reviewers (premium activated):
  
  Email: google.reviewer@pratiktarifler.app
  Password: GoogleReview2026!
  
  How to test:
  1. Sign in with the demo account
  2. The account has Premium activated, so all features are accessible
  3. Test the core feature: Home → "Evdeki Kalanlarla" → 
     allow camera permission → take a photo or use sample image
  4. AI will detect ingredients; matching recipes appear
  5. Open any recipe and try "Pişirmeye Başla" for cooking mode
  ```

### 2.3 — Ads
- "Does your app contain ads?" → **No** (uygulamada reklam göstermiyoruz)

> Eğer ileride AdMob entegre edersen burayı güncelle.

### 2.4 — Content Rating
- "Start questionnaire" → form aşağıdaki gibi doldurulur:
  - **Category**: Other (recipe / food app değil ama en yakını)
  - **Violence**: None
  - **Sexuality**: None
  - **Profanity**: None
  - **Drugs**: None
  - **Gambling**: None
  - **User-generated content**: No
  - **Location sharing**: No
- Beklenen rating: **PEGI 3 / ESRB Everyone**

### 2.5 — Target Audience and Content
- **Target age groups**: 13+ (önerilen — çocuk değil ama 18+ de değil)
- **Appeals to children?**: No

### 2.6 — News App
- "Is your app a news app?" → **No**

### 2.7 — COVID-19 Tracing App
- → **No**

### 2.8 — Data Safety (KRİTİK!)

Tüm topladığımız veriler beyan edilmeli. **`../07_METIN_BANKASI/data_safety.md`** dosyasında detaylı versiyonu var. Özet:

#### Veri Toplama
| Veri Türü | Toplanıyor mu? | Paylaşılıyor mu? | Amacı |
|-----------|----------------|-------------------|-------|
| Personal Info → Email | Evet | Hayır | Account management, Communications |
| Personal Info → User IDs | Evet | Hayır | Account management, App functionality |
| Photos | Evet | Hayır | App functionality (ingredient scanning) |
| App Activity → Interactions | Evet | Hayır | Analytics, App functionality |
| App Performance → Crash logs | Evet | Hayır | App functionality |
| App Performance → Diagnostics | Evet | Hayır | App functionality |

#### Güvenlik Uygulamaları
- ☑️ Data is encrypted in transit (HTTPS)
- ☑️ You can request that data be deleted (KVKK/GDPR uyumlu)

### 2.9 — Government Apps
- → **No**

### 2.10 — Financial Features
- → **No** (sadece Premium IAP, fintech değil)

### 2.11 — Health Features
- → **No**

---

## 3️⃣ SUBSCRIPTION PRODUCTS — IAP

Sol menüden **Monetize** → **Products** → **Subscriptions** → "Create subscription".

### Subscription 1 — Aylık
| Alan | Değer |
|------|-------|
| **Product ID** | `app.pratiktarifler.premium.monthly` |
| **Name** | Premium Aylık |
| **Description** | Sınırsız buzdolabı taraması, favori, premium tarifler ve reklamsız deneyim. Her ay yenilenir. |
| **Billing period** | Monthly (1 month) |
| **Price** | 49.00 TRY |
| **Free trial** | 7 days |

### Subscription 2 — Yıllık
| Alan | Değer |
|------|-------|
| **Product ID** | `app.pratiktarifler.premium.yearly` |
| **Name** | Premium Yıllık |
| **Description** | %32 indirim. Sınırsız buzdolabı taraması, favori, premium tarifler ve reklamsız deneyim. Yıllık yenilenir. |
| **Billing period** | Yearly (1 year) |
| **Price** | 399.00 TRY |
| **Free trial** | 7 days |

> Her ikisini de **Active** duruma getir.

### Real-Time Developer Notifications (RTDN)
**Monetize** → **Monetization setup** → "Real-time developer notifications"
- **Topic name**: `projects/pratik-tarifler/topics/play-rtdn`
- (Google Cloud Pub/Sub'da bu topic önceden oluşturulmalı)
- Subscriber → Cloud Function endpoint

---

## 4️⃣ STORE LISTING

Sol menüden **Grow** → **Store presence** → **Main store listing**.

### Türkçe (varsayılan dil)

#### App name (50 karakter)
```
Pratik Tarifler: Buzdolabımda Ne Var?
```
*36 karakter ✓*

#### Short description (80 karakter)
```
AI ile buzdolabından tarif önerisi. 2500+ tarif, 13 dil, akıllı keşif modu.
```
*74 karakter ✓*

#### Full description (4000 karakter)
> Tam metin: `../07_METIN_BANKASI/02_play_store_tr.md` → "Full Description" bölümünden kopyala-yapıştır.

#### Visual Assets

##### App Icon
- **512 × 512 px**, PNG (32-bit, alpha kanal yok)
- `06_STORE_ASSETS/android/app_icon_512.png`

##### Feature Graphic (ZORUNLU)
- **1024 × 500 px**, JPG veya PNG (alpha yok)
- `06_STORE_ASSETS/android/feature_graphic_1024x500.png`

##### Phone Screenshots
- En az **2 görsel**, önerilen **6-8**
- Boyut: 1080 × 1920 px (16:9) veya 1080 × 2340 px (uzun)
- Format: PNG veya JPG (alpha yok)
- `06_STORE_ASSETS/android/screenshots_tr/`

##### 7" Tablet (opsiyonel ama önerilir)
- 1200 × 1920 px, en az 1 görsel
- `06_STORE_ASSETS/android/tablet_7/`

##### 10" Tablet (opsiyonel)
- 1600 × 2560 px, en az 1 görsel
- `06_STORE_ASSETS/android/tablet_10/`

##### Promo Video (opsiyonel)
- YouTube linki — 30 saniyelik tanıtım

#### Categorization
| Alan | Değer |
|------|-------|
| **App category** | Food & Drink |
| **Tags** | recipe, food, AI, cooking (en fazla 5) |

#### Contact details
| Alan | Değer |
|------|-------|
| **Email** | destek@pratiktarifler.app |
| **Phone** (opsiyonel) | +90 5XX XXX XXXX |
| **Website** | https://pratiktarifler.app |

---

## 5️⃣ İLAVE DİL — İNGİLİZCE

Sol menüden **Store listing** → "Add translation" → English (United States)

> Tüm metinleri İngilizce versiyonu için `../07_METIN_BANKASI/03_play_store_en.md` dosyasından kopyala.

---

## 6️⃣ PRODUCTION BUILD YÜKLE

### Yerel makinende:

```bash
# AAB (Android App Bundle) üret
eas build --profile production --platform android

# Bu komut ~15-30 dakika sürer.
# Çıktı: .aab dosyası (Google Play sadece AAB kabul eder, .apk değil)
```

### Play Console'da yükle:
Sol menüden **Release** → **Production** → "Create new release"

1. **Use Play App Signing**: Önerilen → "Continue"
2. **Upload** → `.aab` dosyasını sürükle-bırak
3. Yükleme bittiğinde otomatik kontroller yapılır

### Release name
```
1.0.0 (1)
```

### Release notes (Türkçe)
```
🎉 Pratik Tarifler ile tanış!

✨ 3 akıllı mod: elindekiyle, biraz ek malzemeyle, sınırsız keşif
🍳 2500+ özenle seçilmiş tarif, 14 dünya mutfağı
📸 AI buzdolabı taraması
🛒 Akıllı alışveriş listesi
👨‍🍳 Pişirme modu — büyük yazı, otomatik sayaç
🌐 13 dil desteği
🎁 7 gün ücretsiz Premium denemesi
```

> İngilizce versiyonu için: `../07_METIN_BANKASI/03_play_store_en.md` → "Release Notes"

---

## 7️⃣ COUNTRIES & REGIONS

**Release** → **Production** → **Countries / regions** → "Add countries / regions"
- ☑️ Select all 175 countries (varsayılan tam dağıtım)
- Veya sadece Turkey ve seçili ülkeler ile sınırla

---

## 8️⃣ RELEASE TYPE — STAGED ROLLOUT (ÖNERİLEN)

İlk sürümde **%10** kullanıcıya başla, problem yoksa artır:

| Aşama | Süre | % |
|-------|------|---|
| Day 0 | İlk yayın | 10% |
| Day 2 | Stabilse | 25% |
| Day 4 | Stabilse | 50% |
| Day 7 | Stabilse | 100% |

> Crash-free rate'i Firebase Crashlytics'ten izle. **%99'un altına düşerse rollout'u durdur.**

---

## 9️⃣ REVIEW & PUBLISH

### Adım 9.1 — Tüm sekmelerin yeşil olduğunu kontrol et:
- ☑️ App content (tüm formlar)
- ☑️ Store listing
- ☑️ Subscriptions
- ☑️ Countries / regions
- ☑️ Production release

### Adım 9.2 — "Save" → "Review release" → "Start rollout to production"

---

## 1️⃣0️⃣ İNCELEMEDE NE OLACAK?

| Aşama | Süre |
|-------|------|
| **In review** | 2-7 gün (ilk submit) |
| **Pending publication** | Onaylı, kuyrukta |
| **Published** | Canlı! |

### Onaylanırsa
- E-posta gelir
- Play Store'da ~2-4 saat içinde aranabilir
- 24 saat içinde tam dağıtım

### Reject olursa
- E-posta + Play Console'da sebep yazar
- Yaygın reject sebepleri:
  - Eksik / yanlış Data Safety beyanı
  - Privacy Policy linki çalışmıyor
  - APK/AAB'de izin kullanılıyor ama açıklanmıyor

---

## ⚠️ YAYGIN HATALAR

### 1. "Permissions not declared"
- `app.config.ts`'te kullanılan tüm izinler manifest'te olmalı
- `android.permissions` array'inde liste:
  - `RECORD_AUDIO` (pişirme modu sesli komut)
  - `CAMERA` (buzdolabı tarama)
  - `READ_EXTERNAL_STORAGE` (galeri seçimi)

### 2. "Target API level too low"
- Google her yıl minimum target SDK'yı yükseltir
- 2025-2026 için minimum: **API 34 (Android 14)**
- `app.config.ts` → `android.compileSdkVersion` ve `targetSdkVersion` güncel olmalı

### 3. "Missing Privacy Policy in Data Safety"
- Data Safety formunda **mutlaka** privacy policy URL belirtilmeli
- URL'in HTTPS olduğundan emin ol

### 4. "Subscription product not active"
- Subscription oluşturduktan sonra **mutlaka** "Activate" butonuna bas
- Aksi takdirde uygulamada görünmez

### 5. "Test purchase failed"
- License testers listesine Google hesabını ekle:
  - Play Console → Setup → License testing → Add testers
- Internal Testing track'inden uygulamayı yükle, normal Play Store'dan değil

---

## 📅 SUBMIT SONRASI

Onaylandıktan sonra:
- → **`../10_YAYIN_SONRASI/01_post_launch_checklist.md`**

---

*Yardım için: destek@pratiktarifler.app*
