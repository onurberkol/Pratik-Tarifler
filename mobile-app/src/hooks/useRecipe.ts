import { useQuery } from "@tanstack/react-query";
import { getRecipe } from "@/api/recipes";
import type { Recipe } from "@/types";

export function useRecipe(id: string | undefined) {
  return useQuery<Recipe | null, Error>({
    queryKey: ["recipe", id],
    queryFn: () => (id ? getRecipe(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}
