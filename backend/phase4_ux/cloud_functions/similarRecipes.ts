/**
 * Similar Recipes — Embedding-Based Recommendation
 * ====================================================
 * 
 * STRATEJI:
 *   1. Her tarif için embedding üret (Anthropic Embed veya local)
 *   2. Tarif detayı açıldığında 5 "benzer tarif" göster
 *   3. Cosine similarity ile en yakın 5 tarifi bul
 * 
 * AVANTAJ: 
 *   - "Eğer bunu sevdiysen şunu da seveceksin" UX'i
 *   - Cold-start problem yok (tarif metadata yeterli)
 * 
 * EMBEDDING ALANI: title + description + ingredient_tokens + cuisine
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

const db = admin.firestore();


// ============================================================
// 1. EMBEDDING GENERATION (Trigger — yeni tarif eklendiğinde)
// ============================================================
export const generateEmbeddingOnCreate = onDocumentCreated(
  'recipes_{lang}/{recipeId}',
  async (event) => {
    const recipe = event.data?.data();
    if (!recipe) return;
    
    const recipeId = event.params.recipeId;
    const lang = event.params.lang;
    
    // Embedding metnini hazırla
    const text = [
      recipe.title,
      recipe.description,
      ...(recipe.ingredient_tokens || []),
      recipe.cuisine,
      ...(recipe.meal_type || []),
    ].join(' ');
    
    // Embedding üret (Anthropic veya OpenAI)
    const embedding = await generateEmbedding(text);
    
    // Ayrı koleksiyonda sakla (ana doc'u şişirmemek için)
    await db.doc(`recipe_embeddings/${recipeId}`).set({
      recipe_id: recipeId,
      lang,
      vector: embedding,
      cuisine: recipe.cuisine,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
);


// ============================================================
// 2. SIMILAR RECIPES — Callable
// ============================================================
export const getSimilarRecipes = onCall(
  { timeoutSeconds: 15, memory: '512MiB' },
  async (request) => {
    const { recipe_id, lang = 'tr', limit = 5 } = request.data;
    
    // Source recipe embedding'i al
    const sourceDoc = await db.doc(`recipe_embeddings/${recipe_id}`).get();
    if (!sourceDoc.exists) {
      throw new HttpsError('not-found', 'Recipe embedding not found');
    }
    
    const sourceData = sourceDoc.data()!;
    const sourceVector = sourceData.vector as number[];
    const sourceCuisine = sourceData.cuisine;
    
    // Candidate pool: aynı cuisine'den en yüksek rating'li 100 tarif
    const recipesRef = db.collection(`recipes_${lang}`);
    let query: FirebaseFirestore.Query = recipesRef
      .where('image_status', '==', 'ready');
    
    if (sourceCuisine) {
      // Önce aynı cuisine'den ara (daha alakalı)
      query = query.where('cuisine', '==', sourceCuisine);
    }
    
    const candidateRecipes = await query
      .orderBy('rating_avg', 'desc')
      .limit(100)
      .get();
    
    // Her candidate için embedding'i al, similarity hesapla
    const similarities: Array<{ id: string; sim: number; data: any }> = [];
    
    for (const recipeDoc of candidateRecipes.docs) {
      if (recipeDoc.id === recipe_id) continue; // kendisi hariç
      
      const embeddingDoc = await db.doc(`recipe_embeddings/${recipeDoc.id}`).get();
      if (!embeddingDoc.exists) continue;
      
      const targetVector = embeddingDoc.data()!.vector as number[];
      const sim = cosineSimilarity(sourceVector, targetVector);
      
      similarities.push({
        id: recipeDoc.id,
        sim,
        data: { id: recipeDoc.id, ...recipeDoc.data() },
      });
    }
    
    // En yüksek similarity'den N tane al
    similarities.sort((a, b) => b.sim - a.sim);
    const top = similarities.slice(0, limit);
    
    return {
      source_recipe_id: recipe_id,
      similar_recipes: top.map(s => ({
        recipe: s.data,
        similarity: Math.round(s.sim * 100) / 100,
      })),
    };
  }
);


// ============================================================
// HELPERS
// ============================================================

/**
 * Embedding üretme — bu örnek için sözde Anthropic API'sı.
 * 
 * Anthropic'in Embed endpoint'i hayalî olduğu için, gerçek implementasyon:
 *   - OpenAI text-embedding-3-small ($0.02 / 1M tokens, 1536 dim)
 *   - veya Cohere embed-multilingual-v3.0
 *   - veya local: sentence-transformers (Cloud Run)
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // Production'da OpenAI çağrısı:
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });
  
  const data = await response.json() as any;
  return data.data[0].embedding;
}


function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}


// ============================================================
// 3. BATCH GENERATE EMBEDDINGS (one-time migration)
// ============================================================
/**
 * 2500 mevcut tarif için embedding üret.
 * Tek seferlik admin job.
 * 
 * Maliyet: 2500 × ~100 token = 250K token = $0.005 (OpenAI text-embedding-3-small)
 *          Tamamen $0.50 altı.
 */
export const generateAllEmbeddings = onCall(
  { timeoutSeconds: 540, memory: '1GiB' },
  async (request) => {
    if (!request.auth?.token?.admin) {
      throw new HttpsError('permission-denied', 'Admin only');
    }
    
    const { lang = 'tr', batch_size = 100 } = request.data;
    
    const recipesSnap = await db.collection(`recipes_${lang}`).get();
    let processed = 0;
    let failed = 0;
    
    for (const recipeDoc of recipesSnap.docs) {
      // Zaten var mı?
      const embeddingDoc = await db.doc(`recipe_embeddings/${recipeDoc.id}`).get();
      if (embeddingDoc.exists) continue;
      
      const recipe = recipeDoc.data();
      const text = [
        recipe.title,
        recipe.description,
        ...(recipe.ingredient_tokens || []),
        recipe.cuisine,
        ...(recipe.meal_type || []),
      ].join(' ');
      
      try {
        const embedding = await generateEmbedding(text);
        await db.doc(`recipe_embeddings/${recipeDoc.id}`).set({
          recipe_id: recipeDoc.id,
          lang,
          vector: embedding,
          cuisine: recipe.cuisine,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        processed++;
      } catch (err) {
        console.error(`Failed for ${recipeDoc.id}:`, err);
        failed++;
      }
      
      // Rate limit (OpenAI tier 1: 3000 RPM)
      if (processed % batch_size === 0) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    return { processed, failed, total: recipesSnap.size };
  }
);
