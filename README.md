<div align="center">

# 🍳 Pratik Tarifler

### Türkiye'nin İlk AI Destekli Akıllı Mutfak Asistanı

**Buzdolabını çek, yapay zekâ ne pişireceğini söylesin.**

[![iOS](https://img.shields.io/badge/iOS-15.0+-000000?logo=apple)](https://apps.apple.com)
[![Android](https://img.shields.io/badge/Android-7.0+-3DDC84?logo=android)](https://play.google.com)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?logo=react)](https://reactnative.dev)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase)](https://firebase.google.com)

[Mobil Uygulama](#-mobil-uygulama) · [Admin Panel](#-admin-panel) · [Dokümantasyon](#-dokümantasyon) · [Kurulum](#-hızlı-başlangıç)

---

</div>

## 📖 Genel Bakış

Pratik Tarifler, kullanıcıların buzdolabı fotoğrafından AI ile yemek tarifi keşfetmesini sağlayan, **2500+ tarif**, **14 mutfak** ve **13 dil** desteğine sahip kapsamlı bir mobil uygulamadır.

### 🎯 3 Akıllı Keşif Modu

| Mod | Açıklama |
|-----|----------|
| **Mod 1 — Evdeki Kalanlarla** | Sadece elindeki malzemelerle yapabileceğin tarifler. Sıfır israf. |
| **Mod 2 — 1-2 Ek Malzemeyle** | Eldekilere ek 1-3 malzemeyle yapılabilecek tarifler + fiyat tahmini. |
| **Mod 3 — Sınırsız Keşif** | Tüm tarif kataloğunda akıllı arama ve filtreleme. |

### ⚙️ Bu Repo'da Ne Var?

```
pratik-tarifler/
├── 📱 mobile-app/         React Native + Expo SDK 54 — iOS & Android uygulaması
├── 🔥 backend/             Firebase Cloud Functions, Firestore, image pipeline, çeviri
├── 🛠️ admin-panel/         Next.js 14 + TypeScript — operasyon kontrol merkezi
├── 📚 docs/                Tüm PDF dokümantasyon, mockup'lar, geliştirici handoff
├── 🎨 store-assets/        App Store + Play Store görsel paketleri (TR + EN)
└── .github/workflows/     CI/CD pipeline (lint + typecheck + deploy)
```

---

## 📱 Mobil Uygulama

**Konum:** `mobile-app/`

React Native + Expo SDK 54 ile inşa edilmiş, TypeScript strict mode. iOS 15+ ve Android 7+ destekli.

### Teknoloji Yığını
- **UI:** React Native 0.74, Reanimated, Skia
- **Navigasyon:** Expo Router (file-based)
- **State:** Zustand + MMKV (persist)
- **Backend:** Firebase Auth + Firestore + Storage + FCM
- **Abonelik:** RevenueCat + Stripe (web)
- **AI:** Claude API (recipe recommendation), DALL·E 3 (görsel)
- **İzleme:** Sentry, Firebase Analytics

### Hızlı Başlangıç

```bash
cd mobile-app
npm install
cp .env.example .env  # Firebase config'lerini doldur

# iOS
npx expo run:ios

# Android
npx expo run:android

# Web preview
npx expo start --web
```

Detaylar: [`docs/handoff/02_GELISTIRICI_REHBERLERI/01_yerel_kurulum.md`](docs/handoff/02_GELISTIRICI_REHBERLERI/)

---

## 🛠️ Admin Panel

**Konum:** `admin-panel/`

Operasyonun tek merkezi. Next.js 14 + TypeScript + Firebase Admin SDK. **admin.pratiktarifler.app** alt domain'inde çalışır.

### ✨ 10 Ana Yetenek

| # | Özellik | Detay |
|---|---------|-------|
| 1 | 📊 **Dashboard** | 8 KPI + 30 gün trend grafiği + son aktivite akışı |
| 2 | 📖 **Tarif Yönetimi** | 2500+ tarif CRUD, JSON içe/dışa aktar, çeviri tetikleme |
| 3 | 👥 **Kullanıcı Yönetimi** | Premium grant/revoke, ban, KVKK uyumlu hesap silme |
| 4 | 🔔 **Push Bildirim** | 13 dilde lokalize, segment hedefleme, zamanlama, metrik |
| 5 | 🎨 **Görsel Pipeline** | 5 kaynaklı (Unsplash → DALL·E), AI onay kuyruğu |
| 6 | 📢 **Duyuru & İpucu** | 4 tür (tip/announcement/promo/update), 3 gösterim yeri |
| 7 | 📈 **Analytics** | 24+ KPI + 8 adımlı dönüşüm hunisi |
| 8 | 🎧 **Destek Talepleri** | Ticket sistemi: durum, kategori, öncelik filtreleri |
| 9 | 🎛️ **Remote Config & A/B Test** | Feature flags, variant koşulları, anlık değişiklik |
| 10 | ⚙️ **RBAC + Audit Log** | 4 rol seviyesi, her işlem kayıt altında |

### Hızlı Başlangıç

```bash
cd admin-panel
npm install
cp .env.example .env  # Firebase Admin SDK + ADMIN_EMAILS'i doldur

npm run dev
# → http://localhost:3000
```

Detaylı kılavuz: [`docs/pdfs/07_Admin_Panel_Kilavuzu_TR.pdf`](docs/pdfs/07_Admin_Panel_Kilavuzu_TR.pdf)

---

## 🔥 Backend

**Konum:** `backend/`

Tüm sunucu tarafı altyapı:

- **`functions/`** — Firebase Cloud Functions (16 fonksiyon): görsel pipeline, push tetikleyiciler, çeviri, RevenueCat webhook
- **`firestore/`** — Güvenlik kuralları + indeksler
- **`database/`** — 2500 tarif (TR, JSON formatında)
- **`image-pipeline/`** — Hibrit görsel üretim (Unsplash + Pexels + Pixabay + DALL·E 3 + Flux Pro)
- **`translation-pipeline/`** — OpenAI Batch API ile 12 dile çeviri

---

## 📚 Dokümantasyon

| Doküman | Açıklama | Boyut |
|---------|----------|-------|
| [`01_Mockup_Ekranlari_TR.pdf`](docs/pdfs/01_Mockup_Ekranlari_TR.pdf) | 8 ekran mockup'ı | — |
| [`02_Teknik_Dokuman_TR_v2.pdf`](docs/pdfs/02_Teknik_Dokuman_TR_v2.pdf) | Mimari, kod yapısı, **+ Admin Panel bölümü** | 854 KB |
| [`03_Urun_Tanitim_TR_v2.pdf`](docs/pdfs/03_Urun_Tanitim_TR_v2.pdf) | Ürün tanıtım, **+ Admin Panel stratejik değer** | 517 KB |
| [`04_Urun_Sunumu_TR_v2.pptx`](docs/pdfs/04_Urun_Sunumu_TR_v2.pptx) | PowerPoint sunumu (**15 slayt** — admin paneli dahil) | 670 KB |
| [`05_Tarif_Katalogu_TR.pdf`](docs/pdfs/05_Tarif_Katalogu_TR.pdf) | 2500 tarif tam katalog | — |
| [`06_Gorsel_Uretim_Kilavuzu_TR.pdf`](docs/pdfs/06_Gorsel_Uretim_Kilavuzu_TR.pdf) | Görsel pipeline kılavuzu | — |
| [`07_Admin_Panel_Kilavuzu_TR.pdf`](docs/pdfs/07_Admin_Panel_Kilavuzu_TR.pdf) | **YENİ** — Admin panel tam kılavuzu | 350 KB |

### 🎯 Developer Handoff Paketi

`docs/handoff/` altında **79 dosya** içeren tam submission paketi:

- App Store + Play Store rehberleri
- Test senaryoları (70+)
- Yasal politikalar (Gizlilik + Kullanım Şartları)
- Metin bankası (TR + EN açıklamalar, e-posta şablonları)
- Backend kurulum rehberleri (Firebase, RevenueCat, Stripe, Sentry)
- 6 haftalık yayın planı

Detaylar: [`docs/handoff/HANDOFF_REHBERI.md`](docs/handoff/HANDOFF_REHBERI.md)

---

## 🚀 Hızlı Başlangıç

### 1. Repo'yu klonla
```bash
git clone https://github.com/YOUR_USERNAME/pratik-tarifler.git
cd pratik-tarifler
```

### 2. Mobil uygulamayı çalıştır
```bash
cd mobile-app && npm install && npm start
```

### 3. Admin paneli çalıştır
```bash
cd admin-panel && npm install && npm run dev
```

### 4. Backend deploy
```bash
cd backend/functions && npm install
firebase deploy --only functions,firestore
```

### 5. Üretim deploy
```bash
# Admin paneli
cd admin-panel && vercel --prod

# Mobil uygulama (EAS Build)
cd mobile-app && eas build --platform all --profile production
eas submit --platform all
```

---

## 📊 Ürün Metrikleri (örnek)

| Metrik | Değer |
|--------|-------|
| Toplam tarif | 2.500+ |
| Desteklenen mutfak | 14 |
| Desteklenen dil | 13 (TR, EN, DE, FR, IT, ES, PT, EL, NL, RU, SR, AR, HE) |
| Mobil platform | iOS 15+, Android 7+ |
| Premium fiyat | ₺49/ay · ₺399/yıl (7 gün ücretsiz deneme) |
| Backend altyapı | Firebase (auth + db + storage + FCM + functions) |
| Crash-free rate | %99.7 hedef |

---

## 🏗️ Mimari

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   📱 Mobile App                          🛠️ Admin Panel         │
│   (iOS + Android)                        (admin.pratik...)      │
│                                                                 │
│   ┌──────────────────┐                  ┌──────────────────┐    │
│   │ React Native     │                  │ Next.js 14       │    │
│   │ + Expo SDK 54    │                  │ + TypeScript     │    │
│   └────────┬─────────┘                  └────────┬─────────┘    │
│            │                                     │              │
│            └─────────────┬───────────────────────┘              │
│                          ▼                                      │
│       ┌──────────────────────────────────────────────┐          │
│       │           🔥 Firebase Backend                │          │
│       │  Auth · Firestore · Storage · FCM · Functions│          │
│       └─────────────────┬────────────────────────────┘          │
│                         │                                       │
│       ┌─────────────────┼─────────────────┐                     │
│       ▼                 ▼                 ▼                     │
│   RevenueCat       OpenAI/Claude     Sentry/Analytics           │
│   (Abonelik)       (AI + Görsel)    (İzleme)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Yol Haritası

### ✅ v1.0 — Yayın (Şimdi)
- 3 akıllı mod (Buzdolabı / Ek Malzeme / Sınırsız)
- 2500 tarif, 13 dil
- Pişirme modu (sayaç, büyük yazı, sesli okuma)
- Premium (RevenueCat + Stripe)
- Admin panel v1.0

### 🟡 v1.1 — 1-2 Ay
- Realtime updates (Firestore listeners)
- Toplu kullanıcı işlemleri
- Çeviri editörü (yan yana 13 dil)
- iPad optimizasyonu

### 🔵 v1.2 — 3-6 Ay
- Apple Watch & Wear OS companion
- Bağlantılı pişirme cihazları (akıllı fırın API'leri)
- Sesli komut (pişirme modunda)
- B2B Pro (restoranlar için porsiyon hesabı)

---

## 📄 Lisans

Bu proje **özel lisanslıdır** (proprietary). Tüm hakları saklıdır © 2026 Odit Teknoloji ve İletişim Hizmetleri Ticaret A.Ş.

Detay için [`LICENSE`](LICENSE) dosyasına bak.

---

## 🤝 İletişim

- **Şirket:** Odit Teknoloji A.Ş. (Istanbul)
- **E-posta:** founder@pratiktarifler.app
- **Web:** [pratiktarifler.app](https://pratiktarifler.app)

---

<div align="center">

**Made with 🦁🔥 in İstanbul**

[⬆ Yukarı](#-pratik-tarifler)

</div>
