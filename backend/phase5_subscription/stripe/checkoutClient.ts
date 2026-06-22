/**
 * Stripe Web Checkout Client
 * =============================
 * Web app için subscription. Mobile (iOS/Android) RevenueCat kullanır,
 * web (claude.ai benzeri) için Stripe Checkout kullanırız.
 *
 * KURULUM (web tarafında):
 *   npm install @stripe/stripe-js
 *
 * AKIŞ:
 *   1. User "Subscribe" butonuna tıklar
 *   2. Backend (createCheckoutSession Cloud Function) → Stripe Checkout URL döner
 *   3. User Stripe'a redirect olur
 *   4. Ödeme sonrası geri döner (success/cancel URL)
 *   5. Stripe webhook → Firestore'u günceller (stripeWebhook.ts)
 *
 * DİKKAT: Bu dosya web build için. React Native'de KULLANILMAZ.
 * RN uygulamada sadece RevenueCat (revenuecat/index.ts) yeterli.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../api/client';


// ============================================================
// CONFIGURATION
// ============================================================
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Stripe Price ID'leri — Stripe Dashboard'da oluşturduğun ürünlerden
export const STRIPE_PRICES = {
  monthly: process.env.EXPO_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_xxx',
  yearly: process.env.EXPO_PUBLIC_STRIPE_PRICE_YEARLY || 'price_yyy',
  lifetime: process.env.EXPO_PUBLIC_STRIPE_PRICE_LIFETIME || 'price_zzz',
};


// ============================================================
// STRIPE INSTANCE
// ============================================================
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe() {
  if (!stripePromise) {
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error('[Stripe] EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY not set');
    }
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}


// ============================================================
// CHECKOUT SESSION
// ============================================================
interface CheckoutOptions {
  price_id: string;
  success_url?: string;
  cancel_url?: string;
  trial_days?: number;
  coupon?: string;
}

/**
 * Stripe Checkout başlat
 * Backend'in (createCheckoutSession Cloud Function) Checkout URL döndürmesini bekler.
 */
export async function startCheckout(options: CheckoutOptions): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Login required');
  }

  const createSession = httpsCallable<CheckoutOptions, { url: string; session_id: string }>(
    functions,
    'createStripeCheckoutSession'
  );

  const result = await createSession({
    price_id: options.price_id,
    success_url: options.success_url || `${window.location.origin}/subscription/success`,
    cancel_url: options.cancel_url || `${window.location.origin}/subscription/cancel`,
    trial_days: options.trial_days,
    coupon: options.coupon,
  });

  const { url } = result.data;
  if (!url) {
    throw new Error('Checkout URL alınamadı');
  }

  // Stripe Checkout'a redirect
  window.location.href = url;
}


// ============================================================
// CUSTOMER PORTAL (kullanıcı kendi subscription'ını yönetir)
// ============================================================
/**
 * Kullanıcıyı Stripe Customer Portal'a yönlendirir.
 * Burada subscription cancel/upgrade/downgrade yapabilir.
 */
export async function openCustomerPortal(returnUrl?: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Login required');
  }

  const createPortal = httpsCallable<{ return_url?: string }, { url: string }>(
    functions,
    'createStripeCustomerPortal'
  );

  const result = await createPortal({
    return_url: returnUrl || window.location.origin,
  });

  window.location.href = result.data.url;
}


// ============================================================
// PRICE FORMATTING
// ============================================================
export function formatStripePrice(amountInCents: number, currency: string = 'TRY'): string {
  const formatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: amountInCents % 100 === 0 ? 0 : 2,
  });
  return formatter.format(amountInCents / 100);
}


// ============================================================
// PURCHASE TRACKING (analytics)
// ============================================================
export interface PurchaseEvent {
  product_id: string;
  price_id: string;
  amount: number;
  currency: string;
}

export function trackPurchaseStart(event: PurchaseEvent) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'begin_checkout', {
      currency: event.currency,
      value: event.amount / 100,
      items: [{ item_id: event.product_id, price: event.amount / 100 }],
    });
  }
}

export function trackPurchaseSuccess(event: PurchaseEvent) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'purchase', {
      currency: event.currency,
      value: event.amount / 100,
      transaction_id: event.product_id,
      items: [{ item_id: event.product_id, price: event.amount / 100 }],
    });
  }
}
