/**
 * RevenueCat Webhook Handler
 * ==============================
 * RevenueCat'ten gelen subscription event'lerini işler.
 * 
 * SETUP:
 *   RevenueCat Dashboard → Project Settings → Integrations → Webhooks
 *   URL: https://us-central1-{project}.cloudfunctions.net/revenuecatWebhook
 *   Auth Header: x-webhook-secret = (env'de tut)
 * 
 * EVENT TYPES:
 *   - INITIAL_PURCHASE     — yeni abone
 *   - RENEWAL              — yenileme başarılı
 *   - CANCELLATION         — kullanıcı iptal etti
 *   - EXPIRATION           — bitti
 *   - BILLING_ISSUE        — ödeme başarısız
 *   - PRODUCT_CHANGE       — plan değişti
 *   - TRANSFER             — başka cihaza aktarıldı
 *   - SUBSCRIPTION_EXTENDED — admin grant
 *   - NON_RENEWING_PURCHASE — lifetime gibi tek seferlik
 */

import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET || '';


// ============================================================
// MAIN HANDLER
// ============================================================
export const revenuecatWebhook = onRequest(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
    secrets: ['REVENUECAT_WEBHOOK_SECRET'],
  },
  async (req, res) => {
    // 1) Auth check
    const authHeader = req.header('Authorization');
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      console.warn('Unauthorized webhook attempt');
      res.status(401).send('Unauthorized');
      return;
    }
    
    // 2) Parse event
    const event = req.body?.event;
    if (!event) {
      res.status(400).send('No event');
      return;
    }
    
    const userId = event.app_user_id;
    if (!userId) {
      res.status(400).send('No user id');
      return;
    }
    
    console.log(`📨 RevenueCat event: ${event.type} for user ${userId}`);
    
    try {
      // 3) Dispatch
      switch (event.type) {
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'PRODUCT_CHANGE':
        case 'SUBSCRIPTION_EXTENDED':
        case 'NON_RENEWING_PURCHASE':
          await handlePurchaseOrRenewal(userId, event);
          break;
        
        case 'CANCELLATION':
          await handleCancellation(userId, event);
          break;
        
        case 'EXPIRATION':
          await handleExpiration(userId, event);
          break;
        
        case 'BILLING_ISSUE':
          await handleBillingIssue(userId, event);
          break;
        
        case 'TRANSFER':
          await handleTransfer(event);
          break;
        
        case 'UNCANCELLATION':
          await handleUncancellation(userId, event);
          break;
        
        default:
          console.warn(`Unhandled event type: ${event.type}`);
      }
      
      // 4) Log event
      await db.collection('subscription_events').add({
        user_id: userId,
        event_type: event.type,
        event_data: event,
        processed_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      res.status(200).send('OK');
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(500).send(`Error: ${error.message}`);
    }
  }
);


// ============================================================
// HANDLERS
// ============================================================

