import type { MatchResult, Recipe } from "@/types";

interface MatchInput {
  userTokens: string[];
  recipe: Recipe;
}

const PRIMARY_BONUS = 15;
const STAPLE_PENALTY = 0.5;
const STAPLES = new Set([
  "salt",
  "pepper",
  "oil",
  "olive_oil",
  "water",
  "sugar",
  "butter",
  "flour",
]);

/**
 * Score a single recipe against user-provided ingredient tokens.
 * Returns match percentage 0-100, list of missing tokens, and bonus flags.
 *
 * Algorithm (see Technical Documentation §7):
 *   1. Sum weights of recipe ingredients (staples count for 0.5)
 *   2. Sum weights of those the user has
 *   3. Base pct = have / total * 100
 *   4. Apply +15% bonus if user has at least one primary ingredient
 *   5. Cap at 100
 */
export function scoreRecipe({ userTokens, recipe }: MatchInput): MatchResult {
  const userSet = new Set(userTokens.map((t) => t.toLowerCase().trim()));
  const recipeTokens = recipe.ingredient_tokens;

  let haveWeight = 0;
  let totalWeight = 0;
  const missing: string[] = [];

  for (const token of recipeTokens) {
    const weight = STAPLES.has(token) ? STAPLE_PENALTY : 1;
    totalWeight += weight;
    if (userSet.has(token)) {
      haveWeight += weight;
    } else {
      missing.push(token);
    }
  }

  let pct = totalWeight > 0 ? (haveWeight / totalWeight) * 100 : 0;

  const primaryHit = recipe.primary_ingredients.some((t) => userSet.has(t));
  if (primaryHit) {
    pct = Math.min(100, pct + PRIMARY_BONUS);
  }

  return {
    recipe,
    matchPct: Math.round(pct),
    haveCount: recipeTokens.length - missing.length,
    missingTokens: missing,
    primaryHit,
  };
}

/**
 * Score & rank a candidate recipe set, applying filters.
 * Returns top N (default 20) sorted by match desc, rating desc, time asc.
 */
export function rankRecipes(
  userTokens: string[],
  candidates: Recipe[],
  options: {
    limit?: number;
    minMatchPct?: number;
    maxTimeMin?: number | null;
    dietTags?: string[];
    premiumActive?: boolean;
  } = {}
): MatchResult[] {
  const {
    limit = 20,
    minMatchPct = 0,
    maxTimeMin = null,
    dietTags = [],
    premiumActive = false,
  } = options;

  return candidates
    .filter((r) => {
      if (!premiumActive && r.is_premium) return false;
      if (maxTimeMin != null && r.total_time_min > maxTimeMin) return false;
      if (dietTags.length > 0) {
        const hasAll = dietTags.every((t) => r.diet_tags.includes(t as never));
        if (!hasAll) return false;
      }
      return true;
    })
    .map((recipe) => scoreRecipe({ userTokens, recipe }))
    .filter((m) => m.matchPct >= minMatchPct)
    .sort((a, b) => {
      if (b.matchPct !== a.matchPct) return b.matchPct - a.matchPct;
      if (b.recipe.rating_avg !== a.recipe.rating_avg) {
        return b.recipe.rating_avg - a.recipe.rating_avg;
      }
      return a.recipe.total_time_min - b.recipe.total_time_min;
    })
    .slice(0, limit);
}

/**
 * Normalize a free-text ingredient input to a canonical token.
 * Uses the supplied alias map (loaded from Firestore ingredients collection).
 */
export function normalizeIngredient(
  input: string,
  aliasMap: Map<string, string>
): string | null {
  const cleaned = input.toLowerCase().trim();
  if (!cleaned) return null;
  return aliasMap.get(cleaned) ?? null;
}
