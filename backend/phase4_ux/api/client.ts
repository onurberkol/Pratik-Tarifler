/**
 * API Client — Firebase Integration
 * ====================================
 * Tüm backend çağrılarının yapıldığı yer.
 * Direct Firestore + Callable Functions kombinasyonu.
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  Recipe,
  User,
  PantryItem,
  RecommendationRequest,
  RecommendationResponse,
  PantryScanRequest,
  PantryScanResponse,
  AppConfig,
  SupportedLanguage,
} from '../types';

// ============================================================
// Firebase Initialization
// ============================================================
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
  // React Native için persistence
  initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  firebaseApp = getApp();
}

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const functions = getFunctions(firebaseApp, 'us-central1');

// ============================================================
// Helpers
// ============================================================
function recipesCollection(lang: SupportedLanguage) {
  return collection(db, `recipes_${lang}`);
}

// ============================================================
// RECIPES
// ============================================================
export async function getRecipe(recipeId: string, lang: SupportedLanguage = 'tr'): Promise<Recipe | null> {
  const docRef = doc(db, `recipes_${lang}`, recipeId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Recipe;
}

export async function getRecipeRecommendations(
  req: RecommendationRequest
): Promise<RecommendationResponse> {
  const fn = httpsCallable<RecommendationRequest, RecommendationResponse>(
    functions,
    'getRecipeRecommendations'
  );
  const result = await fn(req);
  return result.data;
}

export async function getRecipeOfTheDay(lang: SupportedLanguage = 'tr'): Promise<Recipe | null> {
  // Günlük rotasyon — date hash ile deterministic
  const today = new Date().toISOString().split('T')[0];
  const recipesRef = recipesCollection(lang);
  
  const q = query(
    recipesRef,
    where('image_status', '==', 'ready'),
    where('is_premium', '==', false),
    orderBy('rating_avg', 'desc'),
    limit(50) // top 50'den birini seç
  );
  
  const snap = await getDocs(q);
  if (snap.empty) return null;
  
  // Date hash → deterministic index
  const hash = today.split('-').reduce((a, b) => a + parseInt(b), 0);
  const index = hash % snap.docs.length;
  
  const docSnap = snap.docs[index];
  return { id: docSnap.id, ...docSnap.data() } as Recipe;
}

export async function searchRecipes(
  filters: any,
  lang: SupportedLanguage = 'tr',
  cursor?: any,
  pageSize: number = 20
): Promise<{ recipes: Recipe[]; cursor: any }> {
  const recipesRef = recipesCollection(lang);
  
  let constraints: any[] = [
    where('image_status', '==', 'ready'),
    orderBy('rating_avg', 'desc'),
    limit(pageSize),
  ];
  
  if (filters.cuisine) constraints.unshift(where('cuisine', '==', filters.cuisine));
  if (filters.meal_type) constraints.unshift(where('meal_type', 'array-contains', filters.meal_type));
  if (filters.difficulty) constraints.unshift(where('difficulty', '==', filters.difficulty));
  if (filters.is_premium === false) constraints.unshift(where('is_premium', '==', false));
  if (cursor) constraints.push(startAfter(cursor));
  
  const q = query(recipesRef, ...constraints);
  const snap = await getDocs(q);
  
  return {
    recipes: snap.docs.map(d => ({ id: d.id, ...d.data() } as Recipe)),
    cursor: snap.docs[snap.docs.length - 1],
  };
}

// ============================================================
// PANTRY
// ============================================================
export async function analyzePantryPhoto(
  req: PantryScanRequest
): Promise<PantryScanResponse> {
  const fn = httpsCallable<PantryScanRequest, PantryScanResponse>(
    functions,
    'analyzePantryPhoto'
  );
  const result = await fn(req);
  return result.data;
}

export async function uploadPantryPhoto(uri: string, uid: string): Promise<string> {
  // Fotoğrafı blob'a çevir
  const response = await fetch(uri);
  const blob = await response.blob();
  
  const timestamp = Date.now();
  const path = `temp/pantry_scans/${uid}/${timestamp}.jpg`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return path;
}

export async function getUserPantry(uid: string): Promise<PantryItem[]> {
  const pantryRef = collection(db, `users/${uid}/pantry`);
  const snap = await getDocs(pantryRef);
  return snap.docs.map(d => d.data() as PantryItem);
}

export async function updatePantryItem(uid: string, item: PantryItem): Promise<void> {
  const ref = doc(db, `users/${uid}/pantry/${item.token}`);
  await setDoc(ref, item);
}

export async function removePantryItem(uid: string, token: string): Promise<void> {
  const ref = doc(db, `users/${uid}/pantry/${token}`);
  await deleteDoc(ref);
}

// ============================================================
// FAVORITES
// ============================================================
export async function getFavorites(uid: string): Promise<string[]> {
  const favRef = collection(db, `users/${uid}/favorites`);
  const snap = await getDocs(favRef);
  return snap.docs.map(d => d.id);
}

export async function addFavorite(
  uid: string, 
  recipeId: string,
  recipeTitle: string,
  recipeThumb: string
): Promise<void> {
  const ref = doc(db, `users/${uid}/favorites/${recipeId}`);
  await setDoc(ref, {
    recipe_id: recipeId,
    recipe_title: recipeTitle,
    recipe_thumb: recipeThumb,
    added_at: serverTimestamp(),
    cooked_count: 0,
    last_cooked_at: null,
  });
}

export async function removeFavorite(uid: string, recipeId: string): Promise<void> {
  const ref = doc(db, `users/${uid}/favorites/${recipeId}`);
  await deleteDoc(ref);
}

// ============================================================
// USER
// ============================================================
export async function getUser(uid: string): Promise<User | null> {
  const ref = doc(db, `users/${uid}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as User;
}

// ============================================================
// APP CONFIG
// ============================================================
export async function getAppConfig(): Promise<AppConfig | null> {
  const ref = doc(db, 'app_config/global');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as AppConfig;
}

// ============================================================
// VIEW COUNT
// ============================================================
export async function incrementRecipeView(
  recipeId: string, 
  lang: SupportedLanguage = 'tr'
): Promise<void> {
  // Callable function (rate-limited)
  const fn = httpsCallable(functions, 'incrementViewCount');
  await fn({ recipe_id: recipeId, lang });
}
