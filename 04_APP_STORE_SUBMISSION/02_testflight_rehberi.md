# 🧪 TestFlight Hızlı Referans

> Detaylı rehber: `../09_BETA_VE_TEST/01_testflight.md`

Bu dosya, TestFlight'la ilgili **sık başvurulan komut ve linkleri** içerir.

---

## ⚡ HIZLI KOMUTLAR

```bash
# Production build + TestFlight'a otomatik yükle
eas build --profile production --platform ios --auto-submit

# Mevcut build'i submit et (build daha önce alındıysa)
eas submit --platform ios --latest

# Build durumunu kontrol et
eas build:list --platform ios

# Spesifik build'i incele
eas build:view [BUILD_ID]
```

---

## 🔗 ÖNEMLİ LİNKLER

- App Store Connect: https://appstoreconnect.apple.com
- TestFlight Builds: https://appstoreconnect.apple.com/apps/[APP_ID]/testflight
- Apple Developer: https://developer.apple.com
- EAS Dashboard: https://expo.dev/accounts/[ACCOUNT]/projects/pratik-tarifler

---

## 📱 TESTER OLARAK NASIL KATILIRSIN

1. iPhone'a **TestFlight** uygulamasını yükle (App Store'dan)
2. Davet e-postası gelir → "View in TestFlight" tıkla
3. Veya Public Link → "Accept" → uygulamayı yükle
4. Pratik Tarifler TestFlight'ta görünür

> İlk gün için 30+ tester davet et — feedback bolca olur.

---

## 🐛 FEEDBACK NASIL TOPLANIR?

TestFlight tester'lar 2 yolla feedback verebilir:

### Yöntem 1: TestFlight içi
- Pratik Tarifler'i TestFlight'ta aç
- "Send Beta Feedback" tıkla
- Screenshot + açıklama → otomatik App Store Connect'e gider

### Yöntem 2: Uygulama içi shake gesture
- TestFlight uygulamalarda iPhone sallandığında otomatik feedback ekranı açar
- Screenshot anlık çekilir

---

## 📊 TESTFLIGHT METRİKLERİ

App Store Connect → TestFlight → her build için:
- **Total Tester Sessions** — kaç kez açıldı
- **Crash Count** — çökme sayısı
- **Install Count** — kaç kişi yükledi
- **Feedback Count** — gelen mesaj sayısı

Hedef: %95+ tester aktif kullanıyor, crash count < %1.

---

*Detaylar: `../09_BETA_VE_TEST/01_testflight.md`*
