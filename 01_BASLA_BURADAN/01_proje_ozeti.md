# 📖 Pratik Tarifler — Proje Özeti

> İlk gün okunması gereken doküman. Projenin **ne** olduğunu, **neden** yapıldığını ve **nasıl** çalıştığını yüksek seviyede anlatır.

---

## 🎯 ÜRÜN NE?

**Pratik Tarifler**, AI destekli bir mutfak asistanı mobil uygulamasıdır. Kullanıcı, **buzdolabındaki malzemelerin fotoğrafını çeker**, yapay zeka bu malzemeleri tanır ve sadece **yapılabilecek tarifleri** önerir.

### Çözdüğü Sorun
- "Akşam ne pişirsem?" karar yorgunluğu
- Gıda israfı (kullanılmayan malzemeler)
- Gereksiz market alışverişi
- Tarif sitelerinde malzeme bazlı arama zayıflığı

### Ayırt Edici Özellik — 3 Akıllı Mod
1. **Mod 1 — Evdeki Kalanlarla**: AI buzdolabı taraması → sadece tamamı elde olan tarifler
2. **Mod 2 — 1-2 Ek Malzemeyle**: birkaç eksiğe izin verir + akıllı alışveriş listesi
3. **Mod 3 — Sınırsız Keşfet**: 2500 tariflik havuzda filtre tabanlı arama

Pazarda hiçbir rakip 3 modlu yaklaşımı sunmaz — bu projenin **moat'ı**.

---

## 📊 ÜRÜN İSTATİSTİKLERİ

| Metrik | Değer |
|--------|-------|
| Tarif sayısı | 2.500 (50 tematik batch) |
| Dünya mutfağı | 14 (Türk 1077, İtalyan 259, Akdeniz 233, vd.) |
| Desteklenen dil | 13 (TR, EN, DE, FR, IT, ES, PT, EL, NL, RU, SR, AR, HE) |
| RTL dil desteği | Arapça, İbranice |
| Uygulama ekranı | 17 |
| Cloud Function | 11 |
| Kod satırı (TypeScript) | ~12.200 |

---

## 🏗️ TEKNİK MİMARİ

### Katmanlar
```
[İSTEMCİ]  React Native + Expo SDK 54 (iOS + Android)
    ↓ HTTPS / Firebase SDK
[API]      Firebase Cloud Functions (Node.js / TypeScript)
    ↓ Admin SDK
[VERİ]     Firestore + Cloud Storage + Authentication
    ↓ REST
[HARİCİ]   Google Vision · OpenAI · RevenueCat · Stripe · Unsplash/Pexels
```

### Anahtar Tasarım Kararları
- **İstemci yalnız okur, asla yazmaz** — tüm yazma Cloud Functions üzerinden geçer (güvenlik)
- **Dil başına ayrı koleksiyon** (`recipes_tr`, `recipes_en`, ...) — sorgu performansı
- **Görseller dilden bağımsız** — tüm diller aynı görsel URL'sini paylaşır
- **İki aşamalı öneri algoritması** — Firestore aday havuzu + istemci tarafı kesin filtre

---

## 💰 İŞ MODELİ — FREEMIUM

### Ücretsiz Tier
- Günde 3 buzdolabı taraması
- 20 favori tarif limiti
- Tüm 3 mod erişimi
- 1998 ücretsiz tarif

### Premium Tier
- **Aylık**: 49 ₺
- **Yıllık**: 399 ₺ (~%32 indirim, ayda ~33 ₺)
- Sınırsız tarama + favori
- 500+ premium özel tarif
- Alışveriş listesi dışa aktarma
- Reklamsız deneyim
- **7 gün ücretsiz deneme**

### Gelir Projeksiyonu
- İlk 30 gün hedefi: 10.000 indirme, %5 ücretliye dönüşüm = 250 premium abone
- LTV/CAC hedefi: 8x

---

## 🛠️ TEKNOLOJİ YIĞINI

