/**
 * sendPushNotification — Cloud Function
 * =========================================
 * Backend'den kullanıcılara push bildirimi göndermek için.
 * 
 * SENARYO:
 *   1. Weekly suggestions — pazartesi sabahları (scheduled)
 *   2. New recipe added matching user pantry (trigger)
 *   3. Premium fırsat (admin-triggered)
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const messaging = admin.messaging();


// ============================================================
// Weekly Suggestions (Her Pazartesi 10:00)
// ============================================================
export const sendWeeklySuggestions = onSchedule(
  {
    schedule: 'every monday 10:00',
    timeZone: 'Europe/Istanbul',
  },
  async () => {
    // Aktif kullanıcıları al (son 30 gün)
    const cutoff = admin.firestore.Timestamp.fromMillis(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    );
    
    const usersSnap = await db.collection('users')
      .where('last_active_at', '>=', cutoff)
      .get();
    
    let sent = 0;
    let failed = 0;
    
    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Notification tercihlerine bak
      const prefsDoc = await db.doc(`users/${userId}/settings/notifications`).get();
      const prefs = prefsDoc.data() || {};
      if (prefs.weekly_suggestions === false) continue;
      
      // Token'ları al
      const tokensSnap = await db.collection(`users/${userId}/push_tokens`).get();
      
      for (const tokenDoc of tokensSnap.docs) {
        const token = tokenDoc.data().token;
        try {
          await messaging.send({
            token,
            notification: {
              title: '🍳 Bu hafta için 5 yeni tarif!',
              body: `${userData.display_name || 'Selam'}, sana özel öneriler hazır.`,
            },
            data: {
              type: 'weekly_suggestions',
              link: 'pratiktarifler://discover',
            },
            android: { priority: 'high', notification: { channelId: 'default' } },
            apns: {
              payload: { aps: { sound: 'default', badge: 1 } },
            },
          });
          sent++;
        } catch (err) {
          failed++;
          // Geçersiz token'ı sil
          if ((err as any).code === 'messaging/registration-token-not-registered') {
            await tokenDoc.ref.delete();
          }
        }
      }
    }
    
    console.log(`Weekly suggestions: ${sent} sent, ${failed} failed`);
  }
);


// ============================================================
// New Recipe Matches User Pantry (Trigger)
// ============================================================
export const notifyOnNewRecipeMatch = onCall(
  { timeoutSeconds: 60 },
  async (request) => {
    const { recipe_id, ingredient_tokens } = request.data;
    
    // Bu malzemelere sahip kullanıcıları bul
    const usersSnap = await db.collection('users').limit(500).get();
    
    let notifiedCount = 0;
    
    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      
      // Kullanıcının pantry'sine bak
      const pantrySnap = await db.collection(`users/${userId}/pantry`).get();
      const userTokens = new Set(pantrySnap.docs.map(d => d.data().token));
      
      // Tüm malzemeler kullanıcıda var mı?
      const allMatch = ingredient_tokens.every((t: string) => userTokens.has(t));
      if (!allMatch) continue;
      
      // Push gönder
      const tokensSnap = await db.collection(`users/${userId}/push_tokens`).get();
      for (const tokenDoc of tokensSnap.docs) {
        try {
          await messaging.send({
            token: tokenDoc.data().token,
            notification: {
              title: '✨ Senin malzemelerinle yeni tarif!',
              body: 'Az önce sana uygun yeni bir tarif eklendi.',
            },
            data: {
              type: 'new_recipe_match',
              recipe_id,
              link: `pratiktarifler://recipe/${recipe_id}`,
            },
          });
          notifiedCount++;
        } catch (err) {
          console.warn('Push failed:', err);
        }
      }
    }
    
    return { notified: notifiedCount };
  }
);


// ============================================================
// Premium Promo (Admin-only)
// ============================================================
export const sendPremiumPromo = onCall(
  { timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth?.token?.admin) {
      throw new HttpsError('permission-denied', 'Admin only');
    }
    
    const { 
      title = '👑 Premium 50% İndirim!',
      body = 'Sınırlı süre — sınırsız scan ve özel tarifler.',
      target = 'free_users', // 'all' | 'free_users' | 'churned_premium'
    } = request.data;
    
    // Free kullanıcıları al
    let userQuery = db.collection('users');
    if (target === 'free_users') {
      userQuery = userQuery.where('subscription.tier', '==', 'free') as any;
    }
    
    const usersSnap = await userQuery.get();
    let sent = 0;
    
    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      
      // Marketing tercihine bak
      const prefsDoc = await db.doc(`users/${userId}/settings/notifications`).get();
      const prefs = prefsDoc.data() || {};
      if (prefs.premium_offers === false) continue;
      
      const tokensSnap = await db.collection(`users/${userId}/push_tokens`).get();
      for (const tokenDoc of tokensSnap.docs) {
        try {
          await messaging.send({
            token: tokenDoc.data().token,
            notification: { title, body },
            data: {
              type: 'premium_promo',
              link: 'pratiktarifler://subscription',
            },
          });
          sent++;
        } catch (err) {
          console.warn('Push failed:', err);
        }
      }
    }
    
    return { sent };
  }
);
