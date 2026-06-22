/**
 * Stripe Integration — Web Subscription
 * ========================================
 * Web kullanıcılar için Stripe Checkout.
 * iOS/Android için RevenueCat kullanılır.
 * 
 * SETUP:
 *   1. Stripe Dashboard'da 3 product yarat:
 *      - Pratik Tarifler Premium Monthly (₺59.99 recurring)
 *      - Pratik Tarifler Premium Yearly (₺499 recurring)
 *      - Pratik Tarifler Premium Lifetime (₺1499 one-time)
 *   2. .env'e ekle:
 *      STRIPE_SECRET_KEY=sk_live_...
 *      STRIPE_WEBHOOK_SECRET=whsec_...
 *      STRIPE_PRICE_MONTHLY=price_...
 *      STRIPE_PRICE_YEARLY=price_...
 *      STRIPE_PRICE_LIFETIME=price_...
 *   3. Webhook URL'i Stripe'a ekle:
 *      https://us-central1-{project}.cloudfunctions.net/stripeWebhook
 */

import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});


// ============================================================
// 1. CREATE CHECKOUT SESSION (Callable from web)
// ============================================================
export const createStripeCheckout = onCall(
  {
    timeoutSeconds: 15,
    secrets: ['STRIPE_SECRET_KEY'],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Login required');
    }
    
    const userId = request.auth.uid;
    const { plan, success_url, cancel_url, promo_code } = request.data as {
      plan: 'monthly' | 'yearly' | 'lifetime';
      success_url: string;
      cancel_url: string;
      promo_code?: string;
    };
    
    // Price ID seç
    const priceMap = {
      monthly: process.env.STRIPE_PRICE_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_YEARLY!,
      lifetime: process.env.STRIPE_PRICE_LIFETIME!,
    };
    const priceId = priceMap[plan];
    
    if (!priceId) {
      throw new HttpsError('invalid-argument', 'Invalid plan');
    }
    
    // User profile al
    const userDoc = await db.doc(`users/${userId}`).get();
    const userData = userDoc.data() || {};
    
    // Mevcut Stripe customer var mı?
    let customerId = userData.stripe_customer_id;
    
    if (!customerId) {
      // Yeni customer yarat
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.display_name,
        metadata: { firebase_uid: userId },
      });
      customerId = customer.id;
      
      await db.doc(`users/${userId}`).set({
        stripe_customer_id: customerId,
      }, { merge: true });
    }
    
    // Checkout session oluştur
    const session = await stripe.checkout.sessions.create({
      mode: plan === 'lifetime' ? 'payment' : 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url,
      cancel_url,
      
      // Trial (yıllık için)
      subscription_data: plan === 'yearly' ? {
        trial_period_days: 7,
        metadata: { firebase_uid: userId, plan },
      } : undefined,
      
      // Promo code
      discounts: promo_code ? [{ coupon: promo_code }] : undefined,
      allow_promotion_codes: !promo_code,
      
      // Metadata
      metadata: { 
        firebase_uid: userId, 
        plan,
      },
      
      // Telefon zorunlu değil
      phone_number_collection: { enabled: false },
      
      // Billing address (TR vergi)
      billing_address_collection: 'auto',
      
      // Türkçe
      locale: 'tr',
    });
    
    return {
      session_id: session.id,
      url: session.url,
    };
  }
);


// ============================================================
// 2. CREATE CUSTOMER PORTAL SESSION (subscription management)
// ============================================================
export const createCustomerPortal = onCall(
  { timeoutSeconds: 10 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Login required');
    }
    
    const userId = request.auth.uid;
    const { return_url } = request.data;
    
    const userDoc = await db.doc(`users/${userId}`).get();
    const customerId = userDoc.data()?.stripe_customer_id;
    
    if (!customerId) {
      throw new HttpsError('not-found', 'No Stripe customer found');
    }
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url,
      locale: 'tr',
    });
    
    return { url: portalSession.url };
  }
);


