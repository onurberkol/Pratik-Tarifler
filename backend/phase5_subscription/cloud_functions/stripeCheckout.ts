/**
 * Stripe Cloud Functions
 * =========================
 * - createStripeCheckoutSession: Web checkout başlatır
 * - createStripeCustomerPortal: Subscription yönetim portalı
 * - (stripeWebhook.ts'de events handle edilir)
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const STRIPE_SECRET = defineSecret('STRIPE_SECRET_KEY');
const db = admin.firestore();


// ============================================================
// CREATE CHECKOUT SESSION
// ============================================================
interface CheckoutRequest {
  price_id: string;
  success_url: string;
  cancel_url: string;
  trial_days?: number;
  coupon?: string;
}

export const createStripeCheckoutSession = onCall(
  {
    secrets: [STRIPE_SECRET],
    timeoutSeconds: 30,
    region: 'us-central1',
  },
  async (request: CallableRequest<CheckoutRequest>) => {
    const { auth: userAuth, data } = request;
    
    if (!userAuth) {
      throw new HttpsError('unauthenticated', 'Login required');
    }
    
    const userId = userAuth.uid;
    const userEmail = userAuth.token.email;
    
    const stripe = new Stripe(STRIPE_SECRET.value(), {
      apiVersion: '2024-12-18.acacia',
    });
    
    // Mevcut Stripe Customer var mı?
    const userDoc = await db.doc(`users/${userId}`).get();
    const userData = userDoc.data() || {};
    let stripeCustomerId = userData.stripe_customer_id;
    
    // Yoksa yeni oluştur
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebase_user_id: userId,
        },
      });
      stripeCustomerId = customer.id;
      
      await db.doc(`users/${userId}`).set({
        stripe_customer_id: stripeCustomerId,
      }, { merge: true });
    }
    
    // Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: data.price_id,
        quantity: 1,
      }],
      success_url: `${data.success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: data.cancel_url,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          firebase_user_id: userId,
        },
      },
      metadata: {
        firebase_user_id: userId,
      },
    };
    
    // Free trial
    if (data.trial_days && data.trial_days > 0) {
      sessionParams.subscription_data!.trial_period_days = data.trial_days;
    }
    
    // Coupon
    if (data.coupon) {
      sessionParams.discounts = [{ coupon: data.coupon }];
      delete sessionParams.allow_promotion_codes;
    }
    
    try {
      const session = await stripe.checkout.sessions.create(sessionParams);
      
      // Audit log
      await db.collection('checkout_sessions').add({
        user_id: userId,
        session_id: session.id,
        price_id: data.price_id,
        status: 'created',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return {
        url: session.url!,
        session_id: session.id,
      };
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      throw new HttpsError('internal', `Stripe error: ${err.message}`);
    }
  }
);


// ============================================================
// CUSTOMER PORTAL
// ============================================================
interface PortalRequest {
  return_url?: string;
}

export const createStripeCustomerPortal = onCall(
  {
    secrets: [STRIPE_SECRET],
    timeoutSeconds: 20,
  },
  async (request: CallableRequest<PortalRequest>) => {
    const { auth: userAuth, data } = request;
    
    if (!userAuth) {
      throw new HttpsError('unauthenticated', 'Login required');
    }
    
    const userDoc = await db.doc(`users/${userAuth.uid}`).get();
    const stripeCustomerId = userDoc.data()?.stripe_customer_id;
    
    if (!stripeCustomerId) {
      throw new HttpsError('not-found', 'Stripe customer bulunamadı');
    }
    
    const stripe = new Stripe(STRIPE_SECRET.value(), {
      apiVersion: '2024-12-18.acacia',
    });
    
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: data.return_url || 'https://pratiktarifler.app',
    });
    
    return { url: session.url };
  }
);


// ============================================================
// CHECK SUBSCRIPTION STATUS (manual sync — webhook desteği için fallback)
// ============================================================
export const refreshStripeSubscriptionStatus = onCall(
  {
    secrets: [STRIPE_SECRET],
    timeoutSeconds: 30,
  },
  async (request) => {
    const { auth: userAuth } = request;
    if (!userAuth) throw new HttpsError('unauthenticated', 'Login required');
    
    const userId = userAuth.uid;
    const userDoc = await db.doc(`users/${userId}`).get();
    const stripeCustomerId = userDoc.data()?.stripe_customer_id;
    
    if (!stripeCustomerId) {
      return { isPremium: false, tier: 'free' };
    }
    
    const stripe = new Stripe(STRIPE_SECRET.value(), {
      apiVersion: '2024-12-18.acacia',
    });
    
    // Aktif subscription'ları getir
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1,
    });
    
    if (subs.data.length === 0) {
      // Trial bitti veya cancel oldu
      await db.doc(`users/${userId}`).set({
        subscription: {
          tier: 'free',
          status: 'inactive',
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
      }, { merge: true });
      
      return { isPremium: false, tier: 'free' };
    }
    
    const sub = subs.data[0];
    const tier = sub.items.data[0].price.id === process.env.STRIPE_PRICE_YEARLY
      ? 'premium_yearly'
      : 'premium_monthly';
    
    await db.doc(`users/${userId}`).set({
      subscription: {
        tier,
        status: sub.status,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        provider: 'stripe',
        stripe_subscription_id: sub.id,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
    }, { merge: true });
    
    return {
      isPremium: true,
      tier,
      current_period_end: sub.current_period_end,
      cancel_at_period_end: sub.cancel_at_period_end,
    };
  }
);
