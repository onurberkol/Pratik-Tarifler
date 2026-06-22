# 🔥 Pratik Tarifler — Firebase Database Architecture (v1.0)

> **Tek elden, tam şema** — Firestore + Storage + Auth + Functions + Security Rules

---

## 📐 GENEL MİMARİ

```
┌─────────────────────────────────────────────────────────────┐
│                    Pratik Tarifler App                        │
│                  (Expo SDK 54 / React Native)                │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────────────┐
        │                │                        │
        ▼                ▼                        ▼
┌──────────────┐  ┌──────────────┐       ┌────────────────┐
│   Firestore  │  │   Storage    │       │     Auth       │
│              │  │              │       │                │
│ • recipes_tr │  │ recipes/     │       │ • Email/Pass   │
│ • recipes_en │  │   tr/full/   │       │ • Google       │
│ • recipes_xx │  │   tr/thumb/  │       │ • Apple        │
│ • users      │  │   tr/blur/   │       │ • Anonymous    │
│ • favorites  │  │   en/full/   │       │                │
│ • ratings    │  │ users/avatars│       │                │
│ • image_jobs │  │              │       │                │
│ • review_q   │  │              │       │                │
│ • app_config │  │              │       │                │
└──────────────┘  └──────────────┘       └────────────────┘
        ▲                ▲                        ▲
        │                │                        │
        └────────────────┴────────────────────────┘
                         │
                         ▼
                ┌──────────────────┐
                │  Cloud Functions │
                │                  │
                │ • imagePipeline  │
                │ • translate      │
                │ • aggregateStats │
                │ • cleanupJobs    │
                └──────────────────┘
```

---

## 🗄️ FIRESTORE KOLEKSİYONLARI

### 1️⃣ `recipes_tr` (Ana koleksiyon — Türkçe)
**Yapı:** `recipes_tr/{recipe_id}`
**Toplam:** 2500 doküman
**Doc ID Format:** `tr-{slug}` (örn: `tr-mercimek-corbasi`)

```typescript
interface Recipe {
  // Tanımlayıcı
  id: string;                    // "tr-mercimek-corbasi"
  schema_version: 2;
  language: "tr";
  
  // İçerik
  title: string;
  description: string;
  
  // Malzemeler
  ingredient_tokens: string[];   // ["lentil", "onion", "tomato"]  — filtreleme için
  primary_ingredients: string[]; // En önemli 1-3 malzeme
  ingredients: Ingredient[];
  
  // Adımlar
  steps: Step[];
  tips: string[];
  
  // Metadata
  total_time_min: number;
  active_time_min: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  cuisine: string;               // "turkish", "italian", "mediterranean"...
  diet_tags: string[];           // ["vegetarian", "vegan", "gluten_free"]
  meal_type: string[];           // ["breakfast", "dinner", "appetizer"]
  is_premium: boolean;
  
  // Sosyal (denormalize edilmiş)
  rating_avg: number;
  rating_count: number;
  favorite_count: number;        // YENİ - hızlı sorgu için denormalize
  view_count: number;            // YENİ - analitik
  
  // Görsel
  image: {
    url_full: string | null;
    url_thumb: string | null;
    blur_hash: string | null;
    width: number | null;
    height: number | null;
    source: "unsplash" | "pexels" | "pixabay" | "dalle" | "flux" | "manual" | null;
    source_id: string | null;
    photographer: string | null;
    photographer_url: string | null;
    license: string | null;
    status: "pending" | "searching" | "generating" | "review" | "ready" | "failed";
    created_at: Timestamp | null;
  };
  image_status: "pending" | "ready" | "failed";  // index'li hızlı sorgu için duplike
  
  // Zaman damgaları
  created_at: Timestamp;
  updated_at: Timestamp;
  published_at: Timestamp | null;  // image_status=ready olunca set edilir
  
  // SEO / Arama (denormalize)
  search_keywords: string[];     // ["mercimek", "çorba", "vegan", "kış"]
}

interface Ingredient {
  token: string;     // "lentil"
  amount: string;    // "1 su bardağı"
  note: string;      // "kırmızı mercimek"
}

interface Step {
  order: number;
  title: string;
  body: string;
  timer_sec: number | null;
}
```

