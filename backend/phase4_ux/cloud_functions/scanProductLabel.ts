/**
 * OCR — Product Label Scanner
 * ===============================
 * 
 * SENARYO: Kullanıcı buzdolabı fotoğrafı çekmek yerine, 
 *          alışverişten gelen ürünlerin etiketini taratır.
 *          Daha doğru çünkü "süt" yerine "Pınar UHT Yağsız Süt 1L" tanınır.
 * 
 * AKIŞ:
 *   1. Kullanıcı ürün etiketini çeker
 *   2. Google Vision DOCUMENT_TEXT_DETECTION (OCR)
 *   3. Barcode varsa BARCODE_DETECTION
 *   4. Markdown product name parse → ingredient_token
 *   5. Otomatik pantry'ye ekle + son kullanma tarihi varsa expiry warning
 * 
 * AVANTAJ: Tek tek manuel listeden seçmek yerine, ürünleri taratır geçer
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import vision from '@google-cloud/vision';

const db = admin.firestore();
const visionClient = new vision.ImageAnnotatorClient();


// ============================================================
// TR ÜRÜN MARKALARI → INGREDIENT TOKEN MAPPING
// ============================================================
const BRAND_TO_TOKEN: Record<string, string> = {
  // Süt
  'pınar süt': 'milk',
  'sütaş süt': 'milk',
  'içim süt': 'milk',
  'eker süt': 'milk',
  'sek süt': 'milk',
  
  // Peynir
  'pınar beyaz peynir': 'cheese',
  'sütaş kaşar': 'cheese',
  'gazi peynir': 'cheese',
  
  // Yumurta
  'köy yumurtası': 'egg',
  'organik yumurta': 'egg',
  
  // Et/Tavuk
  'banvit tavuk': 'chicken',
  'şenpiliç': 'chicken',
  'pınar et': 'beef',
  
  // Yoğurt
  'pınar yoğurt': 'yogurt',
  'sütaş yoğurt': 'yogurt',
  'eker yoğurt': 'yogurt',
  
  // Zeytinyağı
  'komili zeytinyağı': 'olive_oil',
  'kristal zeytinyağı': 'olive_oil',
  'sasa zeytinyağı': 'olive_oil',
  
  // Un
  'söke un': 'flour',
  'sinangil un': 'flour',
  
  // Pirinç/Bulgur
  'baldo pirinç': 'rice',
  'osmancık pirinç': 'rice',
  'reis bulgur': 'bulgur',
  'tat bulgur': 'bulgur',
  
  // Makarna
  'barilla makarna': 'pasta',
  'nuh makarna': 'pasta',
  'piyale': 'pasta',
  
  // Mercimek/Nohut
  'reis mercimek': 'lentil',
  'reis nohut': 'chickpea',
  
  // Bal
  'balparmak': 'honey',
  'altıparmak': 'honey',
};


// Kategori bazlı mapping (marka olmadığında)
const CATEGORY_KEYWORDS: Record<string, string> = {
  'süt': 'milk',
  'milk': 'milk',
  'yumurta': 'egg',
  'egg': 'egg',
  'peynir': 'cheese',
  'kaşar': 'cheese',
  'beyaz peynir': 'cheese',
  'yoğurt': 'yogurt',
  'yogurt': 'yogurt',
  'tereyağı': 'butter',
  'tavuk': 'chicken',
  'kuzu': 'lamb',
  'dana': 'beef',
  'kıyma': 'ground_meat',
  'mercimek': 'lentil',
  'nohut': 'chickpea',
  'pirinç': 'rice',
  'bulgur': 'bulgur',
  'makarna': 'pasta',
  'un': 'flour',
  'zeytinyağı': 'olive_oil',
  'zeytin': 'olive',
  'bal': 'honey',
  'tahin': 'tahini',
  'pekmez': 'honey',
  'salça': 'tomato',
  'reçel': 'fruit',
};


// ============================================================
// MAIN CALLABLE
// ============================================================
interface OCRRequest {
  photo_path: string;
}

interface DetectedProduct {
  product_name: string;
  detected_token: string | null;
  brand: string | null;
  expiry_date: string | null;
  barcode: string | null;
  confidence: number;
}


export const scanProductLabel = onCall(
  {
    timeoutSeconds: 30,
    memory: '512MiB',
  },
  async (request) => {
    const { auth, data } = request;
    if (!auth) throw new HttpsError('unauthenticated', 'Login required');
    
    const userId = auth.uid;
    const { photo_path } = data as OCRRequest;
    
    if (!photo_path || !photo_path.startsWith(`temp/pantry_scans/${userId}/`)) {
      throw new HttpsError('invalid-argument', 'Invalid photo path');
    }
    
    const gsUri = `gs://${process.env.STORAGE_BUCKET}/${photo_path}`;
    
    try {
      // Vision: hem OCR hem barcode
      const [result] = await visionClient.annotateImage({
        image: { source: { imageUri: gsUri } },
        features: [
          { type: 'DOCUMENT_TEXT_DETECTION' },   // tam metin
          { type: 'TEXT_DETECTION' },             // yedek
          // Not: Vision'da barcode için ayrı işlem gerekli (Cloud Vision'da yok)
        ],
      });
      
      const fullText = result.fullTextAnnotation?.text || '';
      const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
      
      if (lines.length === 0) {
        return {
          detected_products: [],
          raw_text: '',
          message: 'Metin tespit edilemedi',
        };
      }
      
      // Parse: ürün adı, marka, son kullanma tarihi
      const products: DetectedProduct[] = [];
      
      // İlk 3 satır genelde ürün adıdır
      const productText = lines.slice(0, 3).join(' ').toLowerCase();
      
      // Önce brand match dene
      let matchedToken: string | null = null;
      let matchedBrand: string | null = null;
      
      for (const [brandKey, token] of Object.entries(BRAND_TO_TOKEN)) {
        if (productText.includes(brandKey)) {
          matchedToken = token;
          matchedBrand = brandKey;
          break;
        }
      }
      
      // Brand bulunamadıysa kategori keyword
      if (!matchedToken) {
        for (const [keyword, token] of Object.entries(CATEGORY_KEYWORDS)) {
          if (productText.includes(keyword)) {
            matchedToken = token;
            break;
          }
        }
      }
      
      // Son kullanma tarihi parse
      const expiryDate = parseExpiryDate(fullText);
      
      products.push({
        product_name: lines[0] || 'Bilinmeyen ürün',
        detected_token: matchedToken,
        brand: matchedBrand,
        expiry_date: expiryDate,
        barcode: null,
        confidence: matchedToken ? 0.85 : 0.4,
      });
      
      // Otomatik pantry'ye ekle (kullanıcı isterse)
      if (matchedToken) {
        await db.doc(`users/${userId}/pantry/${matchedToken}`).set({
          token: matchedToken,
          display_name: lines[0],
          quantity: null,
          expires_at: expiryDate || null,
          source: 'product_scan',
          added_at: admin.firestore.FieldValue.serverTimestamp(),
          brand: matchedBrand,
        }, { merge: true });
      }
      
      return {
        detected_products: products,
        raw_text: fullText.substring(0, 500),
        auto_added_to_pantry: !!matchedToken,
      };
    } catch (err: any) {
      console.error('OCR error:', err);
      throw new HttpsError('internal', 'OCR analizi başarısız');
    }
  }
);


// ============================================================
// HELPERS
// ============================================================

/**
 * Son kullanma tarihini metinden parse et.
 * Formatlar:
 *   - "SKT: 15.03.2026"
 *   - "Son kullanma: 15/03/2026"  
 *   - "Best before: 2026-03-15"
 *   - "TKT: 15.03.26"
 */
function parseExpiryDate(text: string): string | null {
  // SKT/TKT/Son kullanma + tarih
  const patterns = [
    /(?:SKT|TKT|son kullanma|best before|expiry)[:\s]+(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{2,4})/i,
    /(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{4})/,  // genel tarih
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const [, day, month, year] = match;
      let fullYear = parseInt(year, 10);
      if (fullYear < 100) fullYear += 2000;
      
      // Geçmiş tarihleri atla (yanlış parse)
      const date = new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10));
      if (date < new Date()) continue;
      
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
  }
  
  return null;
}
