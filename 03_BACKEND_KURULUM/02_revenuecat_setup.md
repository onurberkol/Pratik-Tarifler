# 💰 RevenueCat — Abonelik Sistemi Kurulumu

> RevenueCat, iOS ve Android'de IAP (In-App Purchase) yönetimini tek SDK ile çözer. Sandbox testleri, webhook'lar, abonelik durumu senkronizasyonu — hepsi RevenueCat üzerinden.

**Tahmini süre:** 1-2 saat.

---

## 📋 GENEL BAKIŞ

```
[Uygulama] ─→ RevenueCat SDK ─→ Apple/Google IAP
                  ↓ webhook
            [Cloud Function] ─→ Firestore (user.subscription)
```

---

## 1️⃣ REVENUECAT HESABI VE PROJE

### 1.1 — Kayıt
→ [app.revenuecat.com](https://app.revenuecat.com/) — ücretsiz başlangıç ($2.5K/ay revenue'ye kadar bedava)

### 1.2 — Proje oluştur
- **Project name**: Pratik Tarifler
- **Bundle ID / Package**: `app.pratiktarifler`

### 1.3 — API Key'leri al
Project Settings → API Keys:
- **iOS public**: `appl_xxxxx` → `.env` → `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
- **Android public**: `goog_xxxxx` → `.env` → `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
- **Secret API Key**: Cloud Functions için, asla istemcide kullanma

---

## 2️⃣ iOS APP CONNECT BAĞLANTISI

### 2.1 — App Store Connect → Users and Access → Keys → "+" → "App Manager" rolü
- Key'i indir (`.p8` dosyası)
- Key ID ve Issuer ID'yi not et

### 2.2 — RevenueCat → Project Settings → Apps → iOS
- **App Store Connect API Key** sekmesinde:
  - Key ID: `XXXXXXXXXX`
  - Issuer ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
  - Private Key (.p8): yükle

### 2.3 — Shared Secret bağla
App Store Connect → My Apps → Pratik Tarifler → App-Specific Shared Secret → kopyala
RevenueCat → Apps → iOS → "App-Specific Shared Secret" → yapıştır

---

## 3️⃣ ANDROID GOOGLE PLAY BAĞLANTISI

### 3.1 — Google Play Console → Setup → API access → "Create new service account"
1. Google Cloud Console'a yönlendirir
2. Service account oluştur, JSON key indir
3. Play Console'a dön → "Grant access" → Financial data, Manage orders

### 3.2 — RevenueCat → Project Settings → Apps → Android
- **Service Account credentials JSON**: yüklediğin dosyayı yapıştır

---

## 4️⃣ PRODUCTS — IAP ÜRÜN TANIMI

### 4.1 — App Store Connect'te oluştur (önce iOS):
- `app.pratiktarifler.premium.monthly` — 49 ₺/ay, 7 gün ücretsiz
- `app.pratiktarifler.premium.yearly` — 399 ₺/yıl, 7 gün ücretsiz

### 4.2 — Google Play Console'da aynı ID'lerle oluştur

### 4.3 — RevenueCat → Products → "Import from store"
RevenueCat otomatik fetch eder. İkisinin de göründüğünden emin ol.

---

## 5️⃣ ENTITLEMENTS

RevenueCat → Entitlements → "+ New":
- **Identifier**: `premium`
- **Display name**: Pratik Tarifler Premium
- **Attached products**:
  - ☑️ `app.pratiktarifler.premium.monthly`
  - ☑️ `app.pratiktarifler.premium.yearly`

---

## 6️⃣ OFFERINGS

RevenueCat → Offerings → "+ New":
- **Identifier**: `default`
- **Display name**: Default Offering

### Packages
- **Monthly** package:
  - Identifier: `$rc_monthly`
  - Products: `app.pratiktarifler.premium.monthly` (iOS + Android)
- **Annual** package:
  - Identifier: `$rc_annual`
  - Products: `app.pratiktarifler.premium.yearly` (iOS + Android)
  - ☑️ Mark as default (UI'da öne çıkarmak için)

---

## 7️⃣ WEBHOOKS

RevenueCat → Project Settings → Integrations → Webhooks → "+ New":

| Alan | Değer |
|------|-------|
| **URL** | `https://europe-west3-pratik-tarifler.cloudfunctions.net/revenuecatWebhook` |
| **Authorization Header** | `Bearer <REVENUECAT_WEBHOOK_SECRET>` |
| **Event types** | ☑️ All events |

Aynı secret'ı Cloud Functions'a da set et:
```bash
firebase functions:secrets:set REVENUECAT_WEBHOOK_SECRET
firebase deploy --only functions:revenuecatWebhook
```

---

## 8️⃣ TEST SENARYOLARI

### iOS Sandbox
1. App Store Connect → Users and Access → Sandbox Testers → "+ New"
2. Yeni e-posta (gerçek değil, örn. `test+1@pratiktarifler.app`)
3. iOS Settings → App Store → Sandbox Account → sandbox test hesabıyla giriş
4. Uygulamada satın alma yap — RevenueCat dashboard'da görmeli

### Android License Testing
1. Play Console → Setup → License testing → Tester e-postanı ekle
2. Bu hesapla Play Store'dan uygulamayı yükle
3. Test satın alma — gerçek para kesilmez

### Test Edilecek Akışlar
- [ ] Aylık satın alma → Premium aktif olmalı
- [ ] Yıllık satın alma → Premium aktif olmalı
- [ ] 7 gün ücretsiz deneme başlat
- [ ] Deneme süresince iptal et → süre bitince Premium kalkar
- [ ] Manuel iptal → mevcut dönem sonuna kadar Premium aktif
- [ ] Restore purchases (yeni cihazda) → eski abonelik geri yüklenir
- [ ] Refund senaryosu (Apple/Google panel'inden) → Premium kalkmalı

---

## ⚠️ YAYGIN HATALAR

### "Products not found"
- App Store Connect'te ürünler "Ready to Submit" durumunda mı?
- RevenueCat'te ürün ID'leri **harfi harfine** App Store ile aynı mı?
- iOS'ta uygulama bundle ID'si RevenueCat ile eşleşiyor mu?

### "Sandbox purchase fails"
- iOS Settings → Apple ID → Sign Out → sandbox account ile tekrar gir
- TestFlight build'inde değil, **EAS Build geliştirici sürümünde** test et

### Webhook çalışmıyor
- Cloud Functions URL'i tam doğru mu?
- `REVENUECAT_WEBHOOK_SECRET` set edildi mi?
- Function deploy hatasız mı? `firebase functions:log`

---

*Yardım: destek@pratiktarifler.app*