**Indexler (zorunlu):**
```
recipes_tr → image_status ASC, published_at DESC      // listeleme
recipes_tr → cuisine ASC, image_status ASC            // mutfak bazlı
recipes_tr → meal_type ARRAY, image_status ASC        // yemek türü
recipes_tr → diet_tags ARRAY, image_status ASC        // diyet filtre
recipes_tr → difficulty ASC, total_time_min ASC       // kolay+hızlı
recipes_tr → ingredient_tokens ARRAY, image_status    // Mod 1 için kritik!
recipes_tr → is_premium ASC, rating_avg DESC          // popüler premium
recipes_tr → favorite_count DESC                       // trend
recipes_tr → search_keywords ARRAY                     // metin arama
```

---

### 2️⃣ `recipes_{xx}` (Diğer 12 dil)
Aynı şema, dil bazlı ayrı koleksiyon:
- `recipes_en`, `recipes_de`, `recipes_fr`, `recipes_it`, `recipes_es`
- `recipes_pt`, `recipes_el`, `recipes_nl`, `recipes_ru`, `recipes_sr`
- `recipes_ar`, `recipes_he`

**Neden ayrı koleksiyonlar?**
- Hızlı sorgu (where language="tr" filtresine gerek yok)
- Çeviri Faz 4'te paralelize edilebilir
- Görseller aynı (Storage paylaşılır), sadece metin farklı

> Görsel tek kez Storage'a yüklenir, tüm diller aynı `url_full` ve `url_thumb`'u kullanır. Çeviri Faz 4'te sadece metni Firestore'a kopyalar.

---

### 3️⃣ `users` (Kullanıcı profilleri)
**Yapı:** `users/{user_id}`  (user_id = Firebase Auth UID)

```typescript
interface User {
  uid: string;
  email: string | null;          // Anonymous için null
  display_name: string;
  photo_url: string | null;
  
  // Tercihler
  language: "tr" | "en" | ...;
  preferences: {
    dietary: string[];           // ["vegetarian", "halal", "no_pork"]
    allergies: string[];         // ["nuts", "dairy", "gluten"]
    favorite_cuisines: string[];
    cooking_skill: "beginner" | "intermediate" | "advanced";
    serving_default: number;     // default kişi sayısı
  };
  
  // Abonelik
  subscription: {
    tier: "free" | "premium" | "pro";
    status: "active" | "expired" | "cancelled";
    started_at: Timestamp | null;
    expires_at: Timestamp | null;
    provider: "ios" | "android" | "stripe" | null;
  };
  
  // Analitik
  stats: {
    recipes_viewed: number;
    recipes_cooked: number;
    favorites_count: number;
    streak_days: number;
  };
  
  // Sistem
  created_at: Timestamp;
  last_active_at: Timestamp;
  app_version: string;
  platform: "ios" | "android" | "web";
}
```

---

### 4️⃣ `users/{uid}/favorites` (Subcollection)
**Yapı:** `users/{uid}/favorites/{recipe_id}`

```typescript
interface Favorite {
  recipe_id: string;
  recipe_title: string;          // denormalize — hızlı liste
  recipe_thumb: string;          // denormalize
  added_at: Timestamp;
  notes: string;                 // kullanıcı notu
  cooked_count: number;          // kaç kez pişirdi
  last_cooked_at: Timestamp | null;
}
```

> Subcollection olmasının nedeni: kullanıcılar binlerce favoriye sahip olabilir, doc field'a sığmaz.

---

### 5️⃣ `users/{uid}/pantry` (Subcollection — Mod 1 için)
**Yapı:** `users/{uid}/pantry/{ingredient_token}`

```typescript
interface PantryItem {
  token: string;                 // "egg", "tomato"
  display_name: string;          // "Yumurta", "Domates" (i18n)
  quantity: string;              // "3 adet" veya null
  expires_at: Timestamp | null;
  source: "manual" | "photo_scan" | "shopping_list";
  added_at: Timestamp;
}
```

> Mod 1 (Evdeki Kalan Malzemeler) için kullanıcı buzdolabını sürekli güncel tutar.

---

