/**
 * Pratik Tarifler — Cloud Functions
 * ===================================
 * Tüm backend logic burada:
 * - Image pipeline (scheduled)
 * - Rating aggregation (trigger)
 * - Pantry photo analysis (callable)
 * - Recipe recommendations (callable)
 * - Cleanup tasks (scheduled)
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onObjectFinalized } from 'firebase-functions/v2/storage';

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();
const FieldValue = admin.firestore.FieldValue;

// ============================================================
// 1. IMAGE PIPELINE WORKER (Scheduled - saatte 1)
// ============================================================
export const imagePipelineWorker = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeoutSeconds: 540,
    memory: '1GiB',
    secrets: ['UNSPLASH_KEY', 'PEXELS_KEY', 'OPENAI_KEY'],
  },
  async (event) => {
    console.log('Image pipeline starting...');
    
    // Bir batch (50 iş)
    const jobs = await db.collection('image_jobs')
      .where('status', '==', 'pending')
      .orderBy('priority', 'asc')
      .orderBy('created_at', 'asc')
      .limit(50)
      .get();
    
    console.log(`Processing ${jobs.size} jobs`);
    
    for (const doc of jobs.docs) {
      try {
        await processImageJob(doc);
      } catch (e: any) {
        console.error(`Job ${doc.id} failed:`, e);
        await doc.ref.update({
          status: 'failed',
          'attempts': FieldValue.arrayUnion({
            source: 'system',
            error: e.message,
            at: new Date().toISOString()
          }),
          updated_at: FieldValue.serverTimestamp()
        });
      }
    }
    
    console.log('Image pipeline complete');
  }
);

async function processImageJob(doc: FirebaseFirestore.DocumentSnapshot) {
  const job = doc.data()!;
  
  // 1. searching status
  await doc.ref.update({ status: 'searching', updated_at: FieldValue.serverTimestamp() });
  
  // 2. Unsplash → Pexels → Pixabay → DALL-E
  // [implementasyon image_pipeline.py'deki gibi]
  
  // 3. İndir + işle + WebP + BlurHash
  // [Sharp library kullanılır]
  
  // 4. Storage'a upload
  // [admin.storage().bucket()...]
  
  // 5. recipes_tr'yi güncelle
  // [doc.ref'i update et]
  
  // 6. Review queue'ya ekle
}


// ============================================================
// 2. RATING AGGREGATION (Trigger)
// ============================================================
export const onRatingChange = onDocumentWritten(
  'ratings/{ratingId}',
  async (event) => {
    const data = event.data?.after?.data() || event.data?.before?.data();
    if (!data) return;
    
    const recipeId = data.recipe_id;
    const lang = recipeId.split('-')[0];
    const collectionName = `recipes_${lang}`;
    
    const ratings = await db.collection('ratings')
      .where('recipe_id', '==', recipeId)
      .get();
    
    const total = ratings.docs.reduce((s, d) => s + d.data().rating, 0);
    const count = ratings.size;
    const avg = count > 0 ? total / count : 0;
    
    await db.collection(collectionName).doc(recipeId).update({
      rating_avg: Math.round(avg * 10) / 10,
      rating_count: count,
      updated_at: FieldValue.serverTimestamp()
    });
  }
);


// ============================================================
// 3. FAVORITE COUNT (Subcollection Trigger)
// ============================================================
export const onFavoriteChange = onDocumentWritten(
  'users/{userId}/favorites/{recipeId}',
  async (event) => {
    const recipeId = event.params.recipeId;
    const lang = recipeId.split('-')[0];
    const collectionName = `recipes_${lang}`;
    
    const wasCreated = !event.data?.before?.exists && event.data?.after?.exists;
    const wasDeleted = event.data?.before?.exists && !event.data?.after?.exists;
    
    if (wasCreated) {
      await db.collection(collectionName).doc(recipeId).update({
        favorite_count: FieldValue.increment(1)
      });
    } else if (wasDeleted) {
      await db.collection(collectionName).doc(recipeId).update({
        favorite_count: FieldValue.increment(-1)
      });
    }
  }
);


// ============================================================
// 4. PANTRY PHOTO ANALYSIS (Callable - Mod 1)
// ============================================================
export const analyzePantryPhoto = onCall(
  {
    memory: '512MiB',
    timeoutSeconds: 60,
    secrets: ['GOOGLE_VISION_KEY'],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in required');
    }
    
    const { photo_path } = request.data;
    if (!photo_path || !photo_path.startsWith('temp/pantry_scans/')) {
      throw new HttpsError('invalid-argument', 'Invalid photo path');
    }
    
    // Quota kontrol
    const userId = request.auth.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();
    const isPremium = user?.subscription?.tier !== 'free';
    
    if (!isPremium) {
      // Free tier: günde 3 scan
      const today = new Date().toISOString().split('T')[0];
      const scansToday = await db.collection('users').doc(userId)
        .collection('scan_history')
        .where('date', '==', today).get();
      
      if (scansToday.size >= 3) {
        throw new HttpsError('resource-exhausted', 'Daily limit reached. Upgrade to Premium for unlimited scans.');
      }
    }
    
    // Google Vision API çağrı
    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();
    
    const bucketName = process.env.GCLOUD_PROJECT + '.appspot.com';
    const [result] = await client.objectLocalization({
      image: { source: { imageUri: `gs://${bucketName}/${photo_path}` } }
    });
    
    const detected = (result.localizedObjectAnnotations || [])
      .map((obj: any) => mapObjectToIngredientToken(obj.name))
      .filter(Boolean);
    
    // Scan history kaydet (rate limit için)
    if (!isPremium) {
      await db.collection('users').doc(userId).collection('scan_history').add({
        date: new Date().toISOString().split('T')[0],
        timestamp: FieldValue.serverTimestamp(),
        detected_count: detected.length
      });
    }
    
    return {
      detected_ingredients: [...new Set(detected)],
      raw_objects: result.localizedObjectAnnotations
    };
  }
);

function mapObjectToIngredientToken(name: string): string | null {
  // Google Vision object name → ingredient_token mapping
  const map: { [key: string]: string } = {
    'Tomato': 'tomato',
    'Egg': 'egg',
    'Bread': 'bread',
    'Cheese': 'cheese',
    'Onion': 'onion',
    'Garlic': 'garlic',
    'Carrot': 'carrot',
    'Potato': 'potato',
    'Apple': 'fruit',
    'Banana': 'fruit',
    'Lemon': 'lemon',
    'Milk': 'milk',
    'Butter': 'butter',
    'Chicken': 'chicken',
    'Fish': 'fish',
    'Mushroom': 'mushroom',
    'Pepper': 'pepper',
    'Eggplant': 'eggplant',
    'Zucchini': 'zucchini',
    'Lettuce': 'vegetable',
    'Cucumber': 'vegetable',
    // ... daha geniş mapping
  };
  return map[name] || null;
}


// ============================================================
// 5. GET RECIPE RECOMMENDATIONS (Callable - Mod 1/2/3)
// ============================================================
export const getRecipeRecommendations = onCall(
  {
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (request) => {
    const { mode, ingredients = [], lang = 'tr', filters = {}, limit = 20 } = request.data;
    
    if (!['pantry', 'supply', 'unlimited'].includes(mode)) {
      throw new HttpsError('invalid-argument', 'Invalid mode');
    }
    
    const collectionName = `recipes_${lang}`;
    let query = db.collection(collectionName)
      .where('image_status', '==', 'ready') as FirebaseFirestore.Query;
    
    if (mode === 'pantry') {
      // Mod 1: SADECE elde olan malzemelerle yapılabilen tarifler
      return await findPantryRecipes(ingredients, collectionName, limit);
    } else if (mode === 'supply') {
      // Mod 2: 1-2 ek malzeme alabilir
      return await findSupplyRecipes(ingredients, collectionName, limit);
    } else {
      // Mod 3: Genel arama (filtre uygula)
      if (filters.cuisine) query = query.where('cuisine', '==', filters.cuisine);
      if (filters.meal_type) query = query.where('meal_type', 'array-contains', filters.meal_type);
      if (filters.diet_tag) query = query.where('diet_tags', 'array-contains', filters.diet_tag);
      if (filters.difficulty) query = query.where('difficulty', '==', filters.difficulty);
      
      query = query.orderBy('rating_avg', 'desc').limit(limit);
      
      const snap = await query.get();
      return {
        recipes: snap.docs.map(d => ({ id: d.id, ...d.data() })),
        count: snap.size
      };
    }
  }
);

async function findPantryRecipes(ingredients: string[], collection: string, limit: number) {
  // Strateji: ingredient_tokens array-contains-any (max 10) + filter
  if (ingredients.length === 0) return { recipes: [], count: 0 };
  
  // En önemli ingredient'a göre fetch (Firestore tek bir array-contains)
  const candidatesByIngredient = await db.collection(collection)
    .where('image_status', '==', 'ready')
    .where('ingredient_tokens', 'array-contains-any', ingredients.slice(0, 10))
    .limit(200)  // candidate pool
    .get();
  
  // Client-side: Tarifteki TÜM token'lar elde olmalı
  const userIngredients = new Set(ingredients);
  const matches = candidatesByIngredient.docs
    .map(d => ({ id: d.id, ...d.data() } as any))
    .filter(r => {
      // Tarifin ingredient tokenlarının HEPSİ kullanıcıda olmalı
      const recipeTokens = r.ingredient_tokens || [];
      return recipeTokens.every((t: string) => userIngredients.has(t));
    })
    .sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0))
    .slice(0, limit);
  
  return {
    recipes: matches,
    count: matches.length,
    mode: 'pantry'
  };
}

async function findSupplyRecipes(ingredients: string[], collection: string, limit: number) {
  // Strateji: Tariflerdeki eksik malzeme sayısı ≤ 2 olmalı
  if (ingredients.length === 0) return { recipes: [], count: 0 };
  
  const candidatesByIngredient = await db.collection(collection)
    .where('image_status', '==', 'ready')
    .where('ingredient_tokens', 'array-contains-any', ingredients.slice(0, 10))
    .limit(300)
    .get();
  
  const userIngredients = new Set(ingredients);
  const matches = candidatesByIngredient.docs
    .map(d => ({ id: d.id, ...d.data() } as any))
    .map(r => {
      const recipeTokens = r.ingredient_tokens || [];
      const missing = recipeTokens.filter((t: string) => !userIngredients.has(t));
      return { ...r, missing_ingredients: missing, missing_count: missing.length };
    })
    .filter(r => r.missing_count > 0 && r.missing_count <= 2)
    .sort((a, b) => a.missing_count - b.missing_count || (b.rating_avg || 0) - (a.rating_avg || 0))
    .slice(0, limit);
  
  return {
    recipes: matches,
    count: matches.length,
    mode: 'supply'
  };
}


// ============================================================
// 6. STORAGE TRIGGER - Image upload sonrası işle
// ============================================================
export const onPantryScanUpload = onObjectFinalized(
  {
    region: 'us-central1',
  },
  async (event) => {
    const path = event.data.name;
    if (!path?.startsWith('temp/pantry_scans/')) return;
    
    console.log(`New pantry scan: ${path}`);
    // Otomatik analiz tetikleyebilir, ama biz callable üzerinden manuel yaparız
  }
);


// ============================================================
// 7. CLEANUP TASKS (Scheduled - günde 1)
// ============================================================
export const cleanupPantryScans = onSchedule(
  {
    schedule: 'every 24 hours',
    timeoutSeconds: 540,
  },
  async (event) => {
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: 'temp/pantry_scans/' });
    
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    let deleted = 0;
    
    for (const file of files) {
      const [metadata] = await file.getMetadata();
      const created = new Date(metadata.timeCreated as string).getTime();
      
      if (created < cutoff) {
        await file.delete();
        deleted++;
      }
    }
    
    console.log(`Cleanup: ${deleted} files deleted`);
  }
);


// ============================================================
// 8. INCREMENT VIEW COUNT (Callable - debounced)
// ============================================================
export const incrementViewCount = onCall(
  { memory: '128MiB', timeoutSeconds: 10 },
  async (request) => {
    const { recipe_id, lang = 'tr' } = request.data;
    if (!recipe_id) throw new HttpsError('invalid-argument', 'recipe_id required');
    
    const collectionName = `recipes_${lang}`;
    await db.collection(collectionName).doc(recipe_id).update({
      view_count: FieldValue.increment(1)
    });
    
    return { ok: true };
  }
);
