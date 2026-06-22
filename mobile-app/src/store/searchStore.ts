import { create } from "zustand";
import type { MatchResult, DietTag } from "@/types";

interface SearchFilters {
  diet: DietTag[];
  maxTimeMin: number | null;
  cuisine: string | null;
}

interface SearchState {
  ingredients: string[];
  results: MatchResult[];
  isLoading: boolean;
  filters: SearchFilters;

  addIngredient: (token: string) => void;
  removeIngredient: (token: string) => void;
  clearIngredients: () => void;
  setResults: (r: MatchResult[]) => void;
  setLoading: (l: boolean) => void;
  setFilters: (f: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  clear: () => void;
}

const initialFilters: SearchFilters = {
  diet: [],
  maxTimeMin: null,
  cuisine: null,
};

export const useSearchStore = create<SearchState>((set) => ({
  ingredients: [],
  results: [],
  isLoading: false,
  filters: initialFilters,

  addIngredient: (token) =>
    set((s) => ({
      ingredients: s.ingredients.includes(token)
        ? s.ingredients
        : [...s.ingredients, token],
    })),
  removeIngredient: (token) =>
    set((s) => ({ ingredients: s.ingredients.filter((t) => t !== token) })),
  clearIngredients: () => set({ ingredients: [] }),
  setResults: (r) => set({ results: r }),
  setLoading: (l) => set({ isLoading: l }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: initialFilters }),
  clear: () =>
    set({ ingredients: [], results: [], filters: initialFilters }),
}));