| Katman | Teknoloji |
|--------|-----------|
| Mobil framework | React Native 0.74 + Expo SDK 54 |
| Dil | TypeScript (strict mode) |
| Navigasyon | React Navigation (Stack + Tab + Modal) |
| State | React Context + custom hooks |
| Liste performansı | FlashList (sanallaştırma) |
| Backend | Firebase (Firestore + Functions v2 + Storage) |
| Görsel tanıma | Google Cloud Vision API |
| Embedding (benzer tarif) | OpenAI text-embedding-3-small |
| Abonelik (mobil) | RevenueCat |
| Abonelik (web) | Stripe Checkout |
| Crash reporting | Sentry |
| Analytics | Firebase Analytics |
| Çevrimdışı | expo-sqlite |
| Görsel optimizasyon | WebP + BlurHash |
| CI/CD | EAS Build + EAS Submit |
| Test | Jest (birim) + Detox (E2E) |

---

## 📂 KOD YAPISI HIZLI TUR

```
01_Uygulama_Kodu/
├── app/                  # Expo Router ekran yapısı
│   ├── (tabs)/          # Tab navigasyonu (ana sayfa, keşfet, favoriler, profil)
│   ├── recipe/[id].tsx  # Tarif detay sayfası
│   └── _layout.tsx      # Kök layout
├── src/
│   ├── api/             # Firebase client, Cloud Functions çağrıları
│   ├── components/      # Paylaşılan UI bileşenleri
│   ├── hooks/           # Custom hook'lar (useRecipes, useAuth, vb.)
│   ├── locales/         # 13 dil için JSON (tr, en, de, ...)
│   ├── notifications/   # Push bildirim mantığı
│   ├── offline/         # SQLite önbellek + senkron kuyruğu
│   ├── styles/          # theme.ts — tasarım sistemi
│   └── types/           # TypeScript tip tanımları
├── functions/           # Firebase Cloud Functions (11 fonksiyon)
├── data/                # Örnek tarif verileri (test için)
├── store_assets/        # App Store / Play Store materyalleri
├── assets/              # Uygulama içi varlıklar (icon, splash)
├── app.config.ts        # Expo yapılandırma
├── eas.json             # EAS Build/Submit yapılandırma
├── firebase.json        # Firebase deploy yapılandırma
├── firestore.rules      # Firestore güvenlik kuralları
├── firestore.indexes.json  # 13 bileşik indeks
└── package.json         # Bağımlılıklar ve scriptler
```

---

## 🎨 TASARIM DİLİ

### Renk Paleti
- **Ana renk (Tomato)**: `#E14328` — CTA butonları, vurgu
- **Bal (Honey)**: `#F4A024` — premium, ikincil vurgu
- **Fesleğen (Basil)**: `#3E8E5A` — başarı, "tamam" durumları
- **Mürekkep (Ink)**: `#22180F` — ana metin rengi
- **Krem (Cream)**: `#FFF3E0` — yumuşak arka plan
- **Zemin (BG)**: `#FFFBF5` — uygulama arka planı

### Tipografi
- **Plus Jakarta Sans** — UI metni (400/500/600/700/800)
- **Fraunces** — başlıklar, vurgu (serif)
- **JetBrains Mono** — kod blokları (dokümanlar için)

### İkonografi
- Lucide Icons paketi
- 24×24 px standart boyut

---

## 📅 PROJE GELİŞTİRME GEÇMİŞİ

Proje 6 faz halinde geliştirilmiştir:

| Faz | Kapsam | Durum |
|-----|--------|-------|
| Faz 1 | İçerik şeması ve veri modeli | ✅ Tamamlandı |
| Faz 2 | 2500 TR tarif veritabanı (50 batch) | ✅ Tamamlandı |
| Faz 3.1 | Firebase backend (şema, kurallar, indeksler) | ✅ Tamamlandı |
| Faz 3.2 | Görsel üretim pipeline'ı (hibrit kaynak) | ✅ Scriptler hazır |
| Faz 3.3 | Çeviri pipeline'ı (12 dile) | ✅ Scriptler hazır |
| Faz 4 | 3 modlu mobil uygulama (React Native) | ✅ Tamamlandı |
| Faz 5 | Abonelik sistemi (RevenueCat + Stripe) | ✅ Tamamlandı |
| Faz 6 | Lansman ve pazarlama hazırlığı | ✅ Tamamlandı |

---

## ➡️ SONRAKİ ADIM

Bu dokümanı bitirdiysen, sırasıyla:

1. **`02_mimari_diyagram.md`** — sistem mimarisinin görsel diyagramı
2. **`03_faz_plani.md`** — 6 haftalık çalışma planı
3. **`../02_GELISTIRICI_REHBERLERI/01_yerel_kurulum.md`** — yerel kurulum

---

*Sorularınız için: destek@pratiktarifler.app*
