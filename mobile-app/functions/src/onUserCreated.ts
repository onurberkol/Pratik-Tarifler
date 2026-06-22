import { beforeUserCreated } from "firebase-functions/v2/identity";
import * as admin from "firebase-admin";

/**
 * Auth blocking trigger: initialize the user document when an account is created.
 * Uses beforeUserCreated so the doc exists before the client reads it.
 */
export const onUserCreated = beforeUserCreated(
  { region: "europe-west1" },
  async (event) => {
    const user = event.data;
    if (!user) return;

    await admin
      .firestore()
      .doc(`users/${user.uid}`)
      .set(
        {
          uid: user.uid,
          email: user.email ?? null,
          display_name: user.displayName ?? user.email?.split("@")[0] ?? "Cook",
          locale: "en",
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          last_active: admin.firestore.FieldValue.serverTimestamp(),
          premium: { active: false },
          preferences: {
            dietary_filters: [],
            notifications: { daily_recipe: true, timer_alerts: true },
            metric_system: true,
          },
          stats: {
            recipes_cooked: 0,
            favorites_count: 0,
            streak_days: 0,
          },
        },
        { merge: true }
      );
  }
);
