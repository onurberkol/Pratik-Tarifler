# Pratik Tarifler / Pratik Tarifler — TR Recipe Database

## 📊 Genel Bilgi
- **Versiyon:** 1.0.0
- **Dil:** Türkçe (TR)
- **Toplam tarif:** 2500
- **Toplam batch:** 50
- **Schema versiyonu:** 1
- **Oluşturulma tarihi:** 2026-05-19

## 📦 Dosya İçeriği

### 1. Ana Dosyalar
| Dosya | Boyut | Format | Kullanım |
|-------|-------|--------|----------|
| `recipes_db_FULL_tr.json` | 6.4 MB | JSON | Ana veri tabanı + istatistik + batch özeti |
| `recipes_db_firestore_tr.json` | 5.9 MB | JSON key-value | Firestore Admin SDK batch upload |
| `recipes_db_ndjson_tr.ndjson` | 4.0 MB | NDJSON | Firestore CLI / BigQuery import |
| `batches/` | 50 dosya | Modüler | Batch bazlı debug/inceleme |

### 2. Master JSON Şema (`recipes_db_FULL_tr.json`)
```json
{
  "database_name": "Pratik Tarifler / Pratik Tarifler",
  "version": "1.0.0",
  "language": "tr",
  "total_recipes": 2500,
  "total_batches": 50,
  "statistics": { ... },
  "batches": [ ... ],
  "recipes": [ ... ]
}
```

### 3. Tarif Şeması
```json
{
  "id": "tr-tarif-id",
  "title": "Tarif Adı",
  "description": "Kısa açıklama",
  "ingredient_tokens": ["egg", "milk", ...],
  "primary_ingredients": ["egg"],
  "ingredients": [
    {"token": "egg", "amount": "2 adet", "note": ""}
  ],
  "steps": [
    {"order": 1, "title": "Adım", "body": "Açıklama", "timer_sec": 300}
  ],
  "tips": ["İpucu 1", "İpucu 2"],
  "total_time_min": 30,
  "active_time_min": 15,
  "servings": 4,
  "difficulty": "easy",
  "cuisine": "turkish",
  "diet_tags": ["vegetarian"],
  "meal_type": ["dinner"],
  "is_premium": false,
  "rating_avg": 4.7,
  "rating_count": 0,
  "schema_version": 1
}
```

## 📊 İstatistikler

### Mutfaklar
- Türk: 1077 (%43)
- Diğer/Modern: 431
- İtalyan: 259
- Akdeniz: 233
- Fransız: 136
- Orta Doğu: 127
- Amerikan: 116
- Diğer (Meksika, Hint, İspanyol, Japon, Çin, Tay, Rus): 121

### Zorluk
- Easy: 1606 (%64)
- Medium: 752 (%30)
- Hard: 142 (%6)

### Diyet Etiketleri
- Vegetarian: 1207
- Gluten-free: 937
- Vegan: 443

### Yemek Türü
- Dinner: 1280
- Snack: 710
- Lunch: 618
- Breakfast: 384
- Appetizer: 165
- Soup: 151
- Dessert: 22

### Hızlı Tarifler (≤15 dk): 295

### Premium Tarifler: 502 (%20)

## 🚀 Firebase Upload Örnek

### Admin SDK (Node.js)
```javascript
const admin = require('firebase-admin');
const fs = require('fs');

admin.initializeApp({ credential: ... });
const db = admin.firestore();
const data = JSON.parse(fs.readFileSync('recipes_db_firestore_tr.json'));

// Batch upload (500'lük gruplarla)
const ids = Object.keys(data);
for (let i = 0; i < ids.length; i += 500) {
  const batch = db.batch();
  for (let j = i; j < Math.min(i+500, ids.length); j++) {
    const id = ids[j];
    batch.set(db.collection('recipes_tr').doc(id), data[id]);
  }
  await batch.commit();
  console.log(`Uploaded ${Math.min(i+500, ids.length)}/${ids.length}`);
}
```

### Firestore CLI
```bash
firebase firestore:import recipes_db_ndjson_tr.ndjson \
  --collection=recipes_tr --format=ndjson
```

## 🗂 Kategori Dağılımı
| Kategori | Tarif Sayısı |
|----------|-------|
| Çorbalar | 200 |
| Kahvaltılıklar | 180 |
| Et yemekleri | 350 |
| Tavuk | 250 |
| Balık/Deniz | 150 |
| Sebze & Zeytinyağlı | 280 |
| Pilav/Bulgur/Makarna | 200 |
| Hamur işleri | 200 |
| Salatalar | 200 |
| Türk Tatlıları | 180 |
| Uluslararası Tatlı | 120 |
| Atıştırmalık | 150 |
| Pratik Az Malzeme | 123 |
| **TOPLAM** | **2500** |

## 🎯 Faz 3 — Yapılacaklar
1. **3 modlu UX entegrasyonu** (Vision API + Filter API)
2. **Görsel toplama** (Unsplash + DALL-E hibrit)
3. **12 dile çeviri** (en, de, fr, it, es, pt, el, nl, ru, sr, ar, he)
4. **Firebase Storage upload + imageUrl bağlama**
5. **App store paketleme + yayın**

## ⚖️ Telif
Tüm tarifler özel olarak yazıldı, telif-haksız.

---
Oluşturuldu: 2026-05-19 09:39
