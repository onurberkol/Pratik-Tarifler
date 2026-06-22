# Pratik Tarifler / Pratik Tarifler

> "Söyle, biz pişirelim." — 13 dilde, malzemelerinize göre tarif bulan mobil uygulama.

**Stack:** React Native + Expo SDK 54 (Expo Go 54 uyumlu) • TypeScript • Firebase (Auth + Firestore + Functions + Storage) • i18next • Zustand • TanStack Query • expo-router v4

---

## ⚡ Hızlı Başlangıç

```bash
# 1. Bağımlılıkları kur
npm install

# 2. Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını doldur (Firebase + Google Sign-In)

# 3. Çalıştır (Expo Go ile)
npm start
# QR kodu Expo Go uygulamasıyla tara
```

## 🔥 Firebase Kurulumu

### 1. Yeni proje oluştur
[Firebase Console](https://console.firebase.google.com) → **Add Project** → "pratik-tarifler"

### 2. Aktive et
- **Authentication** → Email/Password, Google, Apple, Anonymous
- **Firestore Database** → `europe-west` bölgesi
- **Storage** → varsayılan bucket
- **Functions** → Blaze planı (IAP doğrulaması için dış API çağrısı gerekir)

### 3. iOS/Android uygulamalarını kaydet
- Bundle ID: `app.pratiktarifler`
- iOS için `GoogleService-Info.plist`, Android için `google-services.json` indir
- (Expo managed workflow'da bu dosyalar EAS build sırasında otomatik enjekte edilir)

### 4. Web App'i de ekle (env değişkenleri için)
Project Settings → General → Your apps → Add web app → config'i kopyala → `.env`'e yapıştır.

### 5. Firestore Rules ve Index'leri deploy et
```bash
npm install -g firebase-tools
firebase login
firebase use pratik-tarifler
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

### 6. Cloud Functions deploy
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### 7. Veritabanını besle (seed)
1. Firebase Console → Project Settings → Service Accounts → **Generate new private key**
2. İndirilen JSON'u `service-account.json` olarak proje köküne koy
3. ```bash
   npm run seed
   ```

## 💳 In-App Purchase Kurulumu

### App Store Connect
1. **Subscriptions** grubu oluştur: "Pratik Tarifler Premium"
2. İki abonelik ekle:
   - `app.pratiktarifler.premium.monthly` — Monthly — 7 günlük ücretsiz deneme
   - `app.pratiktarifler.premium.yearly` — Yearly — 7 günlük ücretsiz deneme
3. **App Store Server Notifications**: Cloud Functions URL'sini ekle
4. **Shared Secret**: Functions config'e ekle:
   ```bash
   firebase functions:secrets:set APPLE_SHARED_SECRET
   ```

### Google Play Console
1. **Monetize → Subscriptions** → iki ürün ekle:
   - `premium_monthly` ve `premium_yearly`
2. **API Access** → service account oluştur → Cloud Functions'ta `androidpublisher` scope'u

## 🛠 Geliştirme

```bash
npm start              # Expo dev server
npm test               # Jest unit testleri
npm run typecheck      # TypeScript kontrolü
npm run lint           # ESLint
```

### Firebase Emulator Suite (offline geliştirme)
```bash
firebase emulators:start
```

## 📦 Üretim Build'i

### EAS CLI kurulumu
```bash
npm install -g eas-cli
eas login
eas init  # eas.json içindeki projectId'yi günceller
```

### Build
```bash
eas build --platform ios       # iOS .ipa
eas build --platform android   # Android .aab
```

### Store'a yükle
```bash
eas submit --platform ios
eas submit --platform android
```

## 📁 Proje Yapısı

```
pratik_tarifler_app/
├── app/                    # Expo Router ekranları
│   ├── (auth)/            # Giriş/Kayıt
│   ├── (tabs)/            # Ana navigasyon (Home, Search, Favorites, Profile)
│   ├── recipe/            # Tarif detay + Pişirme modu
│   ├── settings/          # Dil, Premium, Alışveriş listesi
│   └── _layout.tsx        # Kök provider
├── src/
│   ├── api/               # Firebase çağrıları (auth, recipes, favorites, premium, shopping)
│   ├── components/        # UI bileşenleri
│   ├── hooks/             # React hook'ları (TanStack Query)
│   ├── lib/               # Firebase init, i18n, matcher algoritması
│   ├── locales/           # 13 dilin JSON dosyaları
│   ├── store/             # Zustand state
│   ├── theme/             # Renkler, spacing, typography
│   └── types/             # TypeScript tipleri
├── functions/             # Cloud Functions (TypeScript)
├── data/                  # Seed verisi (tarifler + malzeme sözlüğü)
├── scripts/               # Yardımcı scriptler (seed, locale gen)
├── assets/                # App icon, splash, vb.
├── __tests__/             # Jest testleri
├── firestore.rules        # Güvenlik kuralları
├── firestore.indexes.json # Composite indexler
├── storage.rules          # Storage güvenlik kuralları
├── firebase.json          # Firebase konfigürasyonu
├── eas.json               # EAS build profilleri
├── app.config.ts          # Expo runtime config
└── package.json
```

## 🌍 Desteklenen Diller

🇹🇷 Türkçe • 🇬🇧 English • 🇩🇪 Deutsch • 🇫🇷 Français • 🇮🇹 Italiano • 🇪🇸 Español • 🇵🇹 Português • 🇬🇷 Ελληνικά • 🇳🇱 Nederlands • 🇷🇺 Русский • 🇷🇸 Српски • 🇸🇦 العربية (RTL) • 🇮🇱 עברית (RTL)

## 🎯 Eşleşme Algoritması

Detaylı algoritma için `src/lib/matcher.ts` ve teknik dokümantasyon §7'ye bakın. Özetle:

- Her tarif malzemesi için ağırlık (staples = 0.5, normal = 1.0)
- `pct = (haveWeight / totalWeight) × 100`
- Primary ingredient yakalandıysa +15% bonus
- 100 ile sınırla
- Sıralama: match desc → rating desc → time asc

## 📜 Lisans

Bu kod tabanı sahibinin mülküdür. Tüm hakları saklıdır.
