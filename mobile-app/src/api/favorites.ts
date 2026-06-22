import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  onSnapshot,
  serverTimestamp,
  limit as fbLimit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import type { Favorite } from "@/types";

const FREE_TIER_LIMIT = 10;

function favoritesPath(uid: string) {
  return collection(db, "users", uid, "favorites");
}

export async function addFavorite(
  recipeId: string,
  options: { collection?: string; notes?: string; isPremium?: boolean } = {}
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("not_authenticated");

  if (!options.isPremium) {
    const existing = await getDocs(
      query(favoritesPath(uid), fbLimit(FREE_TIER_LIMIT + 1))
    );
    if (existing.size >= FREE_TIER_LIMIT) {
      throw new Error("free_limit_reached");
    }
  }

  await setDoc(doc(favoritesPath(uid), recipeId), {
    recipe_id: recipeId,
    added_at: serverTimestamp(),
    ...(options.collection && { collection: options.collection }),
    ...(options.notes && { notes: options.notes }),
  });
}

export async function removeFavorite(recipeId: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("not_authenticated");
  await deleteDoc(doc(favoritesPath(uid), recipeId));
}

export async function listFavorites(): Promise<Favorite[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const snap = await getDocs(
    query(favoritesPath(uid), orderBy("added_at", "desc"))
  );
  const items: Favorite[] = [];
  snap.forEach((d) => items.push(d.data() as Favorite));
  return items;
}

/**
 * Realtime listener for favorites. Returns unsubscribe fn.
 */
export function watchFavorites(
  callback: (favs: Favorite[]) => void
): () => void {
  const uid = auth.currentUser?.uid;
  if (!uid) return () => {};
  const q = query(favoritesPath(uid), orderBy("added_at", "desc"));
  return onSnapshot(q, (snap) => {
    const items: Favorite[] = [];
    snap.forEach((d) => items.push(d.data() as Favorite));
    callback(items);
  });
}
