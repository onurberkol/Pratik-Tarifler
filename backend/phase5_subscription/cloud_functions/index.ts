/**
 * Phase 5 — Subscription Cloud Functions Export
 * ================================================
 * Bu dosyayı functions/src/index.ts'de import edip re-export et:
 *
 *   // functions/src/index.ts
 *   export * from './phase5_subscription';
 */

// Stripe
export {
  createStripeCheckoutSession,
  createStripeCustomerPortal,
  refreshStripeSubscriptionStatus,
} from './stripeCheckout';

export { stripeWebhook } from './stripeWebhook';

// RevenueCat
export { revenuecatWebhook } from './revenuecatWebhook';


// ============================================================
// TRIAL EXPIRY NOTIFIER (Scheduled)
// ============================================================
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Trial expiry hatırlatması — günlük çalışır, 1 gün kala kullanıcıya bildirim gönderir.
 */
export const notifyTrialExpiringSoon = onSchedule(
  {
    schedule: 'every day 10:00',
    timeZone: 'Europe/Istanbul',
    timeoutSeconds: 300,
  },
  async () => {
    const now = Date.now() / 1000;
    const tomorrow = now + 86400;
    const dayAfter = now + 2 * 86400;
    
    // 1-2 gün içinde trial biten kullanıcıları bul
    const usersSnap = await db.collection('users')
      .where('subscription.status', '==', 'trialing')
      .where('subscription.trial_end', '>=', tomorrow)
      .where('subscription.trial_end', '<=', dayAfter)
      .get();
    
    let notifiedCount = 0;
    
    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const pushTokens = userData.push_tokens || [];
      
      if (pushTokens.length === 0) continue;
      
      // Daha önce bu trial için bildirim gönderildiyse atla
      const lastNotified = userData.subscription?.trial_expiry_notified_at;
      const trialEnd = userData.subscription?.trial_end;
      if (lastNotified && trialEnd && lastNotified >= trialEnd - 2 * 86400) {
        continue;
      }
      
      const messages = pushTokens.map((token: string) => ({
        to: token,
        sound: 'default',
        title: '⏰ Premium denemen yarın bitiyor!',
        body: 'Sınırsız tarif keşfi için aboneliğini şimdi onayla.',
        data: { type: 'trial_expiring', user_id: userDoc.id },
      }));
      
      // Expo push send
      try {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messages),
        });
        
        await userDoc.ref.set({
          subscription: {
            trial_expiry_notified_at: now,
          },
        }, { merge: true });
        
        notifiedCount++;
      } catch (err) {
        console.error(`Notification failed for ${userDoc.id}:`, err);
      }
    }
    
    console.log(`Trial expiry notifications sent: ${notifiedCount}`);
  }
);


// ============================================================
// SUBSCRIPTION ANALYTICS AGGREGATOR (Scheduled - haftalık)
// ============================================================
/**
 * Haftada bir subscription metrics topla:
 * - MAU, premium ratio, churn, MRR
 */
export const aggregateSubscriptionMetrics = onSchedule(
  {
    schedule: 'every monday 02:00',
    timeZone: 'Europe/Istanbul',
    timeoutSeconds: 540,
  },
  async () => {
    const totalUsersSnap = await db.collection('users').count().get();
    const totalUsers = totalUsersSnap.data().count;
    
    const premiumSnap = await db.collection('users')
      .where('subscription.status', 'in', ['active', 'trialing'])
      .count()
      .get();
    const premiumUsers = premiumSnap.data().count;
    
    const trialingSnap = await db.collection('users')
      .where('subscription.status', '==', 'trialing')
      .count()
      .get();
    const trialingUsers = trialingSnap.data().count;
    
    const weekId = new Date().toISOString().split('T')[0];
    
    await db.doc(`analytics/subscription_weekly/${weekId}`).set({
      total_users: totalUsers,
      premium_users: premiumUsers,
      trialing_users: trialingUsers,
      premium_ratio: totalUsers > 0 ? premiumUsers / totalUsers : 0,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`Weekly metrics: ${premiumUsers}/${totalUsers} premium`);
  }
);
