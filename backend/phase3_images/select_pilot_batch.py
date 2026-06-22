"""
Pilot Batch Selector — 50 Adet Tarifi Akıllıca Seçer
====================================================
Image pipeline'ı tam ölçekte çalıştırmadan önce 50 tariflik
PİLOT batch ile test:
  - Her cuisine'dan dengeli örnekler
  - Premium ve normal karışık
  - Farklı meal_type'lar
  - Kolay/orta/zor karışık

Çıktı: pilot_batch.json — 50 seçilmiş tarif
"""

import json
from collections import defaultdict

with open('/home/claude/recipes_db/recipes_db_FULL_tr_v2.json', encoding='utf-8') as f:
    data = json.load(f)

recipes = data['recipes']
print(f"Toplam tarif: {len(recipes)}")

# Cuisine bazlı grupla
by_cuisine = defaultdict(list)
for r in recipes:
    by_cuisine[r['cuisine']].append(r)

print(f"\nCuisine dağılımı:")
for c, rs in sorted(by_cuisine.items(), key=lambda x: -len(x[1])):
    print(f"  {c}: {len(rs)}")

# Hedef dağılım (50 tarif, 14 cuisine)
# Her cuisine'dan ağırlıklı seç
total_target = 50
weights = {
    'turkish': 15,       # En çok Türk (UNESCO klasikleri test için kritik)
    'italian': 5,
    'mediterranean': 5,
    'middle_eastern': 4,
    'french': 4,
    'american': 3,
    'other': 6,
    'mexican': 2,
    'indian': 2,
    'spanish': 1,
    'japanese': 1,
    'chinese': 1,
    'thai': 1,
    'russian': 0
}
# 50'ye tamamla
assert sum(weights.values()) == 50

# Akıllı seçim: her cuisine içinde
#   - 1 premium (yöresel zor)
#   - 1-2 easy popüler
#   - kalan karışık
pilot = []
for cuisine, target in weights.items():
    if target == 0 or cuisine not in by_cuisine:
        continue
    candidates = by_cuisine[cuisine]
    
    # Premium ve free ayır
    premium = [r for r in candidates if r.get('is_premium')]
    free = [r for r in candidates if not r.get('is_premium')]
    
    # Sıralama: rating + popülerlik
    premium.sort(key=lambda r: r.get('rating_avg', 0), reverse=True)
    free.sort(key=lambda r: r.get('rating_avg', 0), reverse=True)
    
    selected = []
    # En az 1 premium varsa al
    if premium and target >= 2:
        selected.append(premium[0])
    
    # Kalan free'den, çeşitli meal_type'larla
    seen_meal = set()
    for r in free:
        if len(selected) >= target:
            break
        mt = r.get('meal_type', ['dinner'])[0]
        if mt not in seen_meal or len(selected) >= target - 1:
            selected.append(r)
            seen_meal.add(mt)
    
    # Hala eksik varsa rastgele tamamla
    while len(selected) < target and len(selected) < len(candidates):
        for r in candidates:
            if r not in selected:
                selected.append(r)
                break
    
    pilot.extend(selected[:target])
    print(f"  Selected from {cuisine}: {len(selected[:target])}")

print(f"\nPilot batch: {len(pilot)} recipes")

# Difficulty dağılımı kontrol
diff_count = defaultdict(int)
for r in pilot:
    diff_count[r['difficulty']] += 1
print(f"Difficulty: {dict(diff_count)}")

# Meal type dağılımı
mt_count = defaultdict(int)
for r in pilot:
    for mt in r.get('meal_type', []):
        mt_count[mt] += 1
print(f"Meal types: {dict(mt_count)}")

# Premium oranı
premium_count = sum(1 for r in pilot if r.get('is_premium'))
print(f"Premium: {premium_count}/{len(pilot)}")

# Kaydet — sadece pipeline için gerekli alanları al
pilot_compact = []
for r in pilot:
    pilot_compact.append({
        'id': r['id'],
        'title': r['title'],
        'cuisine': r['cuisine'],
        'meal_type': r.get('meal_type', []),
        'difficulty': r['difficulty'],
        'is_premium': r.get('is_premium', False),
        'primary_ingredients': r.get('primary_ingredients', []),
        'search_terms': r['image']['pipeline_metadata']['search_terms'],
        'ai_prompt': r['image']['pipeline_metadata']['ai_prompt']
    })

with open('/home/claude/recipes_db/phase3_images/pilot_batch.json', 'w', encoding='utf-8') as f:
    json.dump({
        'total': len(pilot_compact),
        'strategy': 'cuisine_weighted_balanced',
        'recipes': pilot_compact
    }, f, ensure_ascii=False, indent=2)

print(f"\n✓ Pilot batch kaydedildi: phase3_images/pilot_batch.json")

# İlk 5 tarifi yazdır
print(f"\n--- İlk 5 pilot tarif örneği ---")
for r in pilot_compact[:5]:
    print(f"  [{r['cuisine']:>15}] {r['title']}")
    print(f"    Search: '{r['search_terms']['fallback_query']}'")
    print(f"    AI prompt (kısaltılmış): {r['ai_prompt'][:80]}...")
    print()
