// Recipe types

export type Difficulty = "easy" | "medium" | "hard";
export type DietTag =
  | "vegan"
  | "vegetarian"
  | "gluten_free"
  | "low_carb"
  | "keto"
  | "paleo"
  | "dairy_free";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";
export type Cuisine =
  | "turkish"
  | "italian"
  | "mexican"
  | "japanese"
  | "indian"
  | "french"
  | "chinese"
  | "mediterranean"
  | "american"
  | "middle_eastern"
  | "other";

export type LangCode =
  | "tr"
  | "en"
  | "de"
  | "fr"
  | "it"
  | "es"
  | "pt"
  | "el"
  | "nl"
  | "ru"
  | "sr"
  | "ar"
  | "he";

export interface RecipeIngredient {
  token: string;
  amount: string;
  note?: string;
}

export interface RecipeStep {
  order: number;
  title: string;
  body: string;
  timer_sec?: number;
}

export interface RecipeLocalized {
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tips: string[];
}

export interface Recipe {
  id: string;
  ingredient_tokens: string[];
  primary_ingredients: string[];
  total_time_min: number;
  active_time_min: number;
  servings: number;
  difficulty: Difficulty;
  cuisine: Cuisine;
  diet_tags: DietTag[];
  meal_type: MealType[];
  hero_image_url: string;
  is_premium: boolean;
  rating_avg: number;
  rating_count: number;
  created_at?: unknown;
  updated_at?: unknown;
  i18n: Partial<Record<LangCode, RecipeLocalized>>;
  schema_version: number;
}

export interface Ingredient {
  token: string;
  category: "produce" | "meat" | "dairy" | "pantry" | "spice" | "other";
  aliases: Partial<Record<LangCode, string[]>>;
  display: Partial<Record<LangCode, string>>;
  emoji: string;
  is_common: boolean;
}

// User types

export interface PremiumStatus {
  active: boolean;
  plan?: "monthly" | "yearly" | "trial";
  started_at?: unknown;
  expires_at?: unknown;
  platform?: "ios" | "android" | "web";
  receipt_id?: string;
}

export interface UserPreferences {
  dietary_filters: DietTag[];
  notifications: {
    daily_recipe: boolean;
    timer_alerts: boolean;
  };
  metric_system: boolean;
}

export interface UserStats {
  recipes_cooked: number;
  favorites_count: number;
  streak_days: number;
}

export interface User {
  uid: string;
  email: string | null;
  display_name: string;
  locale: LangCode;
  created_at?: unknown;
  last_active?: unknown;
  premium: PremiumStatus;
  preferences: UserPreferences;
  stats: UserStats;
}

// Match result (from §7 algorithm)

export interface MatchResult {
  recipe: Recipe;
  matchPct: number;
  haveCount: number;
  missingTokens: string[];
  primaryHit: boolean;
}

// Favorites

export interface Favorite {
  recipe_id: string;
  added_at: unknown;
  collection?: string;
  notes?: string;
}

// Shopping list

export interface ShoppingListItem {
  token: string;
  total_amount: string;
  checked: boolean;
  from_pantry: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  recipe_ids: string[];
  items: ShoppingListItem[];
  created_at?: unknown;
  updated_at?: unknown;
}
