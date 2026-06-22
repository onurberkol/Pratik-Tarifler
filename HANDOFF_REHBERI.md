# 🚀 PRATİK TARİFLER — Developer Hand-Off Rehberi

> **Sevgili Geliştirici,** bu paket, **Pratik Tarifler** mobil uygulamasını Apple App Store ve Google Play Store'a göndermek için ihtiyacın olan **her şeyi** içerir. Hiçbir soru sormadan, soldan sağa, baştan sona bu rehberi takip edersen ~6 hafta içinde uygulamayı yayında görürsün.

---

## 📋 PAKET İÇERİĞİ — NEYİ NEREDE BULURSUN?

```
📁 pratik_tarifler_handoff/
│
├── 📘 BU DOSYA (HANDOFF_REHBERI.md)
│     Tüm sürecin haritası, sıralı yapılacaklar
│
├── 📁 01_BASLA_BURADAN/
│     İlk gün okunacaklar: proje özeti, mimari, faz planı
│
├── 📁 02_GELISTIRICI_REHBERLERI/
│     Yerel kurulum, kod yapısı, geliştirme akışı
│
├── 📁 03_BACKEND_KURULUM/
│     Firebase, RevenueCat, Stripe, Sentry kurulumu — adım adım
│
├── 📁 04_APP_STORE_SUBMISSION/
│     Apple App Store gönderim rehberi (ekran ekran)
│
├── 📁 05_GOOGLE_PLAY_SUBMISSION/
│     Google Play Store gönderim rehberi (ekran ekran)
│
├── 📁 06_STORE_ASSETS/
│     Tüm görseller: ikonlar, ekran görüntüleri, feature grafikler
│
├── 📁 07_METIN_BANKASI/
│     Tüm metinler: TR/EN açıklamalar, keywords, "What's New" notları
│
├── 📁 08_LEGAL_VE_POLITIKALAR/
│     Privacy Policy, Terms of Service (TR + EN)
│
├── 📁 09_BETA_VE_TEST/
│     TestFlight + Internal Testing rehberi, test senaryoları
│
└── 📁 10_YAYIN_SONRASI/
      İzleme, güncelleme, sürüm yönetimi
```

---

## ⏱️ HIZLI GENEL BAKIŞ

| Bileşen | Değer |
|---------|-------|
| **Uygulama adı** | Pratik Tarifler |
| **Bundle ID (iOS)** | `app.pratiktarifler` |
| **Package (Android)** | `app.pratiktarifler` |
| **Versiyon** | 1.0.0 |
| **Framework** | React Native + Expo SDK 54 |
| **Backend** | Firebase (Firestore + Functions + Storage + Auth) |
| **Abonelik** | RevenueCat + Stripe (web) |
| **Diller** | 13 (TR ana, RTL desteği dahil) |
| **Kategori** | Food & Drink / Yemek ve İçecek |
| **Hedef OS** | iOS 13+ · Android 7.0+ (API 24+) |
| **Tahmini submit-to-live süresi** | iOS ~24-48 saat · Android ~2-7 gün |

---

## 🗺️ YOL HARİTASI — 6 HAFTALIK PLAN

### 🟢 HAFTA 1 — Geliştirici Onboarding
- [ ] Bu rehberi baştan sona oku
- [ ] `02_GELISTIRICI_REHBERLERI/01_yerel_kurulum.md` — projeyi yerelde çalıştır
- [ ] Tüm bağımlılıkları kur, `npm test` ve `npm run typecheck` geçsin
- [ ] Kod yapısını gez, başlıca ekranları çalışırken gör

### 🟡 HAFTA 2 — Backend Kurulumu
- [ ] `03_BACKEND_KURULUM/01_firebase_setup.md` — Firebase projesi oluştur
- [ ] Firestore deploy, Functions deploy, Storage rules
- [ ] 2500 tarif veritabanını seed et
- [ ] `03_BACKEND_KURULUM/02_revenuecat_setup.md` — RevenueCat hesabı
- [ ] `03_BACKEND_KURULUM/03_stripe_setup.md` — Stripe (web ödeme için)
- [ ] `03_BACKEND_KURULUM/04_sentry_setup.md` — Sentry crash reporting

### 🟠 HAFTA 3 — Store Hesapları ve Materyaller
- [ ] Apple Developer Program üyelik ($99/yıl)
- [ ] Google Play Developer hesabı ($25 tek seferlik)
- [ ] App Store Connect'te uygulama kaydı oluştur
- [ ] Google Play Console'da uygulama kaydı oluştur
- [ ] `06_STORE_ASSETS/` görsellerini ilgili boyutlarda yükle
- [ ] `07_METIN_BANKASI/` metinlerini copy-paste et

### 🔵 HAFTA 4 — Beta Test
- [ ] `09_BETA_VE_TEST/01_testflight.md` — TestFlight build gönder
- [ ] `09_BETA_VE_TEST/02_play_internal.md` — Internal Testing track
- [ ] 50-100 beta tester davet et
- [ ] Geri bildirim topla, kritik bug'ları düzelt
- [ ] Crash-free rate ≥ %99.5 hedefle

### 🟣 HAFTA 5 — Üretim Build ve Submission
- [ ] Final üretim build'ini al (`npm run build:all`)
- [ ] `04_APP_STORE_SUBMISSION/` rehberini takip et — iOS submit
- [ ] `05_GOOGLE_PLAY_SUBMISSION/` rehberini takip et — Android submit
- [ ] Review için bekleme — Apple ~24-48 saat, Google ~2-7 gün
- [ ] Reviewer notları için demo hesabı hazır tut (`07_METIN_BANKASI/review_notes.md`)