### 6️⃣ `ratings` (Tarif puanları — koleksiyon)
**Yapı:** `ratings/{recipe_id}_{user_id}`

```typescript
interface Rating {
  recipe_id: string;
  user_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  review: string | null;
  difficulty_actual: "easy" | "medium" | "hard" | null;  // gerçek deneyim
  would_make_again: boolean;
  created_at: Timestamp;
}
```

> Cloud Function `aggregateStats` her gece çalışır, `recipes_xx/{id}.rating_avg/count` günceller.

---

### 7️⃣ `image_jobs` (Faz 3 görsel pipeline)
**Yapı:** `image_jobs/{job_id}`  (`job_id = img_job_{recipe_id}`)

```typescript
interface ImageJob {
  job_id: string;
  recipe_id: string;
  recipe_title: string;
  cuisine: string;
  
  status: "pending" | "searching" | "generating" | "review" | "ready" | "failed";
  priority: 1 | 2 | 3;           // 1=premium, 2=normal, 3=düşük
  
  attempts: ImageAttempt[];      // her kaynak denemesi
  current_image_url: string | null;
  current_source: string | null;
  
  search_terms: {
    primary_keywords: string;
    cuisine_keyword: string;
    fallback_query: string;
  };
  ai_prompt: string;
  
  cost_usd: number;              // bu iş için harcanan
  requires_review: boolean;
  admin_notes: string | null;
  
  created_at: Timestamp;
  updated_at: Timestamp;
  completed_at: Timestamp | null;
}

interface ImageAttempt {
  source: "unsplash" | "pexels" | "pixabay" | "dalle" | "flux";
  query: string;
  result: "found" | "no_match" | "low_quality" | "generated" | "error";
  score: number | null;          // 0-1
  url: string | null;
  cost_usd: number;
  at: Timestamp;
  error: string | null;
}
```

**Indexler:**
```
image_jobs → status ASC, priority ASC, created_at ASC   // pipeline kuyruğu
image_jobs → requires_review ASC, updated_at DESC       // admin kuyruğu
```

---

### 8️⃣ `image_review_queue` (Admin onayı)
**Yapı:** `image_review_queue/{recipe_id}`

```typescript
interface ReviewItem {
  recipe_id: string;
  recipe_title: string;
  current_image_url: string;
  source: string;
  ai_prompt: string | null;
  
  reviewer_id: string | null;     // hangi admin
  decision: "approved" | "rejected" | "needs_regeneration" | null;
  rejection_reason: string | null;
  
  created_at: Timestamp;
  reviewed_at: Timestamp | null;
}
```

---

### 9️⃣ `app_config` (Uygulama yapılandırması)
**Yapı:** `app_config/global` (tek doküman)

```typescript
interface AppConfig {
  min_app_version: { ios: string; android: string };
  force_update: boolean;
  maintenance_mode: boolean;
  
  features: {
    mod_1_camera_scan: boolean;      // Mod 1 fotoğraf tanıma açık mı
    mod_1_manual_list: boolean;
    mod_2_supply_mode: boolean;
    mod_3_unlimited: boolean;
    ai_recipe_suggestions: boolean;
  };
  
  limits: {
    free_daily_recipes: 10;
    free_favorites: 20;
    premium_daily_recipes: -1;    // unlimited
  };
  
  ai: {
    image_recognition_provider: "google_vision" | "openai_vision";
    recipe_suggestion_model: "gpt-4" | "claude-3";
  };
  
  updated_at: Timestamp;
}
```

---

### 🔟 `analytics_events` (Opsiyonel — kendi event sistemi)
Firebase Analytics yetmezse:

```typescript
interface Event {
  event_name: string;
  user_id: string;
  recipe_id?: string;
  parameters: object;
  timestamp: Timestamp;
}
```

---

## 📦 STORAGE YAPISI

```
gs://pratik-tarifler-{env}/
├── recipes/
│   ├── tr/full/{recipe_id}.webp         # 1200x900, ~150 KB
│   ├── tr/thumb/{recipe_id}.webp        # 400x300, ~30 KB
│   └── tr/blur/{recipe_id}.txt          # BlurHash (alternatif olarak Firestore'da)
│   
│   Not: en/de/fr/... için aynı dosyalar paylaşılır
│         (görseller dil bağımsız)
│
├── users/
│   └── avatars/{uid}.webp               # 200x200
│
└── temp/
    └── pantry_scans/{uid}/{timestamp}.jpg   # Mod 1 fotoğraf — 24 saat sonra silinir
```

