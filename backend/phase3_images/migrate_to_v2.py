"""
Pratik Tarifler — Image Schema Migration
==========================================
Mevcut 2500 tarifin schema'sına 'image' alanını ekler.
Görsel henüz oluşturulmadığı için 'pending' status'ünde başlatır.

Pipeline aşamaları:
- pending  : Henüz işlenmedi
- searching: Unsplash/Pexels'te arıyor
- generating: AI ile üretiliyor
- review   : Admin onayı bekliyor
- ready    : Yayında
- failed   : Hata, manuel müdahale
"""

import json, os, hashlib
from datetime import datetime

INPUT = '/home/claude/recipes_db/recipes_db_FULL_tr.json'
OUTPUT = '/home/claude/recipes_db/recipes_db_FULL_tr_v2.json'

# Tarifin Unsplash/AI search prompt için arama kelimelerini üret
def extract_search_terms(recipe):
    """TR title'dan İngilizce search terms üret."""
    # Bunlar fallback — gerçek pipeline'da AI veya çeviri API kullanılır
    title = recipe['title'].lower()
    primary = recipe.get('primary_ingredients', [])
    cuisine = recipe.get('cuisine', 'turkish')
    
    # Temel mutfak terimleri
    cuisine_keyword = {
        'turkish': 'Turkish food',
        'italian': 'Italian food',
        'french': 'French food',
        'mediterranean': 'Mediterranean food',
        'middle_eastern': 'Middle Eastern food',
        'american': 'American food',
        'mexican': 'Mexican food',
        'indian': 'Indian food',
        'spanish': 'Spanish food',
        'japanese': 'Japanese food',
        'chinese': 'Chinese food',
        'thai': 'Thai food',
        'russian': 'Russian food',
        'other': 'food'
    }
    
    # ingredient_token → İngilizce kelime
    token_translations = {
        'egg': 'eggs', 'milk': 'milk', 'cheese': 'cheese',
        'tomato': 'tomato', 'onion': 'onion', 'garlic': 'garlic',
        'olive_oil': 'olive oil', 'butter': 'butter',
        'rice': 'rice', 'bulgur': 'bulgur', 'pasta': 'pasta',
        'chicken': 'chicken', 'lamb': 'lamb', 'beef': 'beef',
        'ground_meat': 'ground meat', 'fish': 'fish',
        'phyllo': 'phyllo dough', 'bread': 'bread', 'flour': 'flour',
        'lentil': 'lentil', 'chickpea': 'chickpea',
        'white_bean': 'white beans', 'green_bean': 'green beans',
        'green_pea': 'green peas', 'mushroom': 'mushroom',
        'spinach': 'spinach', 'eggplant': 'eggplant',
        'zucchini': 'zucchini', 'pepper': 'pepper',
        'pumpkin': 'pumpkin', 'potato': 'potato',
        'carrot': 'carrot', 'beet': 'beetroot',
        'cabbage': 'cabbage', 'cauliflower': 'cauliflower',
        'broccoli': 'broccoli', 'leek': 'leek',
        'okra': 'okra', 'grape_leaf': 'stuffed grape leaves',
        'fruit': 'fruit', 'almond': 'almonds',
        'walnut': 'walnuts', 'tahini': 'tahini',
        'honey': 'honey', 'olive': 'olives',
        'smoked_meat': 'cured meat',
        'yogurt': 'yogurt', 'vegetable': 'vegetables',
    }
    
    primary_en = [token_translations.get(t, t) for t in primary]
    
    return {
        'primary_keywords': ' '.join(primary_en[:2]),
        'cuisine_keyword': cuisine_keyword.get(cuisine, 'food'),
        'fallback_query': f"{' '.join(primary_en[:1])} {cuisine_keyword.get(cuisine, 'food')}",
        'meal_type': recipe.get('meal_type', ['dinner'])[0] if recipe.get('meal_type') else 'dinner'
    }