### 🟢 HAFTA 6 — Lansman ve Sonrası
- [ ] Onaylanan uygulamayı yayına al (manuel veya otomatik release)
- [ ] Sosyal medya, basın bültenleri, ASO optimizasyonu
- [ ] `10_YAYIN_SONRASI/` izleme ve güncelleme rehberlerini takip et

---

## ⚠️ KRİTİK — SUBMIT ÖNCESİ KONTROL LİSTESİ

Bu maddeleri tamamlamadan **asla** submit etmeyin:

### 🔧 Kod Tarafı
- [ ] `app.config.ts` → `REPLACE_WITH_YOUR_EAS_PROJECT_ID` doldurulmuş (2 yer)
- [ ] `app.config.ts` → `owner` field EAS hesabınızla güncel
- [ ] `eas.json` → iOS `appleId`, `ascAppId`, `appleTeamId` doldurulmuş
- [ ] `eas.json` → Android için `play-service-account.json` proje kökünde
- [ ] `.env` → tüm Firebase + Google Sign-In değerleri set edilmiş
- [ ] `functions/.env` (veya Firebase Secrets) → `APPLE_SHARED_SECRET` set
- [ ] `npm run typecheck` ve `npm test` GEÇİYOR
- [ ] `app.config.ts` → `version` semver'a uygun (1.0.0)
- [ ] iOS `buildNumber` ve Android `versionCode` artırılmış (sonraki submit'ler için)

### ☁️ Firebase
- [ ] Proje Blaze planında (Cloud Functions için zorunlu)
- [ ] Authentication: Email/Password, Google, Apple, Anonymous etkin
- [ ] Firestore deploy edilmiş: `firebase deploy --only firestore`
- [ ] Storage kuralları deploy edilmiş: `firebase deploy --only storage`
- [ ] Functions deploy edilmiş: `firebase deploy --only functions`
- [ ] Veritabanı seed edilmiş: `npm run seed` (2500 tarif)
- [ ] Apple Sign-In için domain doğrulanmış: `pratiktarifler.app`

### 🍎 Apple App Store
- [ ] App Store Connect kaydı tamamlandı (kategori: Food & Drink)
- [ ] Pricing & Availability ayarlandı
- [ ] App Privacy anketi dolduruldu (`07_METIN_BANKASI/app_privacy.md`)
- [ ] Subscription products oluşturuldu:
  - `app.pratiktarifler.premium.monthly`
  - `app.pratiktarifler.premium.yearly`
- [ ] Subscription group adı: "Pratik Tarifler Premium"
- [ ] Shared Secret üretildi → Cloud Functions'a set edildi:
  ```
  firebase functions:secrets:set APPLE_SHARED_SECRET
  ```
- [ ] App Store Server Notifications V2 URL yapılandırıldı
- [ ] Sandbox test kullanıcıları oluşturuldu
- [ ] Apple Sign-In capability aktif
- [ ] Ekran görüntüleri yüklendi (6.7", 6.5", 5.5", 12.9" iPad)
- [ ] App icon 1024×1024 yüklendi
- [ ] Reviewer için demo hesap bilgisi girildi (App Review Information)

### 🤖 Google Play
- [ ] Play Console kaydı tamamlandı (kategori: Food & Drink)
- [ ] Content rating dolduruldu (PEGI 3 / ESRB Everyone)
- [ ] Target audience: 13+
- [ ] Data safety formu dolduruldu (`07_METIN_BANKASI/data_safety.md`)
- [ ] Subscription products oluşturuldu (aynı IDs)
- [ ] Service account JSON Firebase'e bağlandı
- [ ] Real-Time Developer Notifications (RTDN) topic yapılandırıldı
- [ ] Ekran görüntüleri (phone + 7"/10" tablet) yüklendi
- [ ] Feature Graphic 1024×500 yüklendi
- [ ] Adaptive icon yüklendi

### 💰 RevenueCat
- [ ] Hesap oluşturuldu, proje oluşturuldu
- [ ] iOS App Store ve Google Play credentials bağlandı
- [ ] Entitlement: `premium` oluşturuldu
- [ ] Offerings: `default` oluşturuldu, paketler eklendi
- [ ] iOS Shared Secret, Android Service Account RevenueCat'e tanıtıldı
- [ ] Webhook URL'leri yapılandırıldı (Cloud Functions endpoint)

### ⚖️ Yasal
- [ ] Privacy Policy URL canlıda: `https://pratiktarifler.app/privacy`
- [ ] Terms of Service URL canlıda: `https://pratiktarifler.app/terms`
- [ ] Destek e-postası aktif: `destek@pratiktarifler.app`
- [ ] Support URL canlıda: `https://pratiktarifler.app/support`

---

## 🆘 SORUN YAŞARSAN

| Konu | Nereye Bak |
|------|-----------|
| Uygulama yerel çalışmıyor | `02_GELISTIRICI_REHBERLERI/03_sorun_giderme.md` |
| Firebase hatası | `03_BACKEND_KURULUM/01_firebase_setup.md` → "Yaygın Hatalar" |
| Build başarısız | `02_GELISTIRICI_REHBERLERI/04_build_ve_deploy.md` |
| App Store reject | `04_APP_STORE_SUBMISSION/03_reject_durumlari.md` |
| RevenueCat / IAP | `03_BACKEND_KURULUM/02_revenuecat_setup.md` → "Test Senaryoları" |

---

## ✅ HAZIRSAN BAŞLA

➡️ Önce **`01_BASLA_BURADAN/01_proje_ozeti.md`** dosyasını oku. Sonra sırasıyla diğer klasörlere geç.

**Başarılar! 🦁🔥**
*Sorunlarınızda bu dokümanlar yetmezse: destek@pratiktarifler.app*
