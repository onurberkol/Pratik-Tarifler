# 🏗️ Sistem Mimarisi

> Tüm parçaların nasıl birbirine bağlandığını gösteren teknik diyagram.

---

## 🌐 GENEL MİMARİ

```
┌────────────────────────────────────────────────────────────────┐
│                         İSTEMCİ (Mobile)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Native + Expo SDK 54 (iOS + Android)              │  │
│  │  • Expo Router (file-based)                              │  │
│  │  • React Context + Custom Hooks                          │  │
│  │  • FlashList (sanallaştırma)                             │  │
│  │  • i18next (13 dil)                                      │  │
│  │  • expo-sqlite (çevrimdışı önbellek)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────────┘
                             │ HTTPS / Firebase SDK
                             ↓
┌────────────────────────────────────────────────────────────────┐
│                     FIREBASE BACKEND                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │     AUTH     │  │  FIRESTORE   │  │   CLOUD STORAGE      │ │
│  │ Email/Google/│  │ Tarifler +   │  │ Tarif görselleri +   │ │
│  │ Apple/Anon   │  │ Kullanıcılar │  │ Buzdolabı taramaları │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           CLOUD FUNCTIONS (11 fonksiyon)               │    │
│  │  • getRecipeRecommendations (öneri algoritması)        │    │
│  │  • detectIngredients (Vision API çağırır)              │    │
│  │  • generateEmbedding (OpenAI)                          │    │
│  │  • validateIAP (Apple Shared Secret)                   │    │
│  │  • revenuecatWebhook                                   │    │
│  │  • stripeWebhook                                       │    │
│  │  • appleNotificationsV2 (App Store Server Notif)       │    │
│  │  • playRtdnHandler (Play Real-Time Dev Notif)          │    │
│  │  • sendPushNotification                                │    │
│  │  • cleanupOldScans (scheduled, günlük)                 │    │
│  │  • grantPremiumToUser (admin only)                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  ANALYTICS   │  │ CRASHLYTICS  │  │  REMOTE CONFIG       │ │
│  │ User events  │  │ Crash reports│  │  Feature flags + A/B │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└────────────────────────────┬───────────────────────────────────┘
                             │ REST / Webhook
                             ↓
┌────────────────────────────────────────────────────────────────┐
│                    3. PARTİ SERVİSLER                           │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ GOOGLE     │  │  OPENAI    │  │ REVENUECAT │  │  SENTRY  │ │
│  │ Vision API │  │ embeddings │  │ Subscript. │  │ Errors   │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐   │
│  │  UNSPLASH  │  │  DALL·E 3  │  │  APPLE / GOOGLE        │   │
│  │   PEXELS   │  │ AI üretim  │  │  IAP & PUSH            │   │
│  │  PIXABAY   │  │ (görsel)   │  │                        │   │
│  └────────────┘  └────────────┘  └────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 KRİTİK VERİ AKIŞLARI

### 1. Buzdolabı Tarama Akışı
```
[Kullanıcı]
   ↓ Foto çek
[İstemci] → Cloud Storage (geçici, /users/{uid}/pantry_scans/)
   ↓ HTTPS POST {imageUrl}
[Cloud Function: detectIngredients]
   ↓ Google Vision API
   ← Recognized ingredients
[Cloud Function] → Firestore'da ingredient tokens
   ↓ Match query
[Firestore: recipes_tr]
   ← Matching recipes
[İstemci] → Liste göster
```

### 2. Premium Satın Alma Akışı
```
[Kullanıcı] tıkla "Premium"
[İstemci: RevenueCat SDK] → Apple/Google IAP
[Apple/Google] ← Satın alma onayı
[Apple/Google] → RevenueCat webhook
[RevenueCat] → Cloud Function: revenuecatWebhook
[Cloud Function] → Firestore (users/{uid}.subscription = premium)
[İstemci] ← Firestore listener → UI güncellenir
```

### 3. Çevrimdışı Akış
```
[İstemci] → SQLite cache (favoriler + son görülen tarifler)
   ↓ Network yok
