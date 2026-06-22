/**
 * Ingredient Catalog
 * ====================
 * Tüm IngredientToken'lar için meta bilgi:
 *   - emoji (UI gösterimi)
 *   - kategori (sebze/meyve/protein/...)
 *   - sık kullanılan mı (top 12 ana ekrana çıkıyor)
 * 
 * IngredientListScreen ve diğer malzeme UI'ları bu listeyi kullanır.
 */

import type { IngredientToken } from '../types';

export type IngredientCategory = 
  | 'protein' 
  | 'dairy' 
  | 'vegetable' 
  | 'fruit'
  | 'grain' 
  | 'legume'
  | 'pantry' 
  | 'herb'
  | 'spice';

interface IngredientMeta {
  emoji: string;
  category: IngredientCategory;
  /** En sık kullanılanların başlangıç sıralaması (1 = en sık) */
  frequencyRank?: number;
}

export const INGREDIENT_CATALOG: Record<IngredientToken, IngredientMeta> = {
  // ==================== PROTEIN ====================
  egg:           { emoji: '🥚', category: 'protein', frequencyRank: 1 },
  chicken:       { emoji: '🐔', category: 'protein', frequencyRank: 6 },
  beef:          { emoji: '🥩', category: 'protein' },
  lamb:          { emoji: '🐑', category: 'protein' },
  ground_meat:   { emoji: '🥩', category: 'protein', frequencyRank: 10 },
  smoked_meat:   { emoji: '🥓', category: 'protein' },
  fish:          { emoji: '🐟', category: 'protein' },
  
  // ==================== DAIRY ====================
  milk:          { emoji: '🥛', category: 'dairy' },
  cheese:        { emoji: '🧀', category: 'dairy', frequencyRank: 4 },
  butter:        { emoji: '🧈', category: 'dairy' },
  yogurt:        { emoji: '🥛', category: 'dairy', frequencyRank: 9 },
  paneer:        { emoji: '🧀', category: 'dairy' },
  
  // ==================== VEGETABLE ====================
  tomato:        { emoji: '🍅', category: 'vegetable', frequencyRank: 3 },
  onion:         { emoji: '🧅', category: 'vegetable', frequencyRank: 2 },
  garlic:        { emoji: '🧄', category: 'vegetable', frequencyRank: 5 },
  potato:        { emoji: '🥔', category: 'vegetable', frequencyRank: 7 },
  carrot:        { emoji: '🥕', category: 'vegetable', frequencyRank: 11 },
  pepper:        { emoji: '🫑', category: 'vegetable', frequencyRank: 8 },
  eggplant:      { emoji: '🍆', category: 'vegetable' },
  zucchini:      { emoji: '🥒', category: 'vegetable' },
  mushroom:      { emoji: '🍄', category: 'vegetable' },
  spinach:       { emoji: '🥬', category: 'vegetable' },
  leek:          { emoji: '🥬', category: 'vegetable' },
  beet:          { emoji: '🟣', category: 'vegetable' },
  cabbage:       { emoji: '🥬', category: 'vegetable' },
  cauliflower:   { emoji: '🥦', category: 'vegetable' },
  broccoli:      { emoji: '🥦', category: 'vegetable' },
  okra:          { emoji: '🌿', category: 'vegetable' },
  pumpkin:       { emoji: '🎃', category: 'vegetable' },
  vegetable:     { emoji: '🥗', category: 'vegetable' },
  fruit:         { emoji: '🍎', category: 'fruit' },
  
  // ==================== GRAIN ====================
  rice:          { emoji: '🍚', category: 'grain', frequencyRank: 12 },
  bulgur:        { emoji: '🌾', category: 'grain' },
  pasta:         { emoji: '🍝', category: 'grain' },
  flour:         { emoji: '🌾', category: 'pantry' },
  bread:         { emoji: '🍞', category: 'grain' },
  phyllo:        { emoji: '📜', category: 'grain' },
  
  // ==================== LEGUME ====================
  lentil:        { emoji: '🫘', category: 'legume' },
  chickpea:      { emoji: '🟡', category: 'legume' },
  white_bean:    { emoji: '🫘', category: 'legume' },
  green_bean:    { emoji: '🫛', category: 'vegetable' },
  green_pea:     { emoji: '🟢', category: 'vegetable' },
  fava_bean:     { emoji: '🫘', category: 'legume' },
  
  // ==================== PANTRY ====================
  olive_oil:     { emoji: '🫒', category: 'pantry' },
  olive:         { emoji: '🫒', category: 'pantry' },
  honey:         { emoji: '🍯', category: 'pantry' },
  almond:        { emoji: '🌰', category: 'pantry' },
  walnut:        { emoji: '🌰', category: 'pantry' },
  tahini:        { emoji: '🥣', category: 'pantry' },
  spice:         { emoji: '🌶️', category: 'spice' },
  grape_leaf:    { emoji: '🍃', category: 'vegetable' },
  
  // ==================== HERB ====================
  parsley:       { emoji: '🌿', category: 'herb' },
  dill:          { emoji: '🌿', category: 'herb' },
  basil:         { emoji: '🌿', category: 'herb' },
  thyme:         { emoji: '🌿', category: 'herb' },
  lemon:         { emoji: '🍋', category: 'fruit' },
};

/**
 * Top 12 sık kullanılan malzeme (ana liste ekranındaki chip grid)
 * frequencyRank'a göre sıralı
 */
export const FREQUENT_INGREDIENTS: IngredientToken[] = Object.entries(INGREDIENT_CATALOG)
  .filter(([_, meta]) => meta.frequencyRank !== undefined)
  .sort((a, b) => (a[1].frequencyRank! - b[1].frequencyRank!))
  .slice(0, 12)
  .map(([token]) => token as IngredientToken);

/**
 * Kategoriye göre malzeme listesi (modal picker için)
 */
export function getIngredientsByCategory(category: IngredientCategory): IngredientToken[] {
  return Object.entries(INGREDIENT_CATALOG)
    .filter(([_, meta]) => meta.category === category)
    .map(([token]) => token as IngredientToken);
}

/**
 * Token'dan emoji al (default 🥗)
 */
export function getEmoji(token: IngredientToken | string): string {
  return INGREDIENT_CATALOG[token as IngredientToken]?.emoji || '🥗';
}