async function handlePurchaseOrRenewal(userId: string, event: any) {
  const isFirstPurchase = event.type === 'INITIAL_PURCHASE';
  const isInTrial = event.period_type === 'TRIAL';
  
  await db.doc(`users/${userId}/subscription/current`).set({
    tier: 'premium',
    product_id: event.product_id,
    store: event.store, // 'APP_STORE' | 'PLAY_STORE'
    purchased_at: admin.firestore.Timestamp.fromMillis(event.purchased_at_ms),
    expires_at: event.expiration_at_ms 
      ? admin.firestore.Timestamp.fromMillis(event.expiration_at_ms)
      : null,
    transaction_id: event.transaction_id,
    is_trial: isInTrial,
    is_lifetime: event.type === 'NON_RENEWING_PURCHASE',
    status: 'active',
    last_event: event.type,
    last_updated_at: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  
  // User profile flag
  await db.doc(`users/${userId}`).set({
    is_premium: true,
    premium_since: isFirstPurchase 
      ? admin.firestore.Timestamp.fromMillis(event.purchased_at_ms)
      : admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  
  // Trial bilgisi log'la
  if (isInTrial && isFirstPurchase) {
    await db.collection('analytics_events').add({
      user_id: userId,
      event: 'trial_started_server',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}


async function handleCancellation(userId: string, event: any) {
  // İptal edildi ama mevcut dönem sonuna kadar premium kalır
  await db.doc(`users/${userId}/subscription/current`).set({
    will_renew: false,
    cancelled_at: admin.firestore.Timestamp.fromMillis(event.event_timestamp_ms),
    cancellation_reason: event.cancel_reason || 'unknown',
    status: 'active_but_cancelled',
    last_event: 'CANCELLATION',
    last_updated_at: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  
  // Win-back hedeflenecek kullanıcı
  await db.collection('winback_targets').doc(userId).set({
    user_id: userId,
    cancelled_at: admin.firestore.Timestamp.fromMillis(event.event_timestamp_ms),
    expires_at: event.expiration_at_ms
      ? admin.firestore.Timestamp.fromMillis(event.expiration_at_ms)
      : null,
    notified: false,
  });
}


async function handleExpiration(userId: string, event: any) {
  // Subscription tamamen bitti — free'ye düş
  await db.doc(`users/${userId}/subscription/current`).set({
    tier: 'free',
    expired_at: admin.firestore.Timestamp.fromMillis(event.event_timestamp_ms),
    status: 'expired',
    last_event: 'EXPIRATION',
    last_updated_at: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  
  await db.doc(`users/${userId}`).set({
    is_premium: false,
  }, { merge: true });
}


async function handleBillingIssue(userId: string, event: any) {
  await db.doc(`users/${userId}/subscription/current`).set({
    status: 'billing_issue',
    billing_issue_at: admin.firestore.Timestamp.fromMillis(event.event_timestamp_ms),
    grace_period_expires_at: event.grace_period_expiration_at_ms
      ? admin.firestore.Timestamp.fromMillis(event.grace_period_expiration_at_ms)
      : null,
    last_event: 'BILLING_ISSUE',
    last_updated_at: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  
  // Kullanıcıya push gönder (ödemeyi güncellesin)
  // → notifications cloud function trigger'ı tetiklenebilir
}


async function handleTransfer(event: any) {
  // Kullanıcı abonelikini başka hesaba transfer etti
  const fromUserId = event.transferred_from?.[0];
  const toUserId = event.transferred_to?.[0];
  
  if (!fromUserId || !toUserId) return;
  
  // Eski hesabı free yap
  await db.doc(`users/${fromUserId}/subscription/current`).set({
    tier: 'free',
    transferred_to: toUserId,
    status: 'transferred',
    last_event: 'TRANSFER',
    last_updated_at: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  
  // Yeni hesap zaten INITIAL_PURCHASE event'i alacak
}


async function handleUncancellation(userId: string, event: any) {
  // Kullanıcı iptal'i geri aldı, devam ediyor
  await db.doc(`users/${userId}/subscription/current`).set({
    will_renew: true,
    cancelled_at: null,
    status: 'active',
    last_event: 'UNCANCELLATION',
    last_updated_at: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}


// ============================================================
// WIN-BACK CAMPAIGN (Scheduled)
// ============================================================
import { onSchedule } from 'firebase-functions/v2/scheduler';

/**
 * İptal edenlere 30 gün sonra %40 indirim teklifi push'la
 */
export const sendWinbackOffers = onSchedule(
  { schedule: 'every day 14:00', timeZone: 'Europe/Istanbul' },
  async () => {
    const cutoff = admin.firestore.Timestamp.fromMillis(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    );
    
    const targets = await db.collection('winback_targets')
      .where('notified', '==', false)
      .where('cancelled_at', '<=', cutoff)
      .limit(100)
      .get();
    
    for (const targetDoc of targets.docs) {
      const userId = targetDoc.data().user_id;
      
      // Push gönder (notifications.ts'deki helper'ı çağır)
      const tokensSnap = await db.collection(`users/${userId}/push_tokens`).get();
      const messaging = admin.messaging();
      
      for (const tokenDoc of tokensSnap.docs) {
        try {
          await messaging.send({
            token: tokenDoc.data().token,
            notification: {
              title: '🎁 Sana özel %40 İndirim',
              body: 'Premium\'a geri dön — sadece 3 gün geçerli.',
            },
            data: {
              type: 'winback',
              promo_code: `WINBACK40_${userId.slice(0, 6)}`,
              link: 'pratiktarifler://subscription?promo=winback40',
            },
          });
        } catch (err) {
          console.warn('Winback push failed:', err);
        }
      }
      
      await targetDoc.ref.update({ notified: true });
    }
    
    console.log(`Winback campaign: ${targets.size} users targeted`);
  }
);
