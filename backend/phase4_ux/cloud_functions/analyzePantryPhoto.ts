/**
 * analyzePantryPhoto — Mod 1 Buzdolabı Fotoğrafı Analizi
 * =========================================================
 * AKIŞ:
 *   1. Kullanıcı temp/pantry_scans/{uid}/{timestamp}.jpg'a fotoğraf yükler
 *   2. Bu function:
 *      - Daily quota kontrolü (free: 3/gün, premium: sınırsız)
 *      - Google Vision API çağrısı (LABEL_DETECTION + OBJECT_LOCALIZATION)
 *      - Tespit edilen etiketleri ingredient_token'lara map'le
 *      - Sonucu return et + scan log kaydet
 *
 * VISION API DETECTIONS:
 *   - LABEL_DETECTION: "tomato", "egg", "milk" gibi genel etiketler
 *   - OBJECT_LOCALIZATION: Bounding box ile birden çok obje (paket bazlı)
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import vision from '@google-cloud/vision';

const db = admin.firestore();
const visionClient = new vision.ImageAnnotatorClient();

// ============================================================
// VISION LABEL → INGREDIENT TOKEN MAPPING
// ============================================================
// Google Vision genelde İngilizce etiketler döner.
// Bunları kendi token sistemimize map'liyoruz.
const VISION_LABEL_TO_TOKEN: { [label: string]: string } = {
  // Eggs
  'egg': 'egg',
  'eggs': 'egg',
  'chicken egg': 'egg',
  
  // Dairy
  'milk': 'milk',
  'dairy': 'milk',
  'cheese': 'cheese',
  'cheddar': 'cheese',
  'mozzarella': 'cheese',
  'feta': 'cheese',
  'butter': 'butter',
  'yogurt': 'yogurt',
  'yoghurt': 'yogurt',
  
  // Meat
  'chicken': 'chicken',
  'chicken meat': 'chicken',
  'poultry': 'chicken',
  'lamb': 'lamb',
  'beef': 'beef',
  'meat': 'beef', // belirsizse beef default
  'ground meat': 'ground_meat',
  'mince': 'ground_meat',
  'fish': 'fish',
  'salmon': 'fish',
  
  // Vegetables
  'tomato': 'tomato',
  'tomatoes': 'tomato',
  'cherry tomato': 'tomato',
  'onion': 'onion',
  'onions': 'onion',
  'red onion': 'onion',
  'shallot': 'onion',
  'garlic': 'garlic',
  'potato': 'potato',
  'potatoes': 'potato',
  'sweet potato': 'potato',
  'carrot': 'carrot',
  'carrots': 'carrot',
  'pepper': 'pepper',
  'bell pepper': 'pepper',
  'capsicum': 'pepper',
  'eggplant': 'eggplant',
  'aubergine': 'eggplant',
  'zucchini': 'zucchini',
  'courgette': 'zucchini',
  'mushroom': 'mushroom',
  'mushrooms': 'mushroom',
  'spinach': 'spinach',
  'leek': 'leek',
  'cabbage': 'cabbage',
  'cauliflower': 'cauliflower',
  'broccoli': 'broccoli',
  'okra': 'okra',
  'pumpkin': 'pumpkin',
  
  // Grains/Legumes
  'rice': 'rice',
  'bulgur': 'bulgur',
  'pasta': 'pasta',
  'noodles': 'pasta',
  'flour': 'flour',
  'bread': 'bread',
  'lentil': 'lentil',
  'lentils': 'lentil',
  'red lentil': 'lentil',
  'chickpea': 'chickpea',
  'chickpeas': 'chickpea',
  'garbanzo': 'chickpea',
  'bean': 'white_bean',
  'beans': 'white_bean',
  'white bean': 'white_bean',
  'green bean': 'green_bean',
  'green peas': 'green_pea',
  
  // Oils/Condiments
  'olive oil': 'olive_oil',
  'olive': 'olive',
  'olives': 'olive',
  'honey': 'honey',
  'lemon': 'lemon',
  'lemons': 'lemon',
  
  // Herbs
  'parsley': 'parsley',
  'dill': 'dill',
  'basil': 'basil',
  'thyme': 'thyme',
  
  // Genel kategoriler — son çare
  'vegetable': 'vegetable',
  'fruit': 'fruit',
  'spice': 'spice',
};

// Türkçe etiket varsa (Vision multi-lang dönerse)
const TURKISH_LABEL_TO_TOKEN: { [label: string]: string } = {
  'yumurta': 'egg',
  'süt': 'milk',
  'peynir': 'cheese',
  'tereyağı': 'butter',
  'yoğurt': 'yogurt',
  'tavuk': 'chicken',
  'kuzu': 'lamb',
  'dana': 'beef',
  'kıyma': 'ground_meat',
  'balık': 'fish',
  'domates': 'tomato',
  'soğan': 'onion',
  'sarımsak': 'garlic',
  'patates': 'potato',
  'havuç': 'carrot',
  'biber': 'pepper',
  'patlıcan': 'eggplant',
  'kabak': 'zucchini',
  'mantar': 'mushroom',
  'ıspanak': 'spinach',
  'pirinç': 'rice',
  'bulgur': 'bulgur',
  'makarna': 'pasta',
  'un': 'flour',
  'ekmek': 'bread',
  'yufka': 'phyllo',
  'mercimek': 'lentil',
  'nohut': 'chickpea',
  'zeytinyağı': 'olive_oil',
  'zeytin': 'olive',
  'bal': 'honey',
  'limon': 'lemon',
  'maydanoz': 'parsley',
};


// ============================================================
// MAIN CALLABLE
// ============================================================
interface AnalyzeRequest {
  photo_path: string;          // "temp/pantry_scans/{uid}/{ts}.jpg"
  scan_id?: string;
}

export const analyzePantryPhoto = onCall(
  {
    timeoutSeconds: 60,
    memory: '512MiB',
    region: 'us-central1',
  },
  async (request: CallableRequest<AnalyzeRequest>) => {
    const { auth, data } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'Login required');
    }
    
    const userId = auth.uid;
    const { photo_path, scan_id } = data;
    
    if (!photo_path || !photo_path.startsWith(`temp/pantry_scans/${userId}/`)) {
      throw new HttpsError('invalid-argument', 'Invalid photo path');
    }
    
    // 1) Quota kontrolü
    const { allowed, scansToday, dailyLimit, isPremium } = await checkScanQuota(userId);
    if (!allowed) {
      throw new HttpsError(
        'resource-exhausted',
        `Günlük scan hakkın doldu (${dailyLimit}/gün). Premium ile sınırsız.`
      );
    }
    
    // 2) Vision API çağrısı
    const gsUri = `gs://${process.env.STORAGE_BUCKET}/${photo_path}`;
    
    try {
      const [result] = await visionClient.annotateImage({
        image: { source: { imageUri: gsUri } },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 30 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 15 },
        ],
      });
      
      const labels = result.labelAnnotations || [];
      const objects = result.localizedObjectAnnotations || [];
      
      // 3) Token'lara map'le
      const detectedTokens = new Map<string, {
        token: string;
        confidence: number;
        label_en: string;
        bounding_box?: any;
      }>();
      
      // Labels
      for (const label of labels) {
        const labelText = (label.description || '').toLowerCase();
        const token = mapLabelToToken(labelText);
        if (!token) continue;
        
        const confidence = label.score || 0;
        if (confidence < 0.5) continue; // Çok düşük güveni atla
        
        const existing = detectedTokens.get(token);
        if (!existing || existing.confidence < confidence) {
          detectedTokens.set(token, {
            token,
            confidence,
            label_en: labelText,
          });
        }
      }
      
      // Objects (bounding box ekle)
      for (const obj of objects) {
        const objName = (obj.name || '').toLowerCase();
        const token = mapLabelToToken(objName);
        if (!token) continue;
        
        const confidence = obj.score || 0;
        if (confidence < 0.5) continue;
        
        const vertices = obj.boundingPoly?.normalizedVertices || [];
        const bbox = vertices.length >= 2 ? {
          x: vertices[0].x || 0,
          y: vertices[0].y || 0,
          width: (vertices[2]?.x || 1) - (vertices[0].x || 0),
          height: (vertices[2]?.y || 1) - (vertices[0].y || 0),
        } : undefined;
        
        const existing = detectedTokens.get(token);
        if (!existing || existing.confidence < confidence) {
          detectedTokens.set(token, {
            token,
            confidence,
            label_en: objName,
            bounding_box: bbox,
          });
        }
      }
      
      // 4) Sonucu format'la
      const detected_ingredients = Array.from(detectedTokens.values())
        .sort((a, b) => b.confidence - a.confidence)
        .map(item => ({
          token: item.token,
          confidence: Math.round(item.confidence * 100) / 100,
          label_tr: getTrLabel(item.token),
          label_localized: getTrLabel(item.token),
          bounding_box: item.bounding_box,
        }));
      
      // 5) Scan'i log'la
      await incrementScanCount(userId);
      const finalScanId = scan_id || `scan_${Date.now()}`;
      await db.collection(`users/${userId}/scan_history`).doc(finalScanId).set({
        scan_id: finalScanId,
        photo_path,
        detected_count: detected_ingredients.length,
        detected_tokens: detected_ingredients.map(d => d.token),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return {
        scan_id: finalScanId,
        detected_ingredients,
        raw_objects: objects.map(o => ({
          name: o.name,
          score: o.score,
        })),
        scan_count_today: scansToday + 1,
        remaining_today: isPremium ? -1 : Math.max(0, dailyLimit - scansToday - 1),
      };
    } catch (err: any) {
      console.error('Vision API error:', err);
      throw new HttpsError(
        'internal',
        'Fotoğraf analizi başarısız. Tekrar dene.'
      );
    }
  }
);


// ============================================================
// HELPERS
// ============================================================
function mapLabelToToken(label: string): string | null {
  // Önce TR
  if (TURKISH_LABEL_TO_TOKEN[label]) return TURKISH_LABEL_TO_TOKEN[label];
  // Sonra EN exact
  if (VISION_LABEL_TO_TOKEN[label]) return VISION_LABEL_TO_TOKEN[label];
  
  // Partial match (örn "fresh tomato" → "tomato")
  for (const [key, token] of Object.entries(VISION_LABEL_TO_TOKEN)) {
    if (label.includes(key)) return token;
  }
  for (const [key, token] of Object.entries(TURKISH_LABEL_TO_TOKEN)) {
    if (label.includes(key)) return token;
  }
  
  return null;
}


function getTrLabel(token: string): string {
  const labels: { [k: string]: string } = {
    egg: 'Yumurta', milk: 'Süt', cheese: 'Peynir', butter: 'Tereyağı',
    yogurt: 'Yoğurt', chicken: 'Tavuk', lamb: 'Kuzu', beef: 'Dana',
    ground_meat: 'Kıyma', fish: 'Balık', tomato: 'Domates', onion: 'Soğan',
    garlic: 'Sarımsak', potato: 'Patates', carrot: 'Havuç', pepper: 'Biber',
    eggplant: 'Patlıcan', zucchini: 'Kabak', mushroom: 'Mantar',
    spinach: 'Ispanak', rice: 'Pirinç', bulgur: 'Bulgur', pasta: 'Makarna',
    flour: 'Un', bread: 'Ekmek', phyllo: 'Yufka', lentil: 'Mercimek',
    chickpea: 'Nohut', olive_oil: 'Zeytinyağı', olive: 'Zeytin',
    honey: 'Bal', lemon: 'Limon', parsley: 'Maydanoz',
  };
  return labels[token] || token;
}


async function checkScanQuota(userId: string) {
  const userDoc = await db.doc(`users/${userId}`).get();
  const userData = userDoc.data() || {};
  const isPremium = userData.subscription?.tier !== 'free';
  
  if (isPremium) {
    return { allowed: true, scansToday: 0, dailyLimit: Infinity, isPremium: true };
  }
  
  const today = new Date().toISOString().split('T')[0];
  const quotaDoc = await db.doc(`users/${userId}/quotas/${today}`).get();
  const scansToday = quotaDoc.data()?.pantry_scans || 0;
  const dailyLimit = 3;
  
  return {
    allowed: scansToday < dailyLimit,
    scansToday,
    dailyLimit,
    isPremium: false,
  };
}


async function incrementScanCount(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  await db.doc(`users/${userId}/quotas/${today}`).set({
    pantry_scans: admin.firestore.FieldValue.increment(1),
    last_scan_at: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}
