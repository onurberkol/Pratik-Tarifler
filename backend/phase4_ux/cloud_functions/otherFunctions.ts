/**
 * Diğer Cloud Functions
 * =========================
 * - onRatingChange: Rating eklendiğinde tarif'in rating_avg ve count'unu güncelle
 * - onFavoriteChange: Favorite eklendiğinde tarif'in favorite_count'unu güncelle
 * - incrementViewCount: Tarif görüntülendiğinde sayacı arttır (rate-limited)
 * - cleanupPantryScans: 24 saatten eski geçici fotoğrafları sil (scheduled)
 * - getRecipeOfTheDay: Günlük rotasyon (cached)
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { onDocumentWritten, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const storage = admin.storage();


// ============================================================
// onRatingChange — Rating aggregation
// ============================================================
export const onRatingChange = onDocumentWritten(
  'ratings/{ratingId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    
    const recipeId = after?.recipe_id || before?.recipe_id;
    const lang = after?.lang || before?.lang || 'tr';
    if (!recipeId) return;
    
    const recipeRef = db.doc(`recipes_${lang}/${recipeId}`);
    
    // Tüm rating'leri yeniden hesapla
    const ratingsSnap = await db.collection('ratings')
      .where('recipe_id', '==', recipeId)
      .where('lang', '==', lang)
      .get();
    
    const ratings = ratingsSnap.docs.map(d => d.data().score as number);
    const count = ratings.length;
    const avg = count > 0 
      ? ratings.reduce((a, b) => a + b, 0) / count 
      : 0;
    
    await recipeRef.update({
      rating_avg: Math.round(avg * 10) / 10,
      rating_count: count,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
);


// ============================================================
// onFavoriteChange — Counter update
// ============================================================
export const onFavoriteChange = onDocumentWritten(
  'users/{userId}/favorites/{recipeId}',
  async (event) => {
    const wasAdded = event.data?.after.exists && !event.data?.before.exists;
    const wasRemoved = !event.data?.after.exists && event.data?.before.exists;
    
    if (!wasAdded && !wasRemoved) return;
    
    const recipeId = event.params.recipeId;
    const delta = wasAdded ? 1 : -1;
    
    // Tüm dillerin tarif kopyalarını güncelle
    const langs = ['tr', 'en', 'de', 'fr', 'it', 'es', 'pt', 'el', 'nl', 'ru', 'sr', 'ar', 'he'];
    
    const batch = db.batch();
    for (const lang of langs) {
      const recipeRef = db.doc(`recipes_${lang}/${recipeId}`);
      batch.update(recipeRef, {
        favorite_count: admin.firestore.FieldValue.increment(delta),
      });
    }
    
    try {
      await batch.commit();
    } catch (err) {
      // Bazı dillerde tarif olmayabilir, sorun değil
      console.warn('Some lang updates failed (expected):', err);
    }
  }
);


// ============================================================
// incrementViewCount — Rate-limited view counter
// ============================================================
export const incrementViewCount = onCall(
  { timeoutSeconds: 10 },
  async (request: CallableRequest<{ recipe_id: string; lang: string }>) => {
    const { auth, data } = request;
    if (!auth) throw new HttpsError('unauthenticated', 'Login required');
    
    const { recipe_id, lang = 'tr' } = data;
    const userId = auth.uid;
    
    // Rate-limit: aynı kullanıcı aynı tarifi 30dk içinde tekrar saymaz
    const viewKey = `${userId}_${recipe_id}`;
    const recentRef = db.doc(`view_throttle/${viewKey}`);
    const recentDoc = await recentRef.get();
    
    if (recentDoc.exists) {
      const lastView = recentDoc.data()?.timestamp?.toMillis() || 0;
      if (Date.now() - lastView < 30 * 60 * 1000) {
        return { counted: false, reason: 'throttled' };
      }
    }
    
    // Counter güncelle
    await db.doc(`recipes_${lang}/${recipe_id}`).update({
      view_count: admin.firestore.FieldValue.increment(1),
    });
    
    // Throttle kaydı
    await recentRef.set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return { counted: true };
  }
);


// ============================================================
// cleanupPantryScans — 24h+ eski fotoğrafları sil (günde 1 kez)
// ============================================================
export const cleanupPantryScans = onSchedule(
  {
    schedule: 'every day 03:00',
    timeZone: 'Europe/Istanbul',
    timeoutSeconds: 540,
  },
  async () => {
    const bucket = storage.bucket();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    
    const [files] = await bucket.getFiles({
      prefix: 'temp/pantry_scans/',
    });
    
    let deletedCount = 0;
    for (const file of files) {
      const [meta] = await file.getMetadata();
      const created = new Date(meta.timeCreated || 0).getTime();
      
      if (created < cutoff) {
        await file.delete();
        deletedCount++;
      }
    }
    
    console.log(`Cleaned up ${deletedCount} old pantry scans`);
  }
);


// ============================================================
// getRecipeOfTheDay — Günlük tarif (cached)
// ============================================================
export const getRecipeOfTheDay = onCall(
  { timeoutSeconds: 10 },
  async (request: CallableRequest<{ lang: string }>) => {
    const { lang = 'tr' } = request.data;
    const today = new Date().toISOString().split('T')[0];
    
    // Önbellek kontrol
    const cacheRef = db.doc(`rotd_cache/${today}_${lang}`);
    const cacheDoc = await cacheRef.get();
    if (cacheDoc.exists) {
      return cacheDoc.data();
    }
    
    // Top 50 tariften deterministic seç
    const snap = await db.collection(`recipes_${lang}`)
      .where('image_status', '==', 'ready')
      .where('is_premium', '==', false)
      .orderBy('rating_avg', 'desc')
      .limit(50)
      .get();
    
    if (snap.empty) return { recipe: null };
    
    // Date hash ile seçim
    const hash = today.split('-').reduce((a, b) => a + parseInt(b), 0);
    const index = hash % snap.docs.length;
    const recipe = { id: snap.docs[index].id, ...snap.docs[index].data() };
    
    // Cache
    await cacheRef.set({ recipe, cached_at: admin.firestore.FieldValue.serverTimestamp() });
    
    return { recipe };
  }
);


// ============================================================
// submitRating — Kullanıcı tarif puanı
// ============================================================
export const submitRating = onCall(
  { timeoutSeconds: 10 },
  async (request: CallableRequest<{
    recipe_id: string;
    lang: string;
    score: number;       // 1-5
    review?: string;
  }>) => {
    const { auth, data } = request;
    if (!auth) throw new HttpsError('unauthenticated', 'Login required');
    
    const { recipe_id, lang = 'tr', score, review } = data;
    const userId = auth.uid;
    
    if (score < 1 || score > 5) {
      throw new HttpsError('invalid-argument', 'Score must be 1-5');
    }
    
    // Bir kullanıcı bir tarife bir kez rating verebilir (update support'lu)
    const ratingId = `${userId}_${recipe_id}_${lang}`;
    await db.doc(`ratings/${ratingId}`).set({
      user_id: userId,
      recipe_id,
      lang,
      score,
      review: review || null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    // onRatingChange trigger otomatik rating_avg günceller
    
    return { success: true };
  }
);
