/**
 * Pratik Tarifler — TypeScript Types
 * =====================================
 * Tüm app boyunca kullanılan veri tipleri.
 * Firestore şeması ile birebir eşleşir.
 */

// ============================================================
// RECIPE
// ============================================================
export interface Recipe {
  id: string;                          // "tr-mercimek-corbasi"
  schema_version: number;
  language: SupportedLanguage;
  
  // İçerik
  title: string;
  description: string;
  
  // Malzemeler
  ingredient_tokens: IngredientToken[];
  primary_ingredients: IngredientToken[];
  ingredients: Ingredient[];
  
  // Adımlar
  steps: Step[];
  tips: string[];
  
  // Metadata
  total_time_min: number;
  active_time_min: number;
  servings: number;
  difficulty: Difficulty;
  cuisine: Cuisine;
  diet_tags: DietTag[];
  meal_type: MealType[];
  is_premium: boolean;
  
  // Sosyal
  rating_avg: number;
  rating_count: number;
  favorite_count: number;
  view_count: number;
  
  // Görsel
  image: RecipeImage;
  image_status: ImageStatus;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at: string | null;
  
  // Arama
  search_keywords: string[];
}

export interface Ingredient {
  token: IngredientToken;
  amount: string;       // "1 su bardağı"
  note: string;         // "kırmızı mercimek"
}

export interface Step {
  order: number;
  title: string;        // "Soğan kavur"
  body: string;         // Tam talimat
  timer_sec: number | null;
}

export interface RecipeImage {
  url_full: string | null;
  url_thumb: string | null;
  blur_hash: string | null;
  width: number | null;
  height: number | null;
  source: ImageSource | null;
  source_id: string | null;
  photographer: string | null;
  photographer_url: string | null;
  license: string | null;
  status: ImageStatus;
  created_at: string | null;
}

// ============================================================
// ENUMS / UNION TYPES
// ============================================================
export type SupportedLanguage = 
  | "tr" | "en" | "de" | "fr" | "it" | "es" 
  | "pt" | "el" | "nl" | "ru" | "sr" | "ar" | "he";

export type Difficulty = "easy" | "medium" | "hard";

export type Cuisine = 
  | "turkish" | "italian" | "mediterranean" | "middle_eastern"
  | "french" | "american" | "mexican" | "indian" | "spanish"
  | "japanese" | "chinese" | "thai" | "russian" | "other";

export type DietTag = "vegetarian" | "vegan" | "gluten_free" | "halal" | "kosher";

export type MealType = 
  | "breakfast" | "lunch" | "dinner" 
  | "snack" | "appetizer" | "soup" | "dessert";

export type ImageSource = 
  | "unsplash" | "pexels" | "pixabay" 
  | "dalle" | "flux" | "manual";

export type ImageStatus = 
  | "pending" | "searching" | "generating" 
  | "review" | "ready" | "failed";

// Ingredient token — sınırlı set (Firebase'de array-contains query için)
export type IngredientToken = 
  // Hayvansal
  | "egg" | "milk" | "cheese" | "butter" | "yogurt"
  | "chicken" | "lamb" | "beef" | "ground_meat" 
  | "smoked_meat" | "fish"
  // Sebze
  | "tomato" | "onion" | "garlic" | "potato" | "carrot"
  | "pepper" | "eggplant" | "zucchini" | "mushroom" 
  | "spinach" | "leek" | "beet" | "cabbage" 
  | "cauliflower" | "broccoli" | "okra" | "pumpkin"
  | "vegetable" | "fruit"
  // Tahıl/Baklagil
  | "rice" | "bulgur" | "pasta" | "flour" | "bread"
  | "phyllo" | "lentil" | "chickpea" | "white_bean"
  | "green_bean" | "green_pea" | "fava_bean"
  // Diğer
  | "olive_oil" | "olive" | "honey" | "almond" 
  | "walnut" | "tahini" | "paneer"
  // Otlar
  | "parsley" | "dill" | "basil" | "thyme" | "lemon"
  // Genel
  | "spice" | "grape_leaf";

// ============================================================
// USER
// ============================================================
export interface User {
  uid: string;
  email: string | null;
  display_name: string;
  photo_url: string | null;
  
  language: SupportedLanguage;
  preferences: UserPreferences;
  subscription: Subscription;
  stats: UserStats;
  
  created_at: string;
  last_active_at: string;
  app_version: string;
  platform: "ios" | "android" | "web";
}

export interface UserPreferences {
  dietary: DietTag[];
  allergies: string[];
  favorite_cuisines: Cuisine[];
  cooking_skill: "beginner" | "intermediate" | "advanced";
  serving_default: number;
}

export interface Subscription {
  tier: "free" | "premium" | "pro";
  status: "active" | "expired" | "cancelled";
  started_at: string | null;
  expires_at: string | null;
  provider: "ios" | "android" | "stripe" | null;
}

