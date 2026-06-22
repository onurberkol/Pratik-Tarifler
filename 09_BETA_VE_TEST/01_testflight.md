# 🧪 TestFlight — iOS Beta Test Rehberi

> TestFlight, App Store'a göndermeden önce gerçek kullanıcılarla test yapmanın resmi yoludur. **Apple submit etmeden ÖNCE 1-2 hafta TestFlight kullanın.**

---

## 📋 GENEL AKIŞ

```
EAS Build → TestFlight'a otomatik upload → İç test (25 kişi)
→ Beta App Review (~24 saat) → Harici test (10.000 kişi)
→ Geri bildirim topla → App Store submit
```

---

## 1️⃣ İLK BUILD'İ YÜKLEME

```bash
# Production profile ile build al — TestFlight'a otomatik gönderir
eas build --profile production --platform ios --auto-submit
```

Build ~15-30 dakika sürer. Bittikten ~10-30 dakika sonra App Store Connect → TestFlight → iOS Builds altında görürsün.

### Eğer "Build is Processing" sıkıştıysa
- 1 saat bekle, Apple bazen yavaş
- "Missing Compliance" çıkarsa → Build → "Export Compliance" → "No" işaretle

---

## 2️⃣ İÇ TEST GRUBU (Internal Testing)

> İlk 100 test kullanıcısı için **review gerekmez**, anında erişim.

### App Store Connect → TestFlight → Internal Testing → "+" → "Create New Group"
- **Group name**: `Internal Team`
- **Enable automatic distribution**: ✅
- **Add testers**: App Store Connect rolü olan ekip üyelerini ekle (max 100)

Test kullanıcıları TestFlight uygulamasından davetiyeyi kabul edip uygulamayı indirir.

---

## 3️⃣ HARİCİ TEST GRUBU (External Testing)

> 10.000 kişiye kadar dış test. **İlk build için Beta App Review (~24 saat) gerekli.**

### TestFlight → External Testing → "+" → "Create New Group"
- **Group name**: `Beta Testers`
- **Test Information** doldur (TR):

#### What to Test
```
Pratik Tarifler v1.0.0 beta sürümünü test ediyorsunuz!

Lütfen şu özellikleri test edin:
🧪 Mod 1 — Buzdolabı taraması (kamera izni gerekli)
🧪 Mod 2 — 1-2 ek malzemeyle tarif önerileri
🧪 Mod 3 — Sınırsız keşfet ve filtreleme
🧪 Tarif detayı ve "Pişirmeye Başla" akışı
🧪 Favori ekleme/çıkarma
🧪 Dil değiştirme (Profil → Dil)
🧪 Premium satın alma (Sandbox — gerçek ödeme yok)

⚠️ Lütfen hataları TestFlight içindeki "Send Beta Feedback" ile bildirin.
Veya: destek@pratiktarifler.app
```

#### Description
```
AI destekli akıllı tarif uygulaması. Buzdolabını çek, yapay zeka ne pişireceğini söylesin.
```

#### Beta App Review Information (KRİTİK!)
- **Sign-In Required**: ☑️ Yes
- **Username**: `apple.reviewer@pratiktarifler.app`
- **Password**: `AppleReview2026!`
- **Notes**: `04_APP_STORE_SUBMISSION/01_apple_app_store_rehberi.md` → "App Review Information" bölümünden kopyala

---

## 4️⃣ TESTER DAVET ETMEK

### Yöntem 1: E-posta listesi
External Testing group → "Add Testers" → "Add by Email":
- Toplu yapıştır (her satır bir e-posta)
- Maksimum 200 kişi/seferinde

### Yöntem 2: Public Link
- External Testing group → "Public Link" → "Enable"
- Üretilen linki sosyal medyada paylaş
- 10.000 kişiye kadar (otomatik kapanır limit dolunca)

---

## 5️⃣ BUILD NOTLARI VE SÜRÜM YÖNETİMİ

Her yeni build için:
```bash
# 1. app.config.ts'te buildNumber'ı artır (manuel)
# 2. Build al (autoIncrement EAS'ta otomatik artırır)
eas build --profile production --platform ios --auto-submit
```

TestFlight'ta her build için **"What to Test"** notu güncellenmeli:
```
v1.0.0 (Build 5) — 12 Haziran 2026
• Sayaç hatası düzeltildi
• Pişirme modu sesli komutlar eklendi
• 50 yeni Türk mutfağı tarifi
```

---

## 6️⃣ GERİ BİLDİRİM TOPLAMA

### TestFlight içi feedback
- App Store Connect → TestFlight → Feedback
- Screenshot + crash log otomatik gelir

### Manuel kanallar
- E-posta: destek@pratiktarifler.app
- Form: https://pratiktarifler.app/beta-feedback
- WhatsApp/Slack grubu (içerideki ekip için)

### Metrikler takip et
- **Crash-free rate** ≥ %99.5 (Sentry/Crashlytics)
- **Average session duration** ≥ 3 dakika
- **D1 retention** ≥ %40

---

## 7️⃣ EXPIRY VE TEMİZLİK

- TestFlight build'leri **90 gün** sonra expire olur
- Aktif test sürdüğü sürece her ay yeni build at
- Eski build'leri "Expire" durumuna otomatik geçer — temizle

---

## ⚠️ YAYGIN HATALAR

### "Beta App Review Rejected"
- Test instructions çok kısa → daha detaylı yaz
- Demo hesap çalışmıyor → Firebase Auth'ta varlığını doğrula
- Permission açıklamaları zayıf → Info.plist'i güncelle

### "Build Stuck in Processing"
- 2 saatten fazla sürerse Apple'a ticket aç
- veya yeni build at, eskiyi sil

### "Public Link doesn't work"
- Group'ta en az 1 onaylı build olmalı
- Beta App Review tamamlanmamışsa link aktif olmaz

---

## ✅ TESTFLIGHT TAMAM KONTROL LİSTESİ

- [ ] İlk production build yüklendi
- [ ] Internal Testing grup oluşturuldu
- [ ] En az 5 iç tester davet edildi ve uygulamayı yükledi
- [ ] External Testing grup oluşturuldu
- [ ] Beta App Review onaylandı
- [ ] Public Link aktif (veya tester listesi tam)
- [ ] 50+ external tester aktif kullanıyor
- [ ] Crash-free rate ≥ %99.5
- [ ] Beta için en az 2 hafta test süresi geçti
- [ ] Kritik bug'lar düzeltildi, yeni build yüklendi

➡️ Hepsi tamamsa → **App Store submission**'a hazırsın.

---

*Yardım: destek@pratiktarifler.app*
