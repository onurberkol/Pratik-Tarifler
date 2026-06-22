# 🛠️ Yerel Kurulum — Adım Adım

> Bu rehber, projeyi yerel makinende çalıştırmak için her adımı içerir. **Tahmini süre: 30-60 dakika.**

---

## 📋 ÖN GEREKSİNİMLER

Aşağıdaki araçların yüklü olduğundan emin ol:

| Araç | Sürüm | Kurulum |
|------|-------|---------|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org/) (LTS önerilen) |
| **npm** | 10+ | Node.js ile gelir |
| **Git** | son | [git-scm.com](https://git-scm.com/) |
| **Expo CLI** | son | `npm install -g expo-cli` |
| **EAS CLI** | son | `npm install -g eas-cli` |
| **Firebase CLI** | son | `npm install -g firebase-tools` |
| **Xcode** (iOS için) | 15+ | App Store (sadece macOS) |
| **Android Studio** | son | [developer.android.com](https://developer.android.com/studio) |
| **Watchman** (macOS) | son | `brew install watchman` |

### Test Cihazı veya Simülatör
- **iOS**: Xcode Simulator veya gerçek iPhone (iOS 13+)
- **Android**: Android Studio Emulator veya gerçek cihaz (API 24+)

---

## 🚀 ADIM 1 — PROJEYİ KOPYALA

```bash
# Kaynak kodun bulunduğu yer
cd /yol/onee/handoff_paketi/01_Uygulama_Kodu

# Veya Git repository varsa
git clone https://github.com/SENIN_REPO/pratik-tarifler.git
cd pratik-tarifler
```

---

## 📦 ADIM 2 — BAĞIMLILIKLARI KUR

```bash
# Ana uygulama bağımlılıkları
npm install

# Cloud Functions bağımlılıkları
cd functions
npm install
cd ..

# iOS native bağımlılıkları (sadece macOS)
cd ios && pod install && cd ..
```

> ⚠️ Eğer `npm install` hata verirse, `package-lock.json`'u silip tekrar dene. Hâlâ hata varsa Node.js sürümünü kontrol et.

---

## 🔐 ADIM 3 — ÇEVRE DEĞİŞKENLERİNİ AYARLA

```bash
# .env.example'ı kopyala
cp .env.example .env
```

Şimdi `.env` dosyasını aç ve aşağıdaki değerleri **kendi Firebase/Google projelerinden** al:

```env
# Firebase Configuration (Firebase Console → Project Settings → SDK setup)
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=pratik-tarifler.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=pratik-tarifler
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=pratik-tarifler.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:ios:abc123
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Sign-In Client IDs (Google Cloud Console → APIs & Services → Credentials)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com

# RevenueCat API Keys (RevenueCat dashboard → Projects → API Keys)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxx

# Sentry DSN (Sentry dashboard → Project → Client Keys)
EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

> 🔒 **Güvenlik:** `.env` dosyası **asla Git'e gitmemeli**. `.gitignore` zaten içerir ama kontrol et.

> 📘 Firebase ve diğer servislerin nasıl kurulacağı için `03_BACKEND_KURULUM/` klasörüne bak.

---

## ✅ ADIM 4 — KOD KALİTE KONTROLLERİ

```bash
# TypeScript tip kontrolü — hata vermesin
npm run typecheck

# Lint kontrolü
npm run lint

# Birim testler
npm test

# Tüm üçü tek seferde
npm run typecheck && npm run lint && npm test
```

> Üçü de yeşil yanmalı. Hata varsa **devam etmeden** çöz.

---

## 📱 ADIM 5 — UYGULAMAYI ÇALIŞTIR

### Geliştirme Sunucusu
```bash
npx expo start
```

Bu komut bir QR kod gösterir. Şu seçeneklerden birini kullan:

#### A) iOS Simulator (macOS)
```bash
npx expo start --ios
```

#### B) Android Emulator
```bash
npx expo start --android
```

#### C) Gerçek Cihaz (Expo Go)
1. App Store / Play Store'dan **Expo Go** uygulamasını yükle
2. QR kodu telefonla okut

#### D) Geliştirme Build (önerilen — tam native özellikler için)
```bash
# Önce development build oluştur (sadece bir kez)
eas build --profile development --platform ios
eas build --profile development --platform android

# Sonra Metro bundler'ı başlat
npx expo start --dev-client
```

---

## 🌱 ADIM 6 — VERİTABANI SEED (TARIFLERI YÜKLE)

```bash
# Firebase'de oturum aç
firebase login

# Projeyi seç
firebase use pratik-tarifler

# 2500 tarifi Firestore'a yükle
npm run seed
```

> Bu komut ~5-10 dakika sürer (network'e bağlı). Sonunda Firestore'da `recipes_tr` koleksiyonunda 2500 doküman olmalı.

---

## 🎯 ADIM 7 — TEMEL ÇALIŞMA TESTI

Uygulama açıldıktan sonra şunları kontrol et:

- [ ] Karşılama / Giriş ekranı görünüyor
- [ ] Anonim giriş çalışıyor
- [ ] Ana sayfa açılıyor, "Bugünün tarifi" yükleniyor
- [ ] 3 mod kartı görünüyor
- [ ] Mod 3 (Keşfet) tıklayınca tarifler listesi geliyor
- [ ] Bir tarif aç — detay ekranı, malzemeler, adımlar görünüyor
- [ ] Pişirme Modu çalışıyor (sayaç, sonraki adım)
- [ ] Dil değiştir → ekrandaki tüm metinler değişiyor
- [ ] Premium sayfası açılıyor (RevenueCat bağlı değilse hata verebilir, normal)

> Bunlardan biri çalışmıyorsa `03_sorun_giderme.md` dosyasına bak.

---

## 🔄 GÜNLÜK GELİŞTİRME AKIŞI

```bash
# 1. Her gün önce
git pull
npm install  # package.json değişmişse

# 2. Geliştirme sunucusunu başlat
npx expo start --dev-client

# 3. Değişiklik yap, test et

# 4. Commit öncesi
npm run lint
npm run typecheck
npm test

# 5. Commit + push
git add .
git commit -m "feat: yeni özellik"
git push
```

---

## 🆘 YAYGIN SORUNLAR

### "Metro bundler can't find module"
```bash
npx expo start --clear
# veya
rm -rf node_modules .expo
npm install
```

### "iOS Simulator build hatası"
```bash
cd ios
pod deintegrate
pod install
cd ..
npx expo start --ios --clear
```

### "Android Gradle hatası"
```bash
cd android
./gradlew clean
cd ..
npx expo start --android --clear
```

### "Firebase: app not initialized"
- `.env` dosyası dolu mu kontrol et
- Firebase Console'dan iOS/Android için `GoogleService-Info.plist` ve `google-services.json` indirilmiş ve doğru yere konmuş mu?

---

## ➡️ SONRAKİ ADIM

Yerel kurulum tamam mı? Şimdi:
- **`02_kod_yapisi.md`** — kodun derinlemesine anlatımı
- **`../03_BACKEND_KURULUM/01_firebase_setup.md`** — Firebase'i sıfırdan kur

---

*Takıldığın yer olursa: destek@pratiktarifler.app*
