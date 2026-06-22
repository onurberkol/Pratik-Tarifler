/**
 * Custom Hooks — Tüm app boyunca tekrar kullanılan logic
 * ========================================================
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import {
  auth,
  getRecipe,
  getRecipeRecommendations,
  getRecipeOfTheDay,
  searchRecipes,
  getUserPantry,
  updatePantryItem,
  removePantryItem,
  analyzePantryPhoto,
  uploadPantryPhoto,
  getFavorites,
  addFavorite,
  removeFavorite,
  getUser,
} from '../api/client';

import type {
  Recipe,
  RecipeWithMatch,
  User,
  PantryItem,
  IngredientToken,
  RecommendationMode,
  PantryScanResponse,
  RecommendationMode as Mode,
  SearchFilters,
  SupportedLanguage,
} from '../types';


// ============================================================
// useAuth
// ============================================================
export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userData = await getUser(fbUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);
  
  return { firebaseUser, user, loading };
}


// ============================================================
// useRecipe — Tek tarif fetch
// ============================================================
export function useRecipe(recipeId: string | null, lang: SupportedLanguage = 'tr') {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!recipeId) {
      setRecipe(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    getRecipe(recipeId, lang)
      .then(r => setRecipe(r))
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, [recipeId, lang]);
  
  return { recipe, loading, error };
}


// ============================================================
// useRecipeRecommendations — Mod 1/2/3 unified hook
// ============================================================
interface UseRecommendationsOptions {
  mode: Mode;
  ingredients?: IngredientToken[];
  maxMissing?: number;
  filters?: SearchFilters;
  sort?: string;
  lang?: SupportedLanguage;
}

export function useRecipeRecommendations(opts: UseRecommendationsOptions) {
  const [recipes, setRecipes] = useState<RecipeWithMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cursorRef = useRef<string | null>(null);
  
  const fetchPage = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const response = await getRecipeRecommendations({
        mode: opts.mode,
        lang: opts.lang || 'tr',
        ingredients: opts.ingredients,
        max_missing: opts.maxMissing,
        filters: opts.filters,
        limit: 20,
        cursor: isRefresh ? undefined : cursorRef.current || undefined,
      });
      
      if (isRefresh) {
        setRecipes(response.recipes);
      } else {
        setRecipes(prev => [...prev, ...response.recipes]);
      }
      
      cursorRef.current = response.next_cursor;
      setHasMore(!!response.next_cursor);
      setError(null);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [opts.mode, opts.ingredients?.join(','), opts.maxMissing, JSON.stringify(opts.filters), opts.sort]);
  
  // İlk yükleme + dependency değişimi
  useEffect(() => {
    cursorRef.current = null;
    setRecipes([]);
    fetchPage(true);
  }, [fetchPage]);
  
  return {
    recipes,
    loading,
    refreshing,
    hasMore,
    error,
    refresh: () => fetchPage(true),
    loadMore: () => !loading && hasMore && fetchPage(false),
  };
}


// ============================================================
// useRecipeOfTheDay
// ============================================================
export function useRecipeOfTheDay(lang: SupportedLanguage = 'tr') {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getRecipeOfTheDay(lang)
      .then(r => setRecipe(r))
      .finally(() => setLoading(false));
  }, [lang]);
  
  return { recipe, loading };
}


// ============================================================
// useDiscoverFeed — Yatay scroll feed'ler için
// ============================================================
export function useDiscoverFeed(opts: {
  cuisine?: string;
  mealType?: string;
  dietTag?: string;
  maxTime?: number;
  sort?: string;
  limit?: number;
}) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    searchRecipes({
      cuisine: opts.cuisine,
      meal_type: opts.mealType,
      diet_tags: opts.dietTag ? [opts.dietTag] : undefined,
      max_time_min: opts.maxTime,
    }, 'tr', undefined, opts.limit || 10)
      .then(({ recipes: r }) => setRecipes(r))
      .finally(() => setLoading(false));
  }, [opts.cuisine, opts.mealType, opts.dietTag, opts.maxTime, opts.sort]);
  
  return { recipes, loading };
}


// ============================================================
// useUserPantry — Mod 1 buzdolabı yönetimi
// ============================================================
export function useUserPantry() {
  const { firebaseUser } = useAuth();
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    if (!firebaseUser) {
      setPantry([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const items = await getUserPantry(firebaseUser.uid);
    setPantry(items);
    setLoading(false);
  }, [firebaseUser]);
  
  useEffect(() => {
    refresh();
  }, [refresh]);
  
  const addItem = useCallback(async (item: PantryItem) => {
    if (!firebaseUser) return;
    await updatePantryItem(firebaseUser.uid, item);
    setPantry(prev => {
      const next = prev.filter(p => p.token !== item.token);
      return [...next, item];
    });
  }, [firebaseUser]);
  
  const removeItem = useCallback(async (token: string) => {
    if (!firebaseUser) return;
    await removePantryItem(firebaseUser.uid, token);
    setPantry(prev => prev.filter(p => p.token !== token));
  }, [firebaseUser]);
  
  return { pantry, loading, refresh, addItem, removeItem };
}


// ============================================================
// useFavorites
// ============================================================
export function useFavorites() {
  const { firebaseUser } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!firebaseUser) {
      setFavorites(new Set());
      setLoading(false);
      return;
    }
    
    getFavorites(firebaseUser.uid)
      .then(ids => setFavorites(new Set(ids)))
      .finally(() => setLoading(false));
  }, [firebaseUser]);
  
  const toggleFavorite = useCallback(async (recipeId: string, recipe?: Recipe) => {
    if (!firebaseUser) return;
    
    const isFav = favorites.has(recipeId);
    
    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(recipeId);
      else next.add(recipeId);
      return next;
    });
    
    try {
      if (isFav) {
        await removeFavorite(firebaseUser.uid, recipeId);
      } else if (recipe) {
        await addFavorite(
          firebaseUser.uid, 
          recipeId, 
          recipe.title, 
          recipe.image?.url_thumb || ''
        );
      }
    } catch (e) {
      // Revert on error
      setFavorites(prev => {
        const next = new Set(prev);
        if (isFav) next.add(recipeId);
        else next.delete(recipeId);
        return next;
      });
    }
  }, [firebaseUser, favorites]);
  
  return { favorites, loading, toggleFavorite };
}


// ============================================================
// usePantryScan — Mod 1 fotoğraf analizi
// ============================================================
export function usePantryScan() {
  const { firebaseUser } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<PantryScanResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const scan = useCallback(async (photoUri: string) => {
    if (!firebaseUser) {
      setError(new Error('Not signed in'));
      return null;
    }
    
    try {
      setScanning(true);
      setError(null);
      
      // 1. Storage'a yükle
      const photoPath = await uploadPantryPhoto(photoUri, firebaseUser.uid);
      
      // 2. Vision API çağrı
      const response = await analyzePantryPhoto({ photo_path: photoPath });
      setResult(response);
      return response;
    } catch (e: any) {
      setError(e);
      return null;
    } finally {
      setScanning(false);
    }
  }, [firebaseUser]);
  
  return { scan, scanning, result, error };
}


// ============================================================
// useDailyScanLimit — Mod 1 quota tracking
// ============================================================
export function useDailyScanLimit() {
  const { user } = useAuth();
  const [scansToday, setScansToday] = useState(0);
  
  const isPremium = user?.subscription?.tier !== 'free';
  const dailyLimit = isPremium ? Infinity : 3;
  
  useEffect(() => {
    // AsyncStorage'dan bugünkü scan sayısını oku
    const today = new Date().toISOString().split('T')[0];
    AsyncStorage.getItem(`scan_count_${today}`).then(val => {
      setScansToday(val ? parseInt(val, 10) : 0);
    });
  }, []);
  
  const incrementScan = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const newCount = scansToday + 1;
    setScansToday(newCount);
    await AsyncStorage.setItem(`scan_count_${today}`, String(newCount));
  }, [scansToday]);
  
  return { scansToday, dailyLimit, isPremium, incrementScan };
}


// ============================================================
// useLastUsedMode — Son seçilen modu hatırla
// ============================================================
export function useLastUsedMode() {
  const [lastMode, setLastMode] = useState<RecommendationMode | null>(null);
  
  useEffect(() => {
    AsyncStorage.getItem('last_mode').then(val => {
      if (val) setLastMode(val as RecommendationMode);
    });
  }, []);
  
  const setMode = useCallback(async (mode: RecommendationMode) => {
    setLastMode(mode);
    await AsyncStorage.setItem('last_mode', mode);
  }, []);
  
  return { lastMode, setMode };
}


// ============================================================
// useDebounce
// ============================================================
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}
