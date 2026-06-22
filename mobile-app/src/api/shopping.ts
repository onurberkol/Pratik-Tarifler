import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type { ShoppingList, ShoppingListItem, Recipe } from "@/types";

function listsPath(uid: string) {
  return collection(db, "users", uid, "shopping_lists");
}

export async function createShoppingList(
  name: string,
  recipes: Recipe[]
): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("not_authenticated");

  const id = `list_${Date.now()}`;
  const items = aggregateItems(recipes);
  await setDoc(doc(listsPath(uid), id), {
    id,
    name,
    recipe_ids: recipes.map((r) => r.id),
    items,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return id;
}

export async function getShoppingList(id: string): Promise<ShoppingList | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;
  const snap = await getDoc(doc(listsPath(uid), id));
  if (!snap.exists()) return null;
  return snap.data() as ShoppingList;
}

export async function listShoppingLists(): Promise<ShoppingList[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const snap = await getDocs(
    query(listsPath(uid), orderBy("updated_at", "desc"))
  );
  const out: ShoppingList[] = [];
  snap.forEach((d) => out.push(d.data() as ShoppingList));
  return out;
}

export async function toggleItem(
  listId: string,
  tokenIndex: number,
  checked: boolean
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("not_authenticated");
  const list = await getShoppingList(listId);
  if (!list) throw new Error("list_not_found");
  const items = list.items.map((it, i) =>
    i === tokenIndex ? { ...it, checked } : it
  );
  await updateDoc(doc(listsPath(uid), listId), {
    items,
    updated_at: serverTimestamp(),
  });
}

export async function deleteShoppingList(id: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("not_authenticated");
  await deleteDoc(doc(listsPath(uid), id));
}

export function watchShoppingList(
  id: string,
  callback: (list: ShoppingList | null) => void
): () => void {
  const uid = auth.currentUser?.uid;
  if (!uid) return () => {};
  return onSnapshot(doc(listsPath(uid), id), (snap) => {
    callback(snap.exists() ? (snap.data() as ShoppingList) : null);
  });
}

/**
 * Aggregate ingredients across recipes (deduplicate by token).
 */
function aggregateItems(recipes: Recipe[]): ShoppingListItem[] {
  const byToken = new Map<string, ShoppingListItem>();
  for (const recipe of recipes) {
    // Use Turkish (default authoring lang) for amounts, then resolve display lang client-side
    const localized =
      recipe.i18n.tr ?? recipe.i18n.en ?? Object.values(recipe.i18n)[0];
    if (!localized) continue;
    for (const ing of localized.ingredients) {
      const existing = byToken.get(ing.token);
      if (existing) {
        existing.total_amount = `${existing.total_amount} + ${ing.amount}`;
      } else {
        byToken.set(ing.token, {
          token: ing.token,
          total_amount: ing.amount,
          checked: false,
          from_pantry: false,
        });
      }
    }
  }
  return Array.from(byToken.values());
}
