import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

/**
 * Admin-only bulk seed function. Accepts an array of recipe documents
 * and writes them idempotently using set() with merge.
 */
export const seedDatabase = onCall<{ recipes: Record<string, unknown>[] }>(
  { region: "europe-west1", memory: "512MiB", timeoutSeconds: 540 },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Sign-in required.");

    // Admin check via custom claim
    const admins = (process.env.ADMIN_UIDS ?? "").split(",").map((s) => s.trim());
    if (!admins.includes(uid) && !request.auth?.token?.admin) {
      throw new HttpsError("permission-denied", "Admin only.");
    }

    const { recipes } = request.data;
    if (!Array.isArray(recipes)) {
      throw new HttpsError("invalid-argument", "recipes must be an array.");
    }

    const db = admin.firestore();
    const BATCH_SIZE = 400;
    let count = 0;
    for (let i = 0; i < recipes.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const slice = recipes.slice(i, i + BATCH_SIZE);
      for (const r of slice) {
        const id = (r as { id?: string }).id;
        if (!id) continue;
        batch.set(
          db.doc(`recipes/${id}`),
          { ...r, updated_at: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        );
        count++;
      }
      await batch.commit();
    }
    return { success: true, count };
  }
);
