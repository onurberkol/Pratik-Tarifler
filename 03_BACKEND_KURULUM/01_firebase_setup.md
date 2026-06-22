# 🔥 Firebase — Sıfırdan Kurulum Rehberi

> Bu rehber, **Pratik Tarifler** için Firebase projesini sıfırdan kurmayı, tüm servisleri etkinleştirmeyi ve uygulamayı bağlamayı adım adım anlatır.

**Tahmini süre:** 2-3 saat.

---

## 📋 KURULACAK FIREBASE SERVİSLERİ

| Servis | Görev |
|--------|-------|
| Authentication | Kullanıcı girişi (Email, Google, Apple, Anonim) |
| Firestore | Tarif veritabanı + kullanıcı verileri |
| Cloud Storage | Tarif görselleri + kullanıcı uploadları |
| Cloud Functions | Backend mantığı (öneri algoritması, IAP doğrulama) |
| Cloud Messaging (FCM) | Push bildirimler |
| Analytics | Kullanıcı davranış analizi |
| Crashlytics | Çökme raporları |
| Performance | Performans metrikleri |
| Remote Config | A/B testleri, feature flags |

---

## 1️⃣ FIREBASE PROJESİ OLUŞTUR

### 1.1 — Firebase Console'a gir
→ [console.firebase.google.com](https://console.firebase.google.com/)

### 1.2 — "Add project" / "Proje ekle"
| Alan | Değer |
|------|-------|
| **Project name** | Pratik Tarifler |
| **Project ID** | `pratik-tarifler` (otomatik üretilen kullanılabilir veya özelleştir) |
| **Google Analytics** | ✅ Enable |
| **Analytics Account** | Default Account for Firebase (veya yeni oluştur) |

→ "Create project"

> ⚠️ **Project ID** sonradan değiştirilemez. Dikkatli seç.

---

## 2️⃣ BLAZE PLAN'A GEÇ (ZORUNLU)

Cloud Functions için **pay-as-you-go** Blaze plan gerekli.

### 2.1 — Sol menü altında "Spark" / "Upgrade" butonuna tıkla
### 2.2 — "Blaze (Pay as you go)" seç
### 2.3 — Billing account bağla (Google Cloud)
### 2.4 — Budget alert ayarla — **çok önemli!**

| Alert Eşiği | Anlam |
|-------------|-------|
| $5/ay | E-posta uyarı (dev/test aşaması) |
| $20/ay | E-posta uyarı (lansman sonrası) |
| $50/ay | E-posta uyarı + Slack |
| $100/ay | Servisleri otomatik durdur (acil müdahale) |

> Free tier limitleri Blaze'de de geçerli — günde 50K function call'a kadar ücretsiz.

---

## 3️⃣ AUTHENTICATION AYARLA

### 3.1 — Sol menü → **Authentication** → "Get started"

### 3.2 — Sign-in methods'ı aç

#### Email/Password
- ☑️ **Enable**
- ☑️ Email link (passwordless) — opsiyonel

#### Google
- ☑️ **Enable**
- **Project support email**: destek@pratiktarifler.app
- Web SDK config otomatik üretilir

#### Apple
- ☑️ **Enable**
- **Services ID**: `app.pratiktarifler.signin`
- **Apple Team ID**, **Key ID**, **Private Key**: Apple Developer hesabından alınır
- Setup: [firebase.google.com/docs/auth/ios/apple](https://firebase.google.com/docs/auth/ios/apple)

#### Anonymous
- ☑️ **Enable** — kullanıcının üye olmadan denemesi için

### 3.3 — Authorized Domains
Settings → Authorized domains:
- ☑️ `localhost`
- ☑️ `pratik-tarifler.firebaseapp.com`
- ☑️ `pratiktarifler.app` (varsa custom domain)

### 3.4 — User Actions (E-posta şablonları)
Templates sekmesi → her şablonu **Türkçe'ye çevir**:
- Email address verification
- Password reset
- Email address change

> Şablon metinleri: `../07_METIN_BANKASI/05_email_templates_tr.md`

---

## 4️⃣ FIRESTORE KURULUMU

### 4.1 — Sol menü → **Firestore Database** → "Create database"

### 4.2 — Mod seç
- ☑️ **Production mode** (güvenlik kurallarını biz yöneteceğiz)

### 4.3 — Lokasyon seç
- **`eur3` (europe-west)** önerilen — Türkiye'ye en yakın multi-region
- Veya `europe-west3 (Frankfurt)` — tek bölge, daha ucuz

> ⚠️ Lokasyon **sonradan değiştirilemez**.

### 4.4 — Güvenlik kuralları yükle

Yerel makinende:
```bash
cd 01_Uygulama_Kodu
firebase login
firebase use pratik-tarifler

# firestore.rules dosyası proje kökünde olmalı
firebase deploy --only firestore:rules
```

### 4.5 — İndeksleri yükle

```bash
firebase deploy --only firestore:indexes
```

> `firestore.indexes.json` 13 bileşik indeks içerir. Yükleme ~5-10 dakika sürer.

### 4.6 — 2500 tarifi seed et

```bash
npm run seed
```

> `scripts/seed_firestore.js` çalışır. Network bağlantısına göre 5-15 dakika sürer.

### 4.7 — Doğrulama
Firestore Console'da koleksiyonları kontrol et:
- `recipes_tr` → 2500 doküman olmalı
- `users` → boş (kullanıcı eklendikçe dolar)
- `image_jobs` → görsel pipeline çalıştırılınca dolar

---

## 5️⃣ CLOUD STORAGE KURULUMU

### 5.1 — Sol menü → **Storage** → "Get started"

### 5.2 — Production mode + aynı lokasyon (eur3)

### 5.3 — Güvenlik kuralları
```bash
firebase deploy --only storage
```

### 5.4 — Klasör yapısı (otomatik oluşur, manuel yapma)
```
gs://pratik-tarifler.appspot.com/
├── recipes/
│   ├── tr/
│   │   ├── full/      ← 1200x900 ana görseller
│   │   ├── thumb/     ← 400x300 thumbnail
│   │   └── blur/      ← progressive loading için
│   ├── en/, de/, fr/, ...
├── users/
│   └── {userId}/
│       └── pantry_scans/  ← geçici, 24h sonra otomatik silinir
└── tmp/
```

### 5.5 — Lifecycle Policy (Eski dosyaları otomatik sil)
Google Cloud Console → Storage → bucket → Lifecycle:
- Rule 1: `users/*/pantry_scans/*` dosyalarını **24 saat** sonra sil
- Rule 2: `tmp/*` dosyalarını **7 gün** sonra sil

---

## 6️⃣ CLOUD FUNCTIONS KURULUMU

### 6.1 — Functions dizinine git
```bash
cd 01_Uygulama_Kodu/functions
npm install
```

### 6.2 — Functions config
```bash
# Apple Shared Secret (App Store IAP doğrulama için)
firebase functions:secrets:set APPLE_SHARED_SECRET
# (Prompt'ta App Store Connect'ten aldığın secret'ı yapıştır)

# Google Service Account (Android IAP doğrulama için)
firebase functions:secrets:set GOOGLE_SERVICE_ACCOUNT
# (JSON'u tek satıra çevirip yapıştır)

# OpenAI API Key (benzer tarif embedding için)
firebase functions:secrets:set OPENAI_API_KEY

# RevenueCat Webhook Secret
firebase functions:secrets:set REVENUECAT_WEBHOOK_SECRET

# Stripe (web ödeme için)
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

### 6.3 — Deploy
```bash
cd ..  # proje köküne dön
firebase deploy --only functions
```

> İlk deploy ~5-10 dakika sürer. 11 fonksiyon deploy edilir.

### 6.4 — Function URL'lerini al
Console → Functions → her bir function'ın URL'i listede. Bunları ileride RevenueCat/Stripe webhook'larına gireceksin.

| Function | URL Örneği |
|----------|------------|
| `revenuecatWebhook` | `https://europe-west3-pratik-tarifler.cloudfunctions.net/revenuecatWebhook` |
| `stripeWebhook` | `https://europe-west3-pratik-tarifler.cloudfunctions.net/stripeWebhook` |
| `appleNotificationsV2` | `https://europe-west3-pratik-tarifler.cloudfunctions.net/appleNotificationsV2` |
| `playRtdnHandler` | `https://europe-west3-pratik-tarifler.cloudfunctions.net/playRtdnHandler` |

---

## 7️⃣ iOS UYGULAMA EKLE

### 7.1 — Console → Project Settings → "Add app" → iOS

| Alan | Değer |
|------|-------|
| **iOS bundle ID** | `app.pratiktarifler` |
| **App nickname** | Pratik Tarifler iOS |
| **App Store ID** | (sonra dolduracağız) |

### 7.2 — `GoogleService-Info.plist` indir
- İndirdiğin dosyayı `01_Uygulama_Kodu/ios/PratikTarifler/` klasörüne kopyala
- Xcode'da projeye sürükle → "Add to targets" işaretle

> Bu dosya `.gitignore`'da olmalı. Sırlar içeriyor.

### 7.3 — SDK kurulumu (Expo'da otomatik)
Expo SDK 54 Firebase'i kapsamlı destekler. `@react-native-firebase/*` paketleri zaten `package.json`'da.

### 7.4 — Apple Sign-In domain doğrulama
Apple Developer → Identifiers → Services ID → domain ekle: `pratiktarifler.firebaseapp.com`

---

## 8️⃣ ANDROID UYGULAMA EKLE

### 8.1 — Console → Project Settings → "Add app" → Android

| Alan | Değer |
|------|-------|
| **Android package name** | `app.pratiktarifler` |
| **App nickname** | Pratik Tarifler Android |
| **Debug signing certificate SHA-1** | (yerelde `eas credentials` çıktısından al) |

### 8.2 — `google-services.json` indir
- `01_Uygulama_Kodu/android/app/` klasörüne kopyala

### 8.3 — Release SHA-1 fingerprint ekle
EAS Build kullandığın için:
```bash
eas credentials
```
Çıktıda "SHA-1 Fingerprint" göreceksin. Bunu Firebase → Project Settings → "Add fingerprint" ile ekle.

> Eksikse Google Sign-In production'da çalışmaz!

---

## 9️⃣ CLOUD MESSAGING (FCM) — PUSH BİLDİRİMLER

### 9.1 — iOS için APNs Key
1. Apple Developer → Keys → "+" → APNs
2. Key oluştur, `.p8` indir
3. Firebase Console → Project Settings → Cloud Messaging → APNs Authentication Key → Upload
   - Key ID: Apple Developer'dan
   - Team ID: Apple Developer'dan

### 9.2 — Test
```bash
# Cloud Functions'tan örnek push gönder
firebase functions:shell
> sendTestNotification({userId: "test_user_id", message: "Test"})
```

---

## 🔟 ANALYTICS, CRASHLYTICS, PERFORMANCE

### Analytics
- Otomatik aktif (proje oluştururken etkinleştirdik)
- Custom events için: `src/api/analytics.ts` kullanılıyor

### Crashlytics
- Console → Crashlytics → "Get started"
- iOS için: `dSYM upload script` Xcode build phase'inde otomatik
- Android için: `applicationVariants.all` Gradle'da yapılandırılmış

### Performance Monitoring
- Console → Performance → "Get started"
- SDK uygulamada zaten var (`expo-firebase-analytics` ile gelir)

---

## ⚠️ YAYGIN HATALAR

### "Permission denied"
- Firestore rules deploy edilmedi → `firebase deploy --only firestore:rules`
- Storage rules deploy edilmedi → `firebase deploy --only storage`

### "Quota exceeded"
- Blaze plan'a geçilmedi → Yukarıda Adım 2

### "Functions deploy failed: Build failed"
- `cd functions && npm install` çalıştırdın mı?
- Node.js 18 veya 20 kullanıyor musun?

### "Apple Sign-In domain not verified"
- Apple Developer Services ID'ye Firebase Authentication domain'i eklendi mi?

### "google-services.json not found"
- Dosya `android/app/google-services.json` olarak konuldu mu?
- Tam adı doğru mu? (büyük-küçük harf önemli)

---

## ✅ KURULUM TAMAM KONTROL LİSTESİ

- [ ] Firebase projesi oluşturuldu
- [ ] Blaze plan aktif, budget alert ayarlı
- [ ] Authentication: Email, Google, Apple, Anonymous etkin
- [ ] Firestore deploy edildi (rules + indexes)
- [ ] 2500 tarif seed edildi
- [ ] Cloud Storage deploy edildi + lifecycle rules
- [ ] Cloud Functions deploy edildi (11 fonksiyon)
- [ ] Tüm secrets set edildi
- [ ] iOS app eklendi, `GoogleService-Info.plist` yerinde
- [ ] Android app eklendi, `google-services.json` yerinde
- [ ] APNs key yüklü
- [ ] SHA-1 fingerprint'ler eklendi
- [ ] Crashlytics + Performance + Analytics aktif

---

## ➡️ SONRAKİ ADIM

Firebase tamamsa:
- **`02_revenuecat_setup.md`** — Abonelik sistemi
- **`03_stripe_setup.md`** — Web ödeme
- **`04_sentry_setup.md`** — Crash reporting

---

*Yardım için: destek@pratiktarifler.app*