[İstemci] → SQLite'tan oku, UI'yi besle
   ↓ Network gelir
[İstemci] → Sync queue → Firestore'a yazma
```

---

## 🗂️ FIRESTORE ŞEMA

### recipes_tr (2500 doküman)
```typescript
{
  id: string,
  title: string,
  description: string,
  primary_ingredients: string[],  // index'li, sorgu için
  ingredient_tokens: string[],
  cuisine: string,
  meal_type: string[],
  diet_tags: string[],
  difficulty: "easy" | "medium" | "hard",
  total_time_min: number,
  active_time_min: number,
  servings: number,
  ingredients: Ingredient[],
  steps: Step[],
  tips: string[],
  rating_avg: number,
  is_premium: boolean,
  image: {
    url_full: string,
    url_thumb: string,
    blur_hash: string,
    source: string,
    photographer: string,
  },
  embedding: number[],  // 1536 dimension OpenAI
}
```

### users
```typescript
{
  id: string,  // Firebase UID
  email: string,
  display_name: string,
  language: string,  // "tr", "en", ...
  created_at: Timestamp,
  subscription: {
    status: "free" | "trial" | "active" | "cancelled" | "expired",
    plan: "monthly" | "yearly" | null,
    expires_at: Timestamp,
    revenuecat_subscriber_id: string,
  },
  favorites: string[],   // recipe IDs
  pantry: string[],      // ingredient tokens
  scan_count_today: number,
  shopping_list: ShoppingItem[],
}
```

### image_jobs (görsel pipeline için)
```typescript
{
  id: string,
  recipe_id: string,
  status: "pending" | "searching" | "generating" | "ready" | "failed",
  attempts: Attempt[],
  current_image_url: string | null,
  created_at: Timestamp,
}
```

---

## 🔐 GÜVENLİK MİMARİSİ

### Prensipler
1. **İstemci asla doğrudan yazmaz** → tüm yazma Cloud Functions üzerinden
2. **İstemci sadece kendi verisini okur** → Firestore rules ile zorla
3. **API anahtarları istemcide yok** → secrets Cloud Functions'ta
4. **Tüm trafik HTTPS** → no exception

### Firestore Rules (özet)
```javascript
// users/{userId}: sadece kendisi okur+yazar
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// recipes_*: herkes okur, kimse yazmaz (sadece admin SDK)
match /recipes_{lang} {
  allow read: if true;
  allow write: if false;
}

// image_jobs: sadece Cloud Functions
match /image_jobs/{jobId} {
  allow read, write: if false;
}
```

---

## ⚡ PERFORMANS OPTİMİZASYONLARI

### Frontend
- **FlashList** ile liste sanallaştırma (10.000 tarifte bile akıcı)
- **Image caching**: BlurHash → thumb → full progressive
- **Lazy loading**: tarif detayı ekranı açılınca embedding hesapla
- **Memoization**: useMemo + React.memo yoğun render'larda

### Backend
- **Firestore composite indexes**: 13 adet, sık sorgular için
- **Cloud Functions cold start**: min instances = 1 (prod)
- **CDN caching**: Firebase Storage globally cached
- **Embeddings precomputed**: tarif yazıldığında embedding hesapla, sorgu hızlı

---

## 🌍 ÇOK DİL MİMARİSİ

```
İstemci → device locale tespit → src/locales/{lang}.json yükle
           ↓
        Tarif sorgusu → recipes_{lang} koleksiyonu
           ↓
        Görseller → dil bağımsız, ortak storage
```

Diller: TR, EN, DE, FR, IT, ES, PT, EL, NL, RU, SR, AR (RTL), HE (RTL)

---

*Detay için: `../02_GELISTIRICI_REHBERLERI/02_kod_yapisi.md`*