// ============================================================
// 3. WEBHOOK HANDLER
// ============================================================
export const stripeWebhook = onRequest(
  {
    timeoutSeconds: 30,
    secrets: ['STRIPE_WEBHOOK_SECRET', 'STRIPE_SECRET_KEY'],
  },
  async (req, res) => {
    const signature = req.header('stripe-signature');
    if (!signature) {
      res.status(400).send('Missing signature');
      return;
    }
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    
    console.log(`💳 Stripe event: ${event.type}`);
    
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        
        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        
        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        
        case 'customer.subscription.trial_will_end':
          await handleTrialEnding(event.data.object as Stripe.Subscription);
          break;
        
        default:
          console.log(`Unhandled Stripe event: ${event.type}`);
      }
      
      // Log
      await db.collection('subscription_events').add({
        source: 'stripe',
        event_type: event.type,
        event_id: event.id,
        event_data: JSON.parse(JSON.stringify(event.data.object)),
        processed_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      res.status(200).send('OK');
    } catch (error: any) {
      console.error('Webhook handler error:', error);
      res.status(500).send(`Error: ${error.message}`);
    }
  }
);


// ============================================================
// STRIPE EVENT HANDLERS
// ============================================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebase_uid;
  const plan = session.metadata?.plan;
  
  if (!userId) {
    console.warn('No firebase_uid in checkout session metadata');
    return;
  }
  
  if (session.mode === 'payment') {
    // Lifetime — tek seferlik
    await db.doc(`users/${userId}/subscription/current`).set({
      tier: 'premium',
      product_id: 'stripe_lifetime',
      source: 'stripe',
      is_lifetime: true,
      purchased_at: admin.firestore.FieldValue.serverTimestamp(),
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      status: 'active',
      last_updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    await db.doc(`users/${userId}`).set({
      is_premium: true,
      premium_since: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  // Subscription mode için zaten customer.subscription.created event'i gelir
}


async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // Customer'dan firebase_uid'i al
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata?.firebase_uid || (subscription.metadata?.firebase_uid as string);
  
  if (!userId) return;
  
  const item = subscription.items.data[0];
  const interval = item?.price.recurring?.interval; // 'month' | 'year'
  
  await db.doc(`users/${userId}/subscription/current`).set({
    tier: subscription.status === 'active' || subscription.status === 'trialing' ? 'premium' : 'free',
    product_id: `stripe_${interval}ly`,
    source: 'stripe',
    stripe_subscription_id: subscription.id,
    started_at: admin.firestore.Timestamp.fromMillis(subscription.start_date * 1000),
    expires_at: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
    will_renew: !subscription.cancel_at_period_end,
    is_trial: subscription.status === 'trialing',
    trial_ends_at: subscription.trial_end 
      ? admin.firestore.Timestamp.fromMillis(subscription.trial_end * 1000)
      : null,
    status: subscription.status,
    last_updated_at: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  
  const isPremium = subscription.status === 'active' || subscription.status === 'trialing';
  await db.doc(`users/${userId}`).set({
    is_premium: isPremium,
  }, { merge: true });
}


async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata?.firebase_uid;
  
  if (!userId) return;
  
  await db.doc(`users/${userId}/subscription/current`).set({
    tier: 'free',
    status: 'cancelled',
    cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
    last_updated_at: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  
  await db.doc(`users/${userId}`).set({
    is_premium: false,
  }, { merge: true });
}


async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Yenileme başarılı — log
  console.log(`✅ Payment succeeded: ${invoice.id} for customer ${invoice.customer}`);
}


async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
  const userId = customer.metadata?.firebase_uid;
  
  if (!userId) return;
  
  await db.doc(`users/${userId}/subscription/current`).set({
    status: 'billing_issue',
    payment_failed_at: admin.firestore.FieldValue.serverTimestamp(),
    last_updated_at: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  
  // Kullanıcıya email/push gönder
}


async function handleTrialEnding(subscription: Stripe.Subscription) {
  // Trial bitmesine 3 gün kala bildir
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata?.firebase_uid;
  
  if (!userId) return;
  
  // Push gönder
  const tokensSnap = await db.collection(`users/${userId}/push_tokens`).get();
  const messaging = admin.messaging();
  
  for (const tokenDoc of tokensSnap.docs) {
    try {
      await messaging.send({
        token: tokenDoc.data().token,
        notification: {
          title: '⏰ Deneme sürresi 3 gün sonra biter',
          body: 'Premium\'a devam etmek istiyor musun?',
        },
        data: {
          type: 'trial_ending',
          link: 'pratiktarifler://subscription',
        },
      });
    } catch (err) {
      console.warn('Trial ending push failed:', err);
    }
  }
}
