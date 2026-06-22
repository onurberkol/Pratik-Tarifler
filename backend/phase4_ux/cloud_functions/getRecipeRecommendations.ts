/**
 * getRecipeRecommendations — 3 MOD TARIF ÖNERI ALGORİTMASI
 * ============================================================
 * Pratik Tarifler'nin kalbi. Tüm 3 modu (pantry, supply, discover) yönetir.
 *
 * Mod 1 (PANTRY): SADECE elde olan malzemelerle yapılabilenler
 *   - SQL kavramı: WHERE all(recipe.ingredient_tokens) IN user.tokens
 *   - Firestore'da: array-contains-any ile kabaca getir, sonra client-side TAM filter
 *
 * Mod 2 (SUPPLY): Eldekiler + max N eksik kabul edilen
 *   - WHERE intersect(recipe.ingredient_tokens, user.tokens).length >= recipe.ingredient_tokens.length - max_missing
 *
 * Mod 3 (DISCOVER): Filter-based klasik arama
 *   - Cuisine, meal_type, diet_tag, max_time vb.
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// ============================================================
// TYPES
// ============================================================
type RecommendationMode = 'pantry' | 'supply' | 'discover';

interface RecommendationRequest {
  mode: RecommendationMode;
  lang: string;
  ingredients?: string[];           // Mod 1 & 2 için zorunlu
  max_missing?: number;              // Mod 2 default: 2
  filters?: {
    cuisine?: string;
    meal_type?: string;
    diet_tags?: string[];
    max_time_min?: number;
    difficulty?: string;
  };
  sort?: string;
  limit?: number;
  cursor?: string;                   // Pagination
}

interface MissingIngredient {
  token: string;
  label_tr: string;
  label_localized: string;
  estimated_price_try?: number;
}

interface RecipeWithMatch {
  id: string;
  // ...tüm Recipe alanları
  [key: string]: any;
  
  // Mod 1 özel
  match_percentage?: number;
  uses_ingredients?: string[];
  
  // Mod 2 özel
  missing_ingredients?: MissingIngredient[];
  missing_count?: number;
}

// ============================================================
// MAIN CALLABLE
// ============================================================
export const getRecipeRecommendations = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
    region: 'us-central1',
  },
  async (request: CallableRequest<RecommendationRequest>) => {
    const { auth, data } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'Login required');
    }
    
    const userId = auth.uid;
    const { mode, lang = 'tr', limit = 20 } = data;
    
    // Rate limiting (basit - 1 dakikada 30 istek)
    await checkRateLimit(userId, 'recommendations');
    
    // Audit log
    await db.collection('analytics_events').add({
      user_id: userId,
      event: 'recommendation_request',
      mode,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Mod'a göre dispatch
    switch (mode) {
      case 'pantry':
        return await pantryModeRecommendations(data, lang);
      
      case 'supply':
        return await supplyModeRecommendations(data, lang);
      
      case 'discover':
        return await discoverModeRecommendations(data, lang);
      
      default:
        throw new HttpsError('invalid-argument', `Invalid mode: ${mode}`);
    }
  }
);


// ============================================================
// MOD 1 — PANTRY (Elde olanlarla)
// ============================================================
async function pantryModeRecommendations(
  req: RecommendationRequest,
  lang: string
) {
  const { ingredients = [], limit = 20 } = req;
  
  if (ingredients.length < 3) {
    throw new HttpsError(
      'invalid-argument',
      'En az 3 malzeme gereklidir'
    );
  }
  
  // STRATEJİ:
  // 1. Firestore'dan kullanıcının HERHANGİ bir tokenını içeren tarifleri getir (array-contains-any max 30 token)
  // 2. Client-side filter: SADECE TÜM token'ları kullanıcıda olan tarifleri tut
  // 3. Sırala: rating_avg DESC, total_time ASC
  //
  // NOT: array-contains-any 30 değer limiti var. Eğer kullanıcı 30+ malzeme verirse,
  //      batch'lere böl ve birleştir.
  
  const userTokens = new Set(ingredients);
  const candidatesPerBatch = Math.min(30, ingredients.length);
  
  // İlk batch ile başla (en sık malzemeler)
  const tokensToQuery = ingredients.slice(0, candidatesPerBatch);
  
  const recipesRef = db.collection(`recipes_${lang}`);
  let query = recipesRef
    .where('image_status', '==', 'ready')
    .where('ingredient_tokens', 'array-contains-any', tokensToQuery)
    .orderBy('rating_avg', 'desc')
    .limit(200); // candidate pool
  
  const snap = await query.get();
  
  // Client-side TAM filter: tüm tarif tokenları kullanıcıda olmalı
  const matches: RecipeWithMatch[] = [];
  for (const doc of snap.docs) {
    const recipe = { id: doc.id, ...doc.data() } as RecipeWithMatch;
    const recipeTokens: string[] = recipe.ingredient_tokens || [];
    
    // TAMAMINI içeriyor mu?
    const allCovered = recipeTokens.every(t => userTokens.has(t));
    if (!allCovered) continue;
    
    // Mod 1 özel alanlar
    recipe.match_percentage = 100;
    recipe.uses_ingredients = recipeTokens;
    
    matches.push(recipe);
    if (matches.length >= limit) break;
  }
  
  return {
    mode: 'pantry',
    total_matches: matches.length,
    recipes: matches,
    next_cursor: null, // Pantry için pagination yok — sonuç sınırlı
  };
}


// ============================================================
// MOD 2 — SUPPLY (Max N eksik kabul)
// ============================================================
async function supplyModeRecommendations(
  req: RecommendationRequest,
  lang: string
) {
  const { ingredients = [], max_missing = 2, limit = 20 } = req;
  
  if (ingredients.length < 2) {
    throw new HttpsError(
      'invalid-argument',
      'En az 2 malzeme gereklidir'
    );
  }
  
  const userTokens = new Set(ingredients);
  const candidatesPerBatch = Math.min(30, ingredients.length);
  const tokensToQuery = ingredients.slice(0, candidatesPerBatch);
  
  // Daha geniş candidate pool çünkü eksiklere de izin var
  const recipesRef = db.collection(`recipes_${lang}`);
  const query = recipesRef
    .where('image_status', '==', 'ready')
    .where('ingredient_tokens', 'array-contains-any', tokensToQuery)
    .orderBy('rating_avg', 'desc')
    .limit(400); // Daha geniş havuz
  
  const snap = await query.get();
  
  // Eksik malzeme isim mapping'i için kataloğu önceden çek (cache'lenebilir)
  const tokenLabels = await getIngredientLabels(lang);
  
  const matches: RecipeWithMatch[] = [];
  for (const doc of snap.docs) {
    const recipe = { id: doc.id, ...doc.data() } as RecipeWithMatch;
    const recipeTokens: string[] = recipe.ingredient_tokens || [];
    
    // Kaç tane eksik?
    const missing: string[] = [];
    for (const token of recipeTokens) {
      if (!userTokens.has(token)) missing.push(token);
    }
    
    // Max N eksik kuralı
    if (missing.length > max_missing) continue;
    if (missing.length === 0) {
      // Tam eşleşme — yine de Mod 2'de göster ama "0 eksik" badge
    }
    
    // Mod 2 özel alanlar
    recipe.missing_count = missing.length;
    recipe.missing_ingredients = missing.map(token => ({
      token,
      label_tr: tokenLabels.tr[token] || token,
      label_localized: tokenLabels[lang]?.[token] || tokenLabels.tr[token] || token,
      estimated_price_try: estimatePrice(token),
    }));
    
    matches.push(recipe);
  }
  
  // Sırala: en az eksikten en çoğa, sonra rating
  matches.sort((a, b) => {
    if (a.missing_count !== b.missing_count) {
      return a.missing_count! - b.missing_count!;
    }
    return (b.rating_avg || 0) - (a.rating_avg || 0);
  });
  
  return {
    mode: 'supply',
    total_matches: matches.length,
    recipes: matches.slice(0, limit),
    next_cursor: null,
  };
}


// ============================================================
// MOD 3 — DISCOVER (Filter-based)
// ============================================================
async function discoverModeRecommendations(
  req: RecommendationRequest,
  lang: string
) {
  const { filters = {}, sort = 'rating', limit = 20, cursor } = req;
  
  const recipesRef = db.collection(`recipes_${lang}`);
  let query: FirebaseFirestore.Query = recipesRef
    .where('image_status', '==', 'ready');
  
  // Filtreler
  if (filters.cuisine) {
    query = query.where('cuisine', '==', filters.cuisine);
  }
  if (filters.meal_type) {
    query = query.where('meal_type', 'array-contains', filters.meal_type);
  }
  if (filters.difficulty) {
    query = query.where('difficulty', '==', filters.difficulty);
  }
  if (filters.diet_tags && filters.diet_tags.length > 0) {
    // array-contains-any ile (max 30)
    query = query.where('diet_tags', 'array-contains-any', filters.diet_tags.slice(0, 30));
  }
  if (filters.max_time_min) {
    query = query.where('total_time_min', '<=', filters.max_time_min);
  }
  
  // Sıralama
  switch (sort) {
    case 'trending':
      query = query.orderBy('view_count', 'desc');
      break;
    case 'newest':
      query = query.orderBy('published_at', 'desc');
      break;
    case 'time':
      query = query.orderBy('total_time_min', 'asc');
      break;
    case 'rating':
    default:
      query = query.orderBy('rating_avg', 'desc');
  }
  
  // Pagination
  if (cursor) {
    const cursorDoc = await db.doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }
  
  query = query.limit(limit);
  const snap = await query.get();
  
  const recipes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const lastDoc = snap.docs[snap.docs.length - 1];
  
  return {
    mode: 'discover',
    total_matches: recipes.length,
    recipes,
    next_cursor: lastDoc ? lastDoc.ref.path : null,
  };
}


// ============================================================
// HELPERS
// ============================================================

let ingredientLabelsCache: { [lang: string]: { [token: string]: string } } | null = null;
async function getIngredientLabels(lang: string) {
  if (ingredientLabelsCache) return ingredientLabelsCache;
  
  // İdeal: ingredient_catalog koleksiyonu Firestore'da
  // Şimdilik hard-coded
  ingredientLabelsCache = {
    tr: {
      egg: 'Yumurta', milk: 'Süt', cheese: 'Peynir', butter: 'Tereyağı',
      yogurt: 'Yoğurt', chicken: 'Tavuk', lamb: 'Kuzu', beef: 'Dana',
      ground_meat: 'Kıyma', fish: 'Balık', tomato: 'Domates', onion: 'Soğan',
      garlic: 'Sarımsak', potato: 'Patates', carrot: 'Havuç', pepper: 'Biber',
      eggplant: 'Patlıcan', zucchini: 'Kabak', mushroom: 'Mantar',
      spinach: 'Ispanak', rice: 'Pirinç', bulgur: 'Bulgur', pasta: 'Makarna',
      flour: 'Un', bread: 'Ekmek', phyllo: 'Yufka', lentil: 'Mercimek',
      chickpea: 'Nohut', olive_oil: 'Zeytinyağı', olive: 'Zeytin',
      honey: 'Bal', lemon: 'Limon', parsley: 'Maydanoz', dill: 'Dereotu',
      basil: 'Fesleğen', thyme: 'Kekik', spice: 'Baharat',
    },
    en: {
      egg: 'Egg', milk: 'Milk', cheese: 'Cheese', butter: 'Butter',
      yogurt: 'Yogurt', chicken: 'Chicken', lamb: 'Lamb', beef: 'Beef',
      ground_meat: 'Ground meat', fish: 'Fish', tomato: 'Tomato',
      onion: 'Onion', garlic: 'Garlic', potato: 'Potato', carrot: 'Carrot',
      pepper: 'Pepper', eggplant: 'Eggplant', zucchini: 'Zucchini',
      mushroom: 'Mushroom', spinach: 'Spinach', rice: 'Rice', bulgur: 'Bulgur',
      pasta: 'Pasta', flour: 'Flour', bread: 'Bread', phyllo: 'Phyllo dough',
      lentil: 'Lentil', chickpea: 'Chickpea', olive_oil: 'Olive oil',
      olive: 'Olive', honey: 'Honey', lemon: 'Lemon', parsley: 'Parsley',
      dill: 'Dill', basil: 'Basil', thyme: 'Thyme', spice: 'Spice',
    },
  };
  
  return ingredientLabelsCache;
}


// Basit fiyat tahmini (TRY, kabaca)
function estimatePrice(token: string): number {
  const prices: { [key: string]: number } = {
    chicken: 250, lamb: 600, beef: 550, ground_meat: 380,
    fish: 320, cheese: 220, butter: 180, milk: 65, yogurt: 80,
    egg: 110, // tray
    tomato: 35, onion: 25, garlic: 90, potato: 30, carrot: 35,
    pepper: 45, eggplant: 40, zucchini: 35, mushroom: 90,
    spinach: 40, rice: 75, bulgur: 60, pasta: 35, flour: 50,
    bread: 30, phyllo: 60, lentil: 55, chickpea: 60,
    olive_oil: 280, olive: 120, honey: 200, lemon: 30,
    parsley: 15, dill: 15, basil: 25, thyme: 30, spice: 50,
  };
  return prices[token] || 50;
}


async function checkRateLimit(userId: string, endpoint: string) {
  // Basit rate limit — 1 dakikada 30 istek
  const limitDoc = db.doc(`rate_limits/${userId}_${endpoint}`);
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 30;
  
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(limitDoc);
    const data = doc.data() || { requests: [], window_start: now };
    
    // Sıfırla pencere
    const recent = (data.requests || []).filter((t: number) => now - t < windowMs);
    
    if (recent.length >= maxRequests) {
      throw new HttpsError('resource-exhausted', 'Çok fazla istek. 1 dakika bekleyin.');
    }
    
    recent.push(now);
    tx.set(limitDoc, { requests: recent, last_request: now });
  });
}