**Storage Cache Control:**
- `recipes/`: `Cache-Control: public, max-age=2592000, immutable` (30 gün)
- `users/avatars/`: `Cache-Control: public, max-age=86400` (1 gün)
- `temp/`: `Cache-Control: no-cache`

---

## 🔐 SECURITY RULES

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========== Helpers ==========
    function isSignedIn() {
      return request.auth != null;
    }
    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }
    function isPremium() {
      return isSignedIn() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.subscription.tier in ['premium', 'pro'];
    }
    function isAdmin() {
      return isSignedIn() && 
        request.auth.token.admin == true;  // Custom claim
    }
    
    // ========== Recipes (readonly herkese, write sadece admin) ==========
    match /recipes_{lang}/{recipeId} {
      allow read: if resource.data.image_status == 'ready' &&
                     (!resource.data.is_premium || isPremium());
      allow write: if isAdmin();
    }
    
    // ========== Users (kendi profilini yöneten) ==========
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && 
                       request.resource.data.uid == userId;
      allow update: if isOwner(userId) &&
                       request.resource.data.uid == userId &&
                       // Subscription/admin alanlarını client değiştiremez
                       request.resource.data.subscription == resource.data.subscription;
      allow delete: if isOwner(userId);
      
      // Favorites
      match /favorites/{recipeId} {
        allow read, write: if isOwner(userId);
      }
      
      // Pantry
      match /pantry/{itemId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    // ========== Ratings ==========
    match /ratings/{ratingId} {
      allow read: if true;
      allow create: if isSignedIn() &&
                       request.resource.data.user_id == request.auth.uid;
      allow update, delete: if isSignedIn() &&
                               resource.data.user_id == request.auth.uid;
    }
    
    // ========== App Config (read-only public) ==========
    match /app_config/{configId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ========== Admin koleksiyonları ==========
    match /image_jobs/{jobId} {
      allow read, write: if isAdmin();
    }
    match /image_review_queue/{recipeId} {
      allow read, write: if isAdmin();
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Recipe images: herkes okur, sadece admin yazar
    match /recipes/{lang}/{type}/{filename} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.token.admin == true;
    }
    
    // User avatars: kendi avatarını yazabilir
    match /users/avatars/{uid}.{ext} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.uid == uid &&
                      request.resource.size < 2 * 1024 * 1024 &&  // 2MB max
                      request.resource.contentType.matches('image/.*');
    }
    
    // Pantry scan: kendi tarayabilir, 24 saat sonra Cloud Function siler
    match /temp/pantry_scans/{uid}/{filename} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == uid &&
                            request.resource.size < 5 * 1024 * 1024;  // 5MB max
    }
  }
}
```

---

## ⚡ CLOUD FUNCTIONS

### 1. `imagePipelineWorker` (Scheduled — saatte 1)
```typescript
exports.imagePipelineWorker = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .pubsub.schedule('every 60 minutes')
  .onRun(async () => {
    // Pending image_jobs'ları al (50 tanesi)
    const jobs = await admin.firestore()
      .collection('image_jobs')
      .where('status', '==', 'pending')
      .orderBy('priority', 'asc')
      .orderBy('created_at', 'asc')
      .limit(50)
      .get();
    
    for (const doc of jobs.docs) {
      await processImageJob(doc);
    }
  });
```

### 2. `aggregateRatings` (Trigger — yeni rating eklenince)
```typescript
exports.aggregateRatings = functions
  .firestore.document('ratings/{ratingId}')
  .onWrite(async (change, context) => {
    const recipeId = change.after.data().recipe_id;
    const lang = recipeId.split('-')[0];  // "tr-..." → "tr"
    
    // Tüm rating'leri yeniden agrege et
    const ratings = await admin.firestore()
      .collection('ratings')
      .where('recipe_id', '==', recipeId)
      .get();
    
    const sum = ratings.docs.reduce((s, d) => s + d.data().rating, 0);
    const avg = ratings.size ? sum / ratings.size : 0;
    
    await admin.firestore()
      .collection(`recipes_${lang}`)
      .doc(recipeId)
      .update({
        rating_avg: Math.round(avg * 10) / 10,
        rating_count: ratings.size
      });
  });
