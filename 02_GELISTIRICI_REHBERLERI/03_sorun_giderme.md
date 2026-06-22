# 🔧 Sorun Giderme — Yaygın Hatalar ve Çözümleri

---

## 🛑 KURULUM SORUNLARI

### "Cannot find module 'expo'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Pod install failed" (iOS)
```bash
cd ios
pod deintegrate
rm Podfile.lock
pod install
cd ..
```

### "SDK version mismatch"
```bash
npx expo install --fix
```

### "Metro bundler can't resolve module"
```bash
npx expo start --clear
# veya
rm -rf .expo node_modules
npm install
```

---

## 📱 RUNTIME HATALARI

### "Firebase: app not initialized"
- `.env` dosyası dolu mu?
- `EXPO_PUBLIC_FIREBASE_*` değişkenleri set edilmiş mi?
- `GoogleService-Info.plist` (iOS) doğru yerde mi?
- `google-services.json` (Android) doğru yerde mi?

### "Network request failed"
- Cihaz internet bağlantısı var mı?
- Firebase Functions region doğru mu? (europe-west3)
- Cors hatası mı? — Functions'da CORS middleware var mı kontrol et

### "Permission denied" (Firestore)
- Firestore rules deploy edildi mi? `firebase deploy --only firestore:rules`
- Kullanıcı oturum açmış mı? `auth.currentUser` null mu kontrol et

### "Camera permission denied"
- iOS: Info.plist'te `NSCameraUsageDescription` var mı?
- Android: AndroidManifest'te `CAMERA` permission var mı?
- Kullanıcı reddetmiş olabilir — Ayarlar'dan açmasını söyle

### "Failed to load recipes"
- Firestore'da `recipes_tr` koleksiyonu dolu mu? (`npm run seed` çalıştırdın mı?)
- Index hatası mı? — Konsol log'unu kontrol et, `firebase deploy --only firestore:indexes`

---

## 🏗️ BUILD HATALARI

### EAS Build başarısız (iOS)
```bash
# 1. Logs'a bak
eas build:list
eas build:view [BUILD_ID]

# 2. Credentials sorunu olabilir
eas credentials
```

Yaygın sebepler:
- Provisioning profile eksik → `eas credentials --platform ios`
- Apple Team ID değişti → `eas.json` güncelle
- Bundle ID Apple Developer'da yok → Identifiers'ta ekle

### EAS Build başarısız (Android)
- Keystore eksik → `eas credentials --platform android` → "Set up a new keystore"
- Service account JSON eksik → Play Console'dan indir, `eas.json`'a ekle

### Local development build başarısız
```bash
# iOS
cd ios
xcodebuild clean
cd ..
npx expo run:ios

# Android
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

## 🧪 TEST HATALARI

### "Jest can't find module"
- `jest.config.js`'de `moduleNameMapper` doğru mu?
- `__mocks__` klasöründe gerekli mock'lar var mı?

### "Detox E2E timeout"
- Simulator açık mı?
- App fresh state'te mi? (`detox build && detox test`)

---

## 🔥 FIREBASE SORUNLARI

### Cloud Functions deploy başarısız
```bash
# Logs
firebase deploy --only functions --debug

# Tek tek deploy
firebase deploy --only functions:getRecipeRecommendations
```

Yaygın:
- TypeScript hatası → `cd functions && npm run build`
- Memory limit aşımı → `firebase.json`'da memory artır
- Timeout → `runWith({ timeoutSeconds: 540 })`

### Firestore quota aşımı
- Read/write fazlaysa → indexes optimize et, query sayısını azalt
- Console → Usage → grafiklere bak, anormal artış varsa loop var demektir

---

## 💰 IAP / PREMIUM SORUNLARI

### Sandbox satın alma başarısız
- iOS Settings → Apple ID → Sign Out
- Sandbox account ile tekrar Sign In
- Restart app

### Webhook gelmiyor
- RevenueCat dashboard → Webhooks → "Send test event"
- Cloud Function logs: `firebase functions:log --only revenuecatWebhook`
- Authorization header doğru mu?

### Premium aktif ama uygulama göstermiyor
- Firestore'da `users/{uid}.subscription.status = "active"` mı?
- Listener çalışıyor mu? `useEffect`'te Firestore subscription
- App restart denedin mi?

---

## 🌐 ÇEVİRİ SORUNLARI

### Bazı metinler İngilizce kalmış
- `src/locales/{lang}.json`'da o anahtar var mı?
- Anahtar yapısı diğer dillerle aynı mı?
- `npm run build:locales` çalıştır → eksikleri raporlar

### RTL bozuk
- `I18nManager.forceRTL(true)` çağrılmış mı? (Arapça/İbranice'de)
- Layout'lar `flexDirection: 'row'` kullanıyorsa RTL'de ters olur — `row-reverse` veya logical (`marginStart` vs `marginLeft`)

---

## ⚡ PERFORMANS SORUNLARI

### Tarif listesi yavaş
- FlashList kullanılıyor mu? (FlatList yerine)
- `keyExtractor` tanımlı mı?
- Görseller optimize mi? (WebP, BlurHash placeholder)

### Uygulama yüksek RAM kullanıyor
- React DevTools Profiler ile incele
- `React.memo`, `useMemo`, `useCallback` ile gereksiz re-render önle
- Eski reference'ları temizle (clear interval/timeout)

### Cold start yavaş
- Splash screen ne kadar görünüyor? > 3 saniye sorun
- Bundle size: `npx expo-doctor` ile kontrol et
- Lazy load et: `React.lazy()` ile büyük screen'ler

---

## 🆘 SON ÇARE

Hiçbir şey çalışmıyorsa:

1. **Git stash + temiz clone**
   ```bash
   git stash
   git checkout main
   git pull
   rm -rf node_modules .expo ios/Pods
   npm install
   cd ios && pod install && cd ..
   npx expo start --clear
   ```

2. **Expo Doctor**
   ```bash
   npx expo-doctor
   ```

3. **Issue açma**
   - destek@pratiktarifler.app
   - GitHub Issues (varsa repo)
   - Stack Overflow (`react-native`, `expo` tag'leri)

---

*Sonraki: `04_build_ve_deploy.md`*
