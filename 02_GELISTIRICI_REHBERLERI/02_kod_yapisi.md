# 🗂️ Kod Yapısı — Detaylı Anlatım

> Kodun nerede ne olduğunu, hangi katmanın neden var olduğunu açıklar.

---

## 📁 ÜST DÜZEY YAPI

```
01_Uygulama_Kodu/
├── app/                      ← Expo Router (file-based routing)
├── src/                      ← Tüm mantık ve UI bileşenleri
├── functions/                ← Firebase Cloud Functions
├── data/                     ← Örnek tarif verileri (test için)
├── assets/                   ← icon, splash görselleri
├── store_assets/             ← App Store / Play Store materyalleri
├── e2e/                      ← Detox E2E testleri
├── __tests__/                ← Jest birim testleri
├── scripts/                  ← Otomatik scriptler (seed, build_locales)
├── app.config.ts             ← Expo yapılandırma
├── eas.json                  ← EAS Build/Submit
├── firebase.json             ← Firebase deploy
├── firestore.rules           ← Güvenlik kuralları
├── firestore.indexes.json    ← 13 bileşik indeks
├── package.json
└── tsconfig.json
```

---

## 📱 app/ — EKRAN YAPISI

Expo Router file-based routing kullanır — dosya yolu = URL yolu.

```
app/
├── _layout.tsx               ← Kök layout (provider'lar, theme)
├── (auth)/
│   ├── login.tsx
│   ├── signup.tsx
│   └── _layout.tsx
├── (tabs)/                   ← Bottom tab navigation
│   ├── index.tsx             ← Ana sayfa (3 mod kartı)
│   ├── explore.tsx           ← Mod 3 — Keşfet
│   ├── favorites.tsx
│   ├── profile.tsx
│   └── _layout.tsx           ← Tab bar tanımı
├── recipe/
│   └── [id].tsx              ← Dinamik tarif detay sayfası
├── cooking-mode/
│   └── [recipeId].tsx        ← Pişirme modu
├── premium.tsx
├── shopping-list.tsx
├── settings/
│   ├── language.tsx
│   └── account.tsx
└── onboarding/
    ├── slide1.tsx
    ├── slide2.tsx
    └── slide3.tsx
```

**17 ekran toplam.**

---

## 🧠 src/ — TÜM MANTIK

### src/api/ — Backend iletişimi
```
api/
├── firebase.ts           ← Firebase init, exports (auth, db, storage)
├── recipes.ts            ← getRecipes(), getRecipeById(), search()
├── recommendations.ts    ← getRecommendations() — Cloud Function çağrısı
├── pantry.ts             ← scanFridge(), updatePantry()
├── premium.ts            ← Premium status, RevenueCat sync
├── analytics.ts          ← Custom event tracker
└── translations.ts       ← Recipe translations
```

### src/components/ — Paylaşılan UI
```
components/
├── RecipeCard.tsx        ← Liste/grid'de tarif kartı
├── ModeCard.tsx          ← 3 mod kartından biri
├── IngredientChip.tsx    ← Malzeme etiketi (eklenebilir/çıkarılabilir)
├── StepItem.tsx          ← Pişirme adımı
├── FilterPanel.tsx       ← Mutfak/diyet/süre filtreleri
├── ShoppingItem.tsx
├── PremiumBadge.tsx
├── BlurImage.tsx         ← BlurHash → progressive loading
├── Button.tsx            ← Variants: primary, secondary, ghost
├── Input.tsx
├── Skeleton.tsx          ← Loading states
└── ErrorBoundary.tsx
```

### src/hooks/ — Custom hooks
```
hooks/
├── useAuth.ts            ← Authentication state
├── useRecipes.ts         ← Recipe listing with cache
├── useFavorites.ts
├── usePantry.ts
├── usePremium.ts         ← Subscription status
├── useTimer.ts           ← Pişirme modu sayacı
├── useTranslation.ts     ← i18n wrapper
└── useNetworkStatus.ts
```

### src/locales/ — 13 dil JSON
```
locales/
├── tr.json   (Türkçe — ana dil)
├── en.json
├── de.json   (Almanca)
├── fr.json   (Fransızca)
├── it.json   (İtalyanca)
├── es.json   (İspanyolca)
├── pt.json   (Portekizce)
├── el.json   (Yunanca)
├── nl.json   (Hollandaca)
├── ru.json   (Rusça)
├── sr.json   (Sırpça)
├── ar.json   (Arapça — RTL)
└── he.json   (İbranice — RTL)
```

Yapı:
```json
{
  "common": { "next": "İleri", "back": "Geri", ... },
  "auth": { "login": "Giriş Yap", "signup": "Kayıt Ol", ... },
  "home": { "title": "Ne pişirsem?", ... },
  "mode1": { "title": "Evdeki Kalanlarla", ... }
}
```

### src/notifications/
```
notifications/
├── index.ts              ← FCM init, token registration
├── handlers.ts           ← Deep link handlers
└── topics.ts             ← Topic subscribe/unsubscribe
```

### src/offline/
```
offline/
├── index.ts              ← SQLite init
├── cache.ts              ← Tarif önbelleği (TTL: 7 gün)
├── syncQueue.ts          ← Pending write'lar
└── schema.ts             ← SQLite tablo şemaları
```

### src/styles/
```
styles/
├── theme.ts              ← Renkler, typography, spacing
└── globalStyles.ts
```

