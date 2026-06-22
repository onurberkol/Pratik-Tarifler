import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

/**
 * GDPR account deletion. Deletes the user document and all sub-collections,
 * then any storage owned by the user. The client deletes the auth user itself.
 */
export const purgeUserData = onCall(
  { region: "europe-west1" },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign-in required.");
    }

    const db = admin.firestore();
    const userRef = db.doc(`users/${uid}`);

    // Sub-collections we need to purge
    const subs = ["favorites", "shopping_lists", "cooking_history"];
    for (const sub of subs) {
      const snap = await userRef.collection(sub).get();
      const batch = db.batch();
      snap.forEach((d) => batch.delete(d.ref));
      if (snap.size > 0) await batch.commit();
    }

    await userRef.delete();

    // Storage: prefix matches user's UID
    try {
      const bucket = admin.storage().bucket();
      await bucket.deleteFiles({ prefix: `users/${uid}/` });
    } catch (err) {
      console.warn("Storage purge failed (non-fatal):", err);
    }

    return { success: true };
  }
);