export interface UserStats {
  recipes_viewed: number;
  recipes_cooked: number;
  favorites_count: number;
  streak_days: number;
}

// ============================================================
// PANTRY
// ============================================================
export interface PantryItem {
  token: IngredientToken;
  display_name: string;
  quantity: string | null;
  expires_at: string | null;
  source: "manual" | "photo_scan" | "shopping_list";
  added_at: string;
}

// ============================================================
// 3-MODE UX TYPES (KRİTİK)
// ============================================================

export type RecommendationMode = "pantry" | "supply" | "discover";

/**
 * Tarif öneri API isteği — 3 modu da kapsar
 */
export interface RecommendationRequest {
  mode: RecommendationMode;
  lang: SupportedLanguage;
  
  // Mod 1 & 2 için:
  ingredients?: IngredientToken[];
  
  // Mod 2 için:
  max_missing?: number;  // default 2
  
  // Mod 3 için:
  filters?: SearchFilters;
  
  // Pagination
  limit?: number;
  cursor?: string;
}

/**
 * Tarif öneri API cevabı
 */
export interface RecommendationResponse {
  mode: RecommendationMode;
  total_matches: number;
  recipes: RecipeWithMatch[];
  next_cursor: string | null;
}

/**
 * Mod'a göre ekstra alanlarla genişletilmiş tarif
 */
export interface RecipeWithMatch extends Recipe {
  // Mod 1 (Pantry) özel:
  match_percentage?: number;        // 100 = tüm malzemeler elde
  uses_ingredients?: IngredientToken[];
  
  // Mod 2 (Supply) özel:
  missing_ingredients?: MissingIngredient[];
  missing_count?: number;
  
  // Mod 3 (Discover) için ek bilgi yok
}

export interface MissingIngredient {
  token: IngredientToken;
  label_tr: string;                 // "Tavuk göğüs"
  label_localized: string;          // app dilinde
  estimated_price_try?: number;     // opsiyonel fiyat tahmini
}

export interface SearchFilters {
  cuisine?: Cuisine;
  meal_type?: MealType;
  diet_tags?: DietTag[];
  max_time_min?: number;
  difficulty?: Difficulty;
  is_premium?: boolean;
  search_query?: string;
}

// ============================================================
// PANTRY SCAN (Mod 1 fotoğraf)
// ============================================================

export interface PantryScanRequest {
  photo_path: string;               // "temp/pantry_scans/{uid}/{timestamp}.jpg"
  scan_id?: string;
}

export interface PantryScanResponse {
  scan_id: string;
  detected_ingredients: DetectedIngredient[];
  raw_objects: any[];
  scan_count_today: number;
  remaining_today: number;          // -1 = unlimited (premium)
}

export interface DetectedIngredient {
  token: IngredientToken;
  confidence: number;               // 0-1
  label_tr: string;
  label_localized: string;
  bounding_box?: {                  // gelecekte UI overlay için
    x: number; y: number;
    width: number; height: number;
  };
}

// ============================================================
// API ERROR
// ============================================================
export type ApiError = 
  | { code: "RATE_LIMIT"; message: string; reset_at?: string }
  | { code: "PREMIUM_REQUIRED"; message: string }
  | { code: "INVALID_REQUEST"; message: string }
  | { code: "NOT_FOUND"; message: string }
  | { code: "SERVER_ERROR"; message: string };

// ============================================================
// APP CONFIG (remote config)
// ============================================================
export interface AppConfig {
  min_app_version: { ios: string; android: string };
  force_update: boolean;
  maintenance_mode: boolean;
  
  features: {
    mod_1_camera_scan: boolean;
    mod_1_manual_list: boolean;
    mod_2_supply_mode: boolean;
    mod_3_unlimited: boolean;
    ai_recipe_suggestions: boolean;
  };
  
  limits: {
    free_daily_recipes: number;
    free_favorites: number;
    free_pantry_scans_daily: number;
    premium_daily_recipes: number;
    premium_favorites: number;
    premium_pantry_scans_daily: number;
  };
  
  supported_languages: SupportedLanguage[];
  default_language: SupportedLanguage;
}

// ============================================================
// HELPERS — Mod-specific cards için
// ============================================================

export interface PantryCardData {
  recipe: Recipe;
  match_percentage: 100;            // her zaman 100 (Mod 1)
  uses_ingredients: IngredientToken[];
}

export interface SupplyCardData {
  recipe: Recipe;
  missing_ingredients: MissingIngredient[];
  missing_count: number;
  match_score: number;              // ne kadar uygun (rating + missing)
}

export interface DiscoverCardData {
  recipe: Recipe;
  is_premium_locked?: boolean;      // premium tarif, ücretsiz kullanıcı
}
