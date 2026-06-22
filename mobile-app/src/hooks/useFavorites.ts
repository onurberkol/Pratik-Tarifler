import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addFavorite,
  removeFavorite,
  watchFavorites,
} from "@/api/favorites";
import { useUserStore } from "@/store/userStore";
import type { Favorite } from "@/types";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const authUser = useUserStore((s) => s.authUser);

  useEffect(() => {
    if (!authUser) {
      setFavorites([]);
      return;
    }
    const unsub = watchFavorites(setFavorites);
    return unsub;
  }, [authUser?.uid]);

  return favorites;
}

export function useIsFavorited(recipeId: string): boolean {
  const favs = useFavorites();
  return favs.some((f) => f.recipe_id === recipeId);
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  const isPremium = useUserStore((s) => s.premium.active);

  const add = useMutation({
    mutationFn: (recipeId: string) =>
      addFavorite(recipeId, { isPremium }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const remove = useMutation({
    mutationFn: (recipeId: string) => removeFavorite(recipeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return {
    add: add.mutateAsync,
    remove: remove.mutateAsync,
    isLoading: add.isPending || remove.isPending,
  };
}
