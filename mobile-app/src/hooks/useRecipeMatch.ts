import { useQuery } from "@tanstack/react-query";
import { searchRecipes } from "@/api/recipes";
import { rankRecipes } from "@/lib/matcher";
import { useUserStore } from "@/store/userStore";
import type { DietTag, MatchResult } from "@/types";

interface UseRecipeMatchOptions {
  tokens: string[];
  dietTags?: DietTag[];
  maxTimeMin?: number | null;
  enabled?: boolean;
}

export function useRecipeMatch({
  tokens,
  dietTags = [],
  maxTimeMin = null,
  enabled = true,
}: UseRecipeMatchOptions) {
  const premiumActive = useUserStore((s) => s.premium.active);

  return useQuery<MatchResult[], Error>({
    queryKey: [
      "recipes",
      "match",
      ...[...tokens].sort(),
      ...dietTags,
      maxTimeMin,
      premiumActive,
    ],
    queryFn: async () => {
      if (tokens.length < 3) return [];
      const candidates = await searchRecipes(tokens, {
        includePremium: premiumActive,
      });
      return rankRecipes(tokens, candidates, {
        limit: 20,
        dietTags,
        maxTimeMin,
        premiumActive,
      });
    },
    staleTime: 5 * 60 * 1000,
    enabled: enabled && tokens.length >= 3,
  });
}
