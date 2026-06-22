# ☁️ Cloud Functions — Deployment & Test Rehberi

> 3 modlu UX'in arka plan motoru. Tüm önemli logic burada.

---

## 📋 FUNCTIONS LİSTESİ

| Function | Tip | Açıklama |
|----------|-----|----------|
| `getRecipeRecommendations` | callable | **3 modun ana mantığı** (Mod 1/2/3 dispatcher) |
| `analyzePantryPhoto` | callable | Google Vision ile fotoğraftan malzeme tanıma |
| `incrementViewCount` | callable | Rate-limited tarif görüntüleme sayacı |
| `submitRating` | callable | Tarif puanı (1-5) |
| `getRecipeOfTheDay` | callable | Günlük tarif (cached) |
| `onRatingChange` | trigger | Rating eklendiğinde rating_avg/count yeniden hesapla |
| `onFavoriteChange` | trigger | Favori eklendiğinde counter güncelle |
| `cleanupPantryScans` | scheduled | 24h+ eski geçici fotoğrafları sil |

---

## 🚀 KURULUM

### 1. Firebase Functions Init
```bash
cd functions/
npm init -y
npm install firebase-admin firebase-functions
npm install --save-dev typescript @types/node

# Google Vision API
npm install @google-cloud/vision

# TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2020",
    "esModuleInterop": true,
    "outDir": "lib",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
EOF
```

### 2. Cloud Function Dosyaları Kopyala
```bash
# Bu pakettekiler:
cp cloud_functions/getRecipeRecommendations.ts functions/src/
cp cloud_functions/analyzePantryPhoto.ts functions/src/
cp cloud_functions/otherFunctions.ts functions/src/

# functions/src/index.ts'de export et:
cat > functions/src/index.ts << 'EOF'
export { getRecipeRecommendations } from './getRecipeRecommendations';
export { analyzePantryPhoto } from './analyzePantryPhoto';
export { 
  onRatingChange,
  onFavoriteChange,
  incrementViewCount,
  cleanupPantryScans,
  getRecipeOfTheDay,
  submitRating,
} from './otherFunctions';
EOF
```

### 3. Google Vision API Aktivasyon
```bash
# Google Cloud Console:
# https://console.cloud.google.com/apis/library/vision.googleapis.com
# 1. Proje seç (Firebase projen)
# 2. "Enable" tıkla
# 3. Functions otomatik olarak default service account ile çağırır

# Maliyet: İlk 1000 görsel/ay BEDAVA, sonra $1.50 / 1000 görsel
```

### 4. Build & Deploy
```bash
# Compile
cd functions && npm run build

# Deploy tüm functions
firebase deploy --only functions

# Sadece spesifik function
firebase deploy --only functions:getRecipeRecommendations
firebase deploy --only functions:analyzePantryPhoto
```

---

## 🧪 TEST

### A) Emulator ile lokal test
```bash
# Tüm Firebase emulator'ları başlat
firebase emulators:start

# Functions http endpoint: http://localhost:5001/{project}/us-central1/{function}
```

### B) Production test (curl)
```bash
# Auth token al (login sonrası React Native'den)
# Sonra:

curl -X POST \
  "https://us-central1-{PROJECT}.cloudfunctions.net/getRecipeRecommendations" \
  -H "Authorization: Bearer ${ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "mode": "pantry",
      "lang": "tr",
      "ingredients": ["egg", "tomato", "onion", "pepper", "cheese"],
      "limit": 10
    }
  }'
```

### C) Test scenarios

**Mod 1 (Pantry) — sadece elde olanlarla:**
```json
{
  "mode": "pantry",
  "ingredients": ["egg", "tomato", "onion", "pepper", "cheese", "olive_oil"],
  "limit": 20
}
```
Beklenen: `match_percentage: 100` olan tarifler (menemen, omlet, vb.)

**Mod 2 (Supply) — max 2 eksik:**
```json
{
  "mode": "supply",
  "ingredients": ["egg", "tomato", "onion"],
  "max_missing": 2,
  "limit": 20
}
```
Beklenen: Her tarif'te `missing_ingredients` array dolu (max 2 element)

**Mod 3 (Discover) — filtre:**
```json
{
  "mode": "discover",
  "filters": {
    "cuisine": "turkish",
    "meal_type": "dessert",
    "max_time_min": 60
  },
  "sort": "rating",
  "limit": 20
}
```

---

## 💰 MALİYET

| Function | Trigger Sıklığı | Tahmini Aylık (10K MAU) |
|----------|-----------------|-------------------------|
| getRecipeRecommendations | 10K user × 5/gün = 50K/gün | ~$3 |
| analyzePantryPhoto | 3K user × 1/gün = 3K/gün | ~$2 (Vision API: $1.5/1K) |
| incrementViewCount | 30K/gün | ~$0.5 |
| onRatingChange | 1K/gün | ~$0.1 |
| onFavoriteChange | 5K/gün | ~$0.2 |
| getRecipeOfTheDay | 10K/gün (cached) | ~$0.1 |
| cleanupPantryScans | 1/gün | ~$0 |
| **TOPLAM** | | **~$6/ay** |

> Free tier: 2M invocations + 400K GB-s memory free.
> 10K MAU senaryosunda muhtemelen tamamen ücretsiz.

---

## 🔐 SECURITY

### Firestore Security Rules (sadece functions yazsın)
```javascript
// recipes_{lang}: client read-only
match /recipes_{lang}/{recipeId} {
  allow read: if true;
  allow write: if false; // sadece admin SDK
}

// ratings: client kendi rating'i için
match /ratings/{ratingId} {
  allow read: if true;
  allow write: if request.auth.uid != null
    && request.resource.data.user_id == request.auth.uid;
}

// quotas: sadece functions
match /users/{userId}/quotas/{date} {
  allow read: if request.auth.uid == userId;
  allow write: if false;
}
```

---

## 🐛 DEBUGGING

### Function logs
```bash
firebase functions:log

# Belirli function
firebase functions:log --only getRecipeRecommendations

# Live tail
firebase functions:log --only analyzePantryPhoto --since 1m
```

### Yaygın Hatalar

**"Vision API not enabled":**
- Google Cloud Console'da Vision API'yi aktive et
- Service account'a `roles/cloudvision.user` ver

**"array-contains-any limit"**
- Firestore array-contains-any max 30 değer kabul eder
- Kullanıcı 30+ malzeme verirse batch'lere böl

**"Index missing"**
```bash
# Cloud Function ilk çalıştığında log'da index URL'i verir
firebase deploy --only firestore:indexes
```

---

## 🎯 OPTİMİZASYON İPUÇLARI

1. **Cache popüler tarifleri**: `recipe_of_the_day` zaten cache'liyor. Top 100 tarifi de Redis/Memorystore ile cache'le.

2. **array-contains-any optimize**: Kullanıcının en sık 30 malzemesini al, geri kalanı client-side filter ile yap.

3. **Pre-compute trending**: `trending` sort her seferinde view_count'a göre order ediyor. Geç saatlerde "trending_cached" koleksiyonu güncelle.

4. **Pantry scan retry**: Vision API failure'da Pixabay/Pexels'tan benzer görsel arayıp tekrar dene (failover).

5. **Edge function**: Yüksek trafik için Cloud Run'a taşı (cold start ↓).
