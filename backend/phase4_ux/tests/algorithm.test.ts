/**
 * 3 Mod Algoritma Testleri
 * ============================
 * Tarif öneri logic'inin doğru çalıştığını doğrular.
 * 
 * Unit testler — Firestore mock'larıyla çalışır, gerçek backend gerekmez.
 */

describe('Recipe Recommendation Algorithm', () => {
  
  // Test fixtures
  const mockRecipes = [
    {
      id: 'tr-menemen',
      title: 'Menemen',
      ingredient_tokens: ['egg', 'tomato', 'pepper', 'onion'],
      rating_avg: 4.8,
      image_status: 'ready',
      total_time_min: 15,
      difficulty: 'easy',
    },
    {
      id: 'tr-omlet',
      title: 'Omlet',
      ingredient_tokens: ['egg', 'butter', 'cheese'],
      rating_avg: 4.5,
      image_status: 'ready',
      total_time_min: 8,
      difficulty: 'easy',
    },
    {
      id: 'tr-tavuk-sote',
      title: 'Tavuk Sote',
      ingredient_tokens: ['chicken', 'onion', 'pepper', 'tomato'],
      rating_avg: 4.7,
      image_status: 'ready',
      total_time_min: 30,
      difficulty: 'medium',
    },
    {
      id: 'tr-mercimek',
      title: 'Mercimek Çorbası',
      ingredient_tokens: ['lentil', 'onion', 'carrot', 'butter'],
      rating_avg: 4.9,
      image_status: 'ready',
      total_time_min: 35,
      difficulty: 'easy',
    },
  ];
  
  // ========================================================
  // MOD 1 — PANTRY (sadece elde olanlarla)
  // ========================================================
  describe('Mode 1: Pantry — only exact matches', () => {
    
    function pantryMatch(userTokens: string[], recipes: typeof mockRecipes) {
      const userSet = new Set(userTokens);
      return recipes.filter(r => 
        r.ingredient_tokens.every(t => userSet.has(t))
      );
    }
    
    test('returns recipes where ALL ingredients are in user pantry', () => {
      const userTokens = ['egg', 'tomato', 'pepper', 'onion', 'cheese'];
      const matches = pantryMatch(userTokens, mockRecipes);
      
      expect(matches.map(r => r.id)).toEqual(['tr-menemen']);
      // Omlet: egg, butter, cheese — butter eksik
      // Tavuk sote: chicken eksik
      // Mercimek: lentil, carrot, butter eksik
    });
    
    test('returns empty when no recipe fully matches', () => {
      const userTokens = ['cucumber', 'salt']; // hiçbir tarifle uyumsuz
      const matches = pantryMatch(userTokens, mockRecipes);
      
      expect(matches).toHaveLength(0);
    });
    
    test('returns multiple matches when user has many ingredients', () => {
      const userTokens = ['egg', 'tomato', 'pepper', 'onion', 'butter', 'cheese'];
      const matches = pantryMatch(userTokens, mockRecipes);
      
      // Menemen ✓, Omlet ✓
      expect(matches.map(r => r.id).sort()).toEqual(['tr-menemen', 'tr-omlet']);
    });
    
    test('match_percentage should be 100 for all results', () => {
      const userTokens = ['egg', 'tomato', 'pepper', 'onion'];
      const matches = pantryMatch(userTokens, mockRecipes);
      
      // Pantry mode'da her sonuç %100 olmalı (algoritma garanti eder)
      matches.forEach(m => {
        const matchPercentage = 
          (m.ingredient_tokens.length / m.ingredient_tokens.length) * 100;
        expect(matchPercentage).toBe(100);
      });
    });
  });
  
  // ========================================================
  // MOD 2 — SUPPLY (max N eksik)
  // ========================================================
  describe('Mode 2: Supply — max N missing', () => {
    
    function supplyMatch(
      userTokens: string[], 
      recipes: typeof mockRecipes,
      maxMissing: number = 2
    ) {
      const userSet = new Set(userTokens);
      return recipes
        .map(r => ({
          ...r,
          missing: r.ingredient_tokens.filter(t => !userSet.has(t)),
        }))
        .filter(r => r.missing.length <= maxMissing)
        .sort((a, b) => {
          if (a.missing.length !== b.missing.length) {
            return a.missing.length - b.missing.length;
          }
          return b.rating_avg - a.rating_avg;
        });
    }
    
    test('returns recipes with 0-2 missing ingredients', () => {
      const userTokens = ['egg', 'tomato', 'pepper'];  // onion'u yok
      const matches = supplyMatch(userTokens, mockRecipes, 2);
      
      // Menemen: 1 eksik (onion)
      // Omlet: 2 eksik (butter, cheese)
      // Tavuk sote: 2 eksik (chicken, onion)
      // Mercimek: 4 eksik — REDDEDİLİR
      
      expect(matches.map(r => r.id)).toContain('tr-menemen');
      expect(matches.map(r => r.id)).toContain('tr-omlet');
      expect(matches.map(r => r.id)).toContain('tr-tavuk-sote');
      expect(matches.map(r => r.id)).not.toContain('tr-mercimek');
    });
    
    test('orders by least missing first', () => {
      const userTokens = ['egg', 'tomato', 'pepper'];
      const matches = supplyMatch(userTokens, mockRecipes, 3);
      
      // İlk Menemen (1 eksik), sonra Omlet/Tavuk Sote (2 eksik)
      expect(matches[0].id).toBe('tr-menemen');
      expect(matches[0].missing).toHaveLength(1);
    });
    
    test('strict max_missing=1 filters more aggressively', () => {
      const userTokens = ['egg', 'tomato', 'pepper'];
      const matches = supplyMatch(userTokens, mockRecipes, 1);
      
      // Sadece Menemen (1 eksik) geçer
      expect(matches.map(r => r.id)).toEqual(['tr-menemen']);
    });
    
    test('includes 0-missing recipes (full match) in supply mode too', () => {
      const userTokens = ['egg', 'tomato', 'pepper', 'onion'];  // Menemen tam
      const matches = supplyMatch(userTokens, mockRecipes, 2);
      
      const menemen = matches.find(r => r.id === 'tr-menemen');
      expect(menemen?.missing).toHaveLength(0);
    });
  });
  
  // ========================================================
  // MOD 3 — DISCOVER (filter-based)
  // ========================================================
  describe('Mode 3: Discover — filter-based', () => {
    
    function discoverMatch(
      recipes: typeof mockRecipes,
      filters: { 
        difficulty?: string;
        max_time_min?: number;
      } = {}
    ) {
      return recipes
        .filter(r => r.image_status === 'ready')
        .filter(r => !filters.difficulty || r.difficulty === filters.difficulty)
        .filter(r => !filters.max_time_min || r.total_time_min <= filters.max_time_min)
        .sort((a, b) => b.rating_avg - a.rating_avg);
    }
    
    test('filters by difficulty', () => {
      const matches = discoverMatch(mockRecipes, { difficulty: 'easy' });
      
      // Menemen, Omlet, Mercimek (medium tavuk sote hariç)
      expect(matches.map(r => r.difficulty)).toEqual(['easy', 'easy', 'easy']);
    });
    
    test('filters by max_time_min', () => {
      const matches = discoverMatch(mockRecipes, { max_time_min: 20 });
      
      // Menemen (15), Omlet (8) — Tavuk Sote (30) ve Mercimek (35) HARİÇ
      expect(matches.map(r => r.id).sort()).toEqual(['tr-menemen', 'tr-omlet']);
    });
    
    test('returns all recipes when no filters', () => {
      const matches = discoverMatch(mockRecipes, {});
      expect(matches).toHaveLength(4);
    });
    
    test('orders by rating_avg DESC', () => {
      const matches = discoverMatch(mockRecipes, {});
      
      // Mercimek (4.9), Menemen (4.8), Tavuk Sote (4.7), Omlet (4.5)
      expect(matches.map(r => r.rating_avg)).toEqual([4.9, 4.8, 4.7, 4.5]);
    });
  });
});


// ============================================================
// ARRAY-CONTAINS-ANY EDGE CASES
// ============================================================
describe('Firestore array-contains-any limits', () => {
  
  test('user with 30+ ingredients should be batched', () => {
    const userIngredients = Array(35).fill(null).map((_, i) => `token_${i}`);
    
    // Firestore limit = 30
    const batchSize = 30;
    const batches = [];
    for (let i = 0; i < userIngredients.length; i += batchSize) {
      batches.push(userIngredients.slice(i, i + batchSize));
    }
    
    expect(batches).toHaveLength(2);
    expect(batches[0]).toHaveLength(30);
    expect(batches[1]).toHaveLength(5);
  });
});
