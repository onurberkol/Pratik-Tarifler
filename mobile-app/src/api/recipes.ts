import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit as fbLimit,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Recipe, Ingredient } from "@/types";

const RECIPES_COL = "recipes";
const INGREDIENTS_COL = "ingredients";

/**
 * Fetch a single recipe by ID.
 */
export async function getRecipe(id: string): Promise<Recipe | null> {
  const snap = await getDoc(doc(db, RECIPES_COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Recipe, "id">) };
}

/**
 * Search recipes by ingredient tokens.
 * Uses Firestore array-contains-any (max 10 elements per query — well within our 5-ingredient cap).
 */
export async function searchRecipes(
  tokens: string[],
  options: { limit?: number; includePremium?: boolean } = {}
): Promise<Recipe[]> {
  const { limit = 80, includePremium = true } = options;
  if (tokens.length === 0) return [];

  const constraints = [
    where("ingredient_tokens", "array-contains-any", tokens.slice(0, 10)),
    orderBy("rating_avg", "desc"),
    fbLimit(limit),
  ];
  if (!includePremium) {
    // Note: cannot combine array-contains-any with another inequality on premium,
    // so we filter client-side after fetching.
  }

  const q = query(collection(db, RECIPES_COL), ...constraints);
  const snap = await getDocs(q);
  const results: Recipe[] = [];
  snap.forEach((d) => {
    const data = d.data() as Omit<Recipe, "id">;
    if (!includePremium && data.is_premium) return;
    results.push({ id: d.id, ...data });
  });
  return results;
}

/**
 * Fetch popular recipes for the home screen (category cards).
 */
export async function getPopularRecipes(
  mealType?: string,
  limit: number = 8
): Promise<Recipe[]> {
  const constraints: ReturnType<typeof where>[] = [];
  if (mealType) {
    constraints.push(where("meal_type", "array-contains", mealType));
  }
  const q = query(
    collection(db, RECIPES_COL),
    ...constraints,
    orderBy("rating_avg", "desc"),
    fbLimit(limit)
  );
  const snap = await getDocs(q);
  const results: Recipe[] = [];
  snap.forEach((d) => {
    results.push({ id: d.id, ...(d.data() as Omit<Recipe, "id">) });
  });
  return results;
}

/**
 * Load the entire global ingredient dictionary.
 * Called once on app start; cached in memory + AsyncStorage.
 */
export async function getIngredientDictionary(): Promise<Ingredient[]> {
  const snap = await getDocs(collection(db, INGREDIENTS_COL));
  const items: Ingredient[] = [];
  snap.forEach((d) => {
    items.push(d.data() as Ingredient);
  });
  return items;
}

/**
 * Build an alias → canonical token lookup map.
 */
export function buildAliasMap(
  ingredients: Ingredient[],
  langCode: string
): Map<string, string> {
  const map = new Map<string, string>();
  for (const ing of ingredients) {
    const langAliases = ing.aliases[langCode as keyof typeof ing.aliases] ?? [];
    for (const a of langAliases) {
      map.set(a.toLowerCase().trim(), ing.token);
    }
    map.set(ing.token, ing.token);
    // English aliases as fallback
    const enAliases = ing.aliases.en ?? [];
    for (const a of enAliases) {
      if (!map.has(a.toLowerCase().trim())) {
        map.set(a.toLowerCase().trim(), ing.token);
      }
    }
  }
  return map;
}
