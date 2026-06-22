import { scoreRecipe, rankRecipes } from "../src/lib/matcher";
import type { Recipe } from "../src/types";

const baseRecipe: Recipe = {
  id: "test-recipe",
  ingredient_tokens: ["tomato", "onion", "egg", "salt"],
  primary_ingredients: ["tomato", "egg"],
  total_time_min: 15,
  active_time_min: 10,
  servings: 2,
  difficulty: "easy",
  cuisine: "turkish",
  diet_tags: ["vegetarian"],
  meal_type: ["breakfast"],
  hero_image_url: "test.jpg",
  is_premium: false,
  rating_avg: 4.5,
  rating_count: 100,
  schema_version: 1,
  i18n: {
    en: {
      title: "Test",
      description: "test",
      ingredients: [],
      steps: [],
      tips: [],
    },
  },
};

describe("scoreRecipe", () => {
  it("returns 0% for no overlap", () => {
    const result = scoreRecipe({ userTokens: ["pasta"], recipe: baseRecipe });
    expect(result.matchPct).toBe(0);
    expect(result.haveCount).toBe(0);
    expect(result.missingTokens).toEqual(["tomato", "onion", "egg", "salt"]);
  });

  it("weights staples at 0.5", () => {
    // Recipe needs 3 normals (weight 1 each = 3) + 1 staple (weight 0.5) = total 3.5
    // User has just salt (the staple, weight 0.5). pct = 0.5/3.5 = ~14%
    const result = scoreRecipe({ userTokens: ["salt"], recipe: baseRecipe });
    expect(result.matchPct).toBeLessThan(20);
    expect(result.haveCount).toBe(1);
  });

  it("applies primary bonus", () => {
    // User has just tomato (primary). Weight: 1 of 3.5 = 28.6%. Plus 15% bonus = 43.6% → rounds to 44%.
    const result = scoreRecipe({ userTokens: ["tomato"], recipe: baseRecipe });
    expect(result.primaryHit).toBe(true);
    expect(result.matchPct).toBeGreaterThanOrEqual(40);
    expect(result.matchPct).toBeLessThanOrEqual(50);
  });

  it("caps at 100", () => {
    const result = scoreRecipe({
      userTokens: ["tomato", "onion", "egg", "salt"],
      recipe: baseRecipe,
    });
    expect(result.matchPct).toBe(100);
    expect(result.missingTokens).toEqual([]);
  });

  it("normalizes case and whitespace", () => {
    const result = scoreRecipe({
      userTokens: [" TOMATO ", "Onion"],
      recipe: baseRecipe,
    });
    expect(result.haveCount).toBe(2);
  });
});

describe("rankRecipes", () => {
  const r1 = { ...baseRecipe, id: "r1", rating_avg: 4.0, total_time_min: 30 };
  const r2 = { ...baseRecipe, id: "r2", rating_avg: 4.9, total_time_min: 60 };
  const r3 = {
    ...baseRecipe,
    id: "r3",
    is_premium: true,
    rating_avg: 5.0,
  };

  it("excludes premium for free users", () => {
    const out = rankRecipes(
      ["tomato", "onion", "egg", "salt"],
      [r1, r2, r3],
      { premiumActive: false }
    );
    expect(out.find((m) => m.recipe.id === "r3")).toBeUndefined();
  });

  it("includes premium for premium users", () => {
    const out = rankRecipes(
      ["tomato", "onion", "egg", "salt"],
      [r1, r2, r3],
      { premiumActive: true }
    );
    expect(out.find((m) => m.recipe.id === "r3")).toBeDefined();
  });

  it("sorts by match desc, then rating desc, then time asc", () => {
    const out = rankRecipes(
      ["tomato", "onion", "egg", "salt"],
      [r1, r2],
      { premiumActive: false }
    );
    // Both 100% match. r2 has higher rating → first.
    expect(out[0]?.recipe.id).toBe("r2");
    expect(out[1]?.recipe.id).toBe("r1");
  });

  it("filters by maxTimeMin", () => {
    const out = rankRecipes(["tomato", "onion", "egg", "salt"], [r1, r2], {
      maxTimeMin: 45,
    });
    expect(out.find((m) => m.recipe.id === "r2")).toBeUndefined();
  });
});