```

### 3. `cleanupPantryScans` (Scheduled — günde 1)
```typescript
exports.cleanupPantryScans = functions
  .pubsub.schedule('every 24 hours')
  .onRun(async () => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({ prefix: 'temp/pantry_scans/' });
    
    for (const file of files) {
      const [metadata] = await file.getMetadata();
      if (new Date(metadata.timeCreated).getTime() < cutoff) {
        await file.delete();
      }
    }
  });
```

### 4. `analyzePantryPhoto` (Callable — Mod 1 için)
```typescript
exports.analyzePantryPhoto = functions
  .runWith({ memory: '512MB' })
  .https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated');
    
    const { photo_path } = data;  // Storage path
    
    // Google Vision API'ye gönder
    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.objectLocalization(`gs://${BUCKET}/${photo_path}`);
    
    // Nesneleri ingredient_token'lara map et
    const detected = result.localizedObjectAnnotations
      .map(obj => mapToIngredientToken(obj.name))
      .filter(Boolean);
    
    return { detected_ingredients: [...new Set(detected)] };
  });
```

### 5. `getRecipeRecommendations` (Callable — Mod 1/2 için)
```typescript
exports.getRecipeRecommendations = functions
  .https.onCall(async (data, context) => {
    const { mode, ingredients, lang = 'tr', filters = {} } = data;
    
    if (mode === 'pantry') {
      // Mod 1: Sadece elde olan malzemelerle yapılabilen tarifler
      return await findRecipesWithOnlyIngredients(ingredients, lang);
    } else if (mode === 'supply') {
      // Mod 2: 1-2 ek malzemeli tarifler
      return await findRecipesWithExtraIngredients(ingredients, lang, max_extra: 2);
    } else {
      // Mod 3: Genel arama (filters)
      return await searchRecipes(filters, lang);
    }
  });
```

---

## 💰 MALİYET TAHMİNİ (Aylık, 10K Kullanıcı)

| Servis | Kullanım | Maliyet |
|--------|----------|---------|
| **Firestore reads** | 10K × 30 recipe × 30 gün = 9M reads | $5.40 |
| **Firestore writes** | 10K × 5 yazma × 30 gün = 1.5M writes | $2.70 |
| **Storage** | 400 MB (görseller) | $0.10 |
| **Storage egress** | 10K × 50 image × 50KB × 30 = 75 GB | $9.00 |
| **Cloud Functions** | 100K invocation | $0.40 |
| **Vision API** | 10K scan × 30 gün = 300K | $0 (1K free), $450 (paid) ❗ |
| **Auth** | Sınırsız (Spark free) | $0 |
| **TOPLAM (Vision'sız)** | | **~$18/ay** |
| **TOPLAM (Vision'lı)** | | **~$470/ay** ⚠️ |

> ⚠️ Vision API pahalı! Alternatif: **OpenAI Vision GPT-4o** ($2.50/1M token, ~$0.005/image) → 300K image = $1500/ay daha da pahalı. Çözüm: **Cache'leme + kullanıcı başı limit**.
>
> En iyi strateji: **Mod 1'i ücretsiz kullanıcılara günde 3 scan ile sınırla**, premium'lara sınırsız.

---

## 📋 INITIAL SEED DATA

İlk Firebase kurulumunda yüklenecek:
1. **2500 tarif** → `recipes_tr` (recipes_db_firestore_tr.json'dan batch upload)
2. **app_config/global** → varsayılan config
3. **Admin user** → custom claim `admin: true`
4. **image_jobs** → 2500 pending job (image_jobs.json'dan)

---

## 🚀 NEXT STEPS

1. ✅ **Bu dokümana göre** Firebase projesini ayağa kaldır
2. ⏭️ Görsel pipeline'ı çalıştır (Faz 3.2)
3. ⏭️ Çeviri pipeline'ı (Faz 3.3)
4. ⏭️ App'te 3 modlu UX (Faz 4)