def build_ai_prompt(recipe):
    """AI üretim için profesyonel food photography promptu."""
    title = recipe['title']
    cuisine = recipe.get('cuisine', 'turkish')
    meal_type = recipe.get('meal_type', ['dinner'])[0] if recipe.get('meal_type') else 'dinner'
    primary = recipe.get('primary_ingredients', [])
    
    # Cuisine'a göre stil
    style_map = {
        'turkish': 'authentic Turkish home-cooked, copper or ceramic vessel, rustic wooden surface',
        'italian': 'Italian cuisine, white plate, marble surface, fresh basil',
        'french': 'French bistro style, elegant plating, warm tones',
        'mediterranean': 'Mediterranean style, fresh herbs and lemon, light wooden surface',
        'middle_eastern': 'Middle Eastern style, copper tray, fresh herbs, warm spices visible',
        'american': 'American comfort food, casual presentation',
        'mexican': 'Mexican vibrant colors, lime and cilantro',
        'indian': 'Indian cuisine, rich colors, traditional thali style',
    }
    style = style_map.get(cuisine, 'home-cooked authentic presentation')
    
    # Meal type'a göre kompozisyon
    composition = {
        'breakfast': 'morning light, breakfast table setting, tea or coffee in corner',
        'dinner': 'top-down view, warm dinner ambiance',
        'lunch': 'natural daylight, simple plating',
        'dessert': 'close-up dessert shot, garnish detail, indulgent feel',
        'snack': 'casual snack presentation, hand-held style',
        'appetizer': 'small portion, mezze style, multiple elements',
        'soup': 'soup bowl with steam visible, spoon beside, garnish on top',
    }
    comp = composition.get(meal_type, 'top-down food photography view')
    
    prompt = (
        f"{title}, {style}, {comp}, "
        f"natural soft window light from left, professional food photography, "
        f"shallow depth of field, photorealistic, no text or watermarks, "
        f"warm authentic colors, magazine cookbook quality, 4:3 aspect ratio"
    )
    
    return prompt


# Yükle
with open(INPUT, encoding='utf-8') as f:
    data = json.load(f)

# Her tarife image alanı ekle
recipes_with_image = []
image_jobs = []  # Pipeline için iş kuyruğu

for r in data['recipes']:
    # Search terms üret
    search_terms = extract_search_terms(r)
    ai_prompt = build_ai_prompt(r)
    
    # Image schema'sı (henüz boş, pending)
    r['image'] = {
        'url_full': None,
        'url_thumb': None,
        'blur_hash': None,
        'width': None,
        'height': None,
        'source': None,         # unsplash | pexels | pixabay | dalle | flux | manual
        'source_id': None,
        'photographer': None,
        'photographer_url': None,
        'license': None,
        'status': 'pending',    # pending | searching | generating | review | ready | failed
        'created_at': None,
        'pipeline_metadata': {
            'search_terms': search_terms,
            'ai_prompt': ai_prompt,
        }
    }
    r['image_status'] = 'pending'  # hızlı sorgu için indexlenecek alan
    
    recipes_with_image.append(r)
    
    # İş kuyruğu kaydı
    image_jobs.append({
        'job_id': f"img_job_{r['id']}",
        'recipe_id': r['id'],
        'status': 'pending',
        'attempts': [],
        'current_image_url': None,
        'requires_review': False,
        'priority': 1 if r.get('is_premium') else 2,  # premium öncelikli
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'search_terms': search_terms,
        'ai_prompt': ai_prompt
    })

# Master JSON güncelle
data['recipes'] = recipes_with_image
data['version'] = '2.0.0'  # image schema eklendi
data['schema_version'] = 2

# Yaz
with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Image jobs ayrı dosyaya
jobs_file = '/home/claude/recipes_db/phase3_images/image_jobs.json'
with open(jobs_file, 'w', encoding='utf-8') as f:
    json.dump({
        'total_jobs': len(image_jobs),
        'status_breakdown': {'pending': len(image_jobs)},
        'jobs': image_jobs
    }, f, ensure_ascii=False, indent=2)

print(f"✓ Migrated: {len(recipes_with_image)} recipes")
print(f"✓ Image jobs queued: {len(image_jobs)}")
print(f"✓ Output: {OUTPUT}")
print(f"✓ Jobs: {jobs_file}")

# Boyut karşılaştır
old_size = os.path.getsize(INPUT) / 1024 / 1024
new_size = os.path.getsize(OUTPUT) / 1024 / 1024
print(f"\nBoyut karşılaştırma:")
print(f"  Eski (v1): {old_size:.2f} MB")
print(f"  Yeni (v2 + image schema): {new_size:.2f} MB")
print(f"  Fark: +{new_size - old_size:.2f} MB ({(new_size/old_size - 1)*100:.1f}%)")