### src/types/
```
types/
├── recipe.ts             ← Recipe, Ingredient, Step interfaces
├── user.ts
├── subscription.ts
└── api.ts                ← Cloud Function response types
```

---

## ☁️ functions/ — CLOUD FUNCTIONS

```
functions/
├── src/
│   ├── index.ts                          ← Tüm function export'lar
│   ├── getRecipeRecommendations.ts       ← Öneri algoritması
│   ├── detectIngredients.ts              ← Google Vision API
│   ├── generateEmbedding.ts              ← OpenAI embeddings
│   ├── validateIAP.ts                    ← Apple/Google receipt
│   ├── revenuecatWebhook.ts
│   ├── stripeWebhook.ts
│   ├── appleNotificationsV2.ts
│   ├── playRtdnHandler.ts
│   ├── sendPushNotification.ts
│   ├── cleanupOldScans.ts                ← Schedule'lı (her gün)
│   ├── grantPremiumToUser.ts             ← Admin only
│   └── utils/
│       ├── firestore.ts
│       ├── auth.ts
│       └── validation.ts
├── package.json
└── tsconfig.json
```

**11 fonksiyon toplam.**

### Önemli function detayları

#### getRecipeRecommendations
İki aşamalı algoritma:
1. Firestore'dan **aday havuzu** çek (kullanıcının pantry'sine göre)
2. İstemci tarafı **kesin filtre + skor** — eksik malzeme < threshold

#### detectIngredients
- Google Vision API → label detection
- Pratik Tarifler malzeme sözlüğüne map et
- Confidence < 0.7 olanları filtrele

---

## 📊 data/ — ÖRNEK VERİLER

```
data/
├── recipes/
│   └── tr/
│       ├── lentil-soup-classic.json
│       ├── menemen-classic.json
│       └── pasta-pomodoro.json   ← Geliştirme/test için 3 örnek
├── ingredients/
│   └── tokens.json              ← 237 token sözlüğü
└── glossary/
    └── translations.json        ← AI çeviri için anahtar terimler
```

**Üretim verisi**: 2500 tarif Firestore'da (seed sonrası), buradaki sadece dev test için.

---

## 🎨 store_assets/ — App Store / Play Store

```
store_assets/
├── ios/
│   ├── app_icon_1024.png
│   ├── screenshots_tr/
│   ├── screenshots_en/
│   └── promotional_4096x2304.png
├── android/
│   ├── app_icon_512.png
│   ├── adaptive_icon_foreground.png
│   ├── feature_graphic_1024x500.png
│   ├── screenshots_tr/
│   └── screenshots_en/
├── listing_copy/
│   └── STORE_LISTING_COPY.md
└── SUBMISSION_CHECKLIST.md
```

---

## 🧪 __tests__/ + e2e/ — TESTLER

### __tests__/ — Jest birim testleri
```
__tests__/
├── api/
│   ├── recipes.test.ts
│   └── recommendations.test.ts
├── hooks/
│   └── useAuth.test.tsx
└── components/
    └── RecipeCard.test.tsx
```

Çalıştır: `npm test`

### e2e/ — Detox E2E
```
e2e/
├── login.e2e.ts
├── mode1-fridge-scan.e2e.ts
├── cooking-mode.e2e.ts
└── premium-purchase.e2e.ts
```

Çalıştır: `npm run e2e:ios` veya `npm run e2e:android`

---

## ⚙️ KRİTİK YAPILANDIRMA DOSYALARI

### app.config.ts
- App name, slug, version
- Bundle ID / Package
- Permissions (Camera, Mic)
- Localizations (13 dil)
- Splash screen, icon paths

### eas.json
- 3 profile: development, preview, production
- iOS submit credentials
- Android submit credentials

### firebase.json
- Functions runtime: nodejs20
- Region: europe-west3
- Firestore rules path
- Storage rules path

### firestore.rules
- 50+ satır
- Kullanıcı sadece kendi verisini okur+yazar
- recipes_* herkes okur, kimse yazmaz
- image_jobs sadece admin

### firestore.indexes.json
- 13 bileşik indeks
- En kritik: `cuisine + meal_type + difficulty + total_time_min`

---

## 🔄 NPM SCRIPT'LERİ

```bash
npm run start         # Expo dev server
npm run ios           # iOS Simulator'de aç
npm run android       # Android Emulator'de aç
npm run typecheck     # TypeScript kontrol
npm run lint          # ESLint
npm run format        # Prettier
npm test              # Jest birim testler
npm run test:ci       # CI/CD için Jest (coverage'lı)
npm run seed          # 2500 tarifi Firestore'a yükle
npm run translate     # 12 dile çeviri (OpenAI Batch)
npm run build:ios     # eas build --platform ios
npm run build:android # eas build --platform android
npm run build:all     # Her ikisi
npm run submit:ios    # eas submit --platform ios
npm run submit:android
npm run update        # OTA update (EAS Update)
```

---

## 🎯 İLK GÜNDE NE OKU?

Eğer hiç bilmiyorsan, sırasıyla:
1. `app/_layout.tsx` — uygulama nasıl başlıyor
2. `app/(tabs)/index.tsx` — ana sayfa
3. `src/api/firebase.ts` — backend bağlantısı
4. `src/api/recipes.ts` — veri katmanı
5. `src/components/RecipeCard.tsx` — temel UI bileşeni
6. `functions/src/getRecipeRecommendations.ts` — öneri algoritması

---

*Sonraki: `03_sorun_giderme.md`*
