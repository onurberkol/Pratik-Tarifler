# 🚀 Build ve Deploy Rehberi

> EAS Build ve EAS Submit ile bulutta build alma, store'lara yükleme.

---

## ☁️ EAS BUILD — TEMEL

### Build profile'ları (eas.json)

| Profil | Amaç | Distribution |
|--------|------|--------------|
| `development` | Geliştirme — dev client | Internal (TestFlight değil) |
| `preview` | İç test, hızlı paylaşım | Internal |
| `production` | Store submission | App Store / Play Store |

### iOS Build
```bash
# Development build (Metro Bundler ile development)
eas build --profile development --platform ios

# Preview build (hızlı paylaşım, IPA dosyası)
eas build --profile preview --platform ios

# Production build (TestFlight + App Store için)
eas build --profile production --platform ios

# TestFlight'a otomatik yükle
eas build --profile production --platform ios --auto-submit
```

### Android Build
```bash
# Development
eas build --profile development --platform android

# Preview (APK indirilebilir)
eas build --profile preview --platform android

# Production (AAB, sadece Play Store)
eas build --profile production --platform android

# Play Store'a otomatik yükle
eas build --profile production --platform android --auto-submit
```

### Tek komutla iki platform
```bash
npm run build:all
# = eas build --profile production --platform all
```

---

## 📤 EAS SUBMIT — STORE'A YÜKLEME

### iOS — App Store Connect'e
```bash
eas submit --platform ios --latest
# Latest build'i submit eder
```

Gerekli (`eas.json`'da):
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-email@example.com",
      "ascAppId": "1234567890",
      "appleTeamId": "ABCDEF1234"
    }
  }
}
```

### Android — Google Play Console'a
```bash
eas submit --platform android --latest
```

Gerekli:
- `play-service-account.json` proje kökünde
- `eas.json`'da Android submit config

---

## 🎯 EAS UPDATE — OTA (Over-The-Air)

Native kod değişmeden JS/asset güncellemesi → store review'a gerek yok!

### Kullanım alanları
- Bug fix (sadece JS)
- İçerik güncellemesi (yeni dil çevirileri, vs.)
- A/B test rollout

### Komut
```bash
eas update --branch production --message "Çeviri güncellemeleri"
```

### Channel'lar
| Channel | İçerik |
|---------|--------|
| `production` | Store'daki üretim sürümü |
| `preview` | Beta tester'lar |
| `development` | Dev cihazlar |

> Major version bump (1.0.0 → 1.1.0) için EAS Update YETMEZ, native build gerekli.

---

## 🔐 CREDENTIALS YÖNETİMİ

### iOS
```bash
eas credentials --platform ios
```

Menü:
- Setup Push Notifications
- Setup Distribution Certificate
- Setup Provisioning Profile
- Remove credentials

### Android
```bash
eas credentials --platform android
```

- Generate new Keystore
- Setup Service Account
- Remove credentials

> ⚠️ **Keystore kaybedersen → uygulama güncellenemez!** Yedekle.

---

## 🏃 LOKAL BUILD (EAS olmadan)

### iOS (Xcode)
```bash
npx expo run:ios --device
# Xcode açar, gerçek cihazda çalıştırır
```

### Android (Gradle)
```bash
npx expo run:android --device
```

### Release APK üretmek (lokal)
```bash
cd android
./gradlew bundleRelease
# Çıktı: android/app/build/outputs/bundle/release/app-release.aab
```

> Lokal build genellikle dev/debug için. Üretim için EAS kullan.

---

## 🔄 CI/CD — GITHUB ACTIONS

`.github/workflows/build.yml`:
```yaml
name: EAS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --profile production --platform all --non-interactive
```

EAS token: Expo dashboard → Account → Access Tokens

---

## 📊 BUILD METRİKLERİ

| Profil | Süre (ortalama) | Boyut |
|--------|-----------------|-------|
| Dev iOS | ~15 dk | ~150 MB |
| Production iOS | ~25 dk | ~80 MB |
| Production Android | ~20 dk | ~60 MB AAB |

---

## ⚠️ YAYGIN HATALAR

### "Build failed: SignerCertificateError"
- iOS provisioning profile expired
- `eas credentials --platform ios` → yenile

### "Could not find any sdk-specific dependencies"
```bash
npx expo install --fix
```

### "AAB upload failed: versionCode already exists"
- `versionCode`'u manuel artır veya `autoIncrement: true` kullan

### "Submission rejected by store"
- TestFlight için Beta App Review gerekli
- Play Production için review süresi var

---

## ✅ DEPLOY KONTROL LİSTESİ

İlk üretim deploy öncesi:
- [ ] `.env` production değerleriyle dolu
- [ ] Firebase Functions production'a deploy edildi
- [ ] EAS credentials hazır
- [ ] `eas.json`'da production submit config
- [ ] Versioning (version, buildNumber, versionCode) doğru
- [ ] Store materyalleri yüklü
- [ ] Beta test ≥ 2 hafta tamamlandı
- [ ] Crash-free ≥ %99.5

---

*Build'in başarılı ya da başarısız olsun, her durumda logları kontrol et: `eas build:view [BUILD_ID]`*
