/**
 * RevenueCat Integration
 * =========================
 * Tek SDK ile iOS + Android subscription yönetimi.
 * 
 * KURULUM:
 *   npm install react-native-purchases
 *   
 *   # iOS
 *   cd ios && pod install
 * 
 *   # Android
 *   (gradle otomatik bağlanır)
 * 
 * KULLANIM:
 *   import * as Subscription from './services/revenuecat';
 *   
 *   await Subscription.init();
 *   const offerings = await Subscription.getOfferings();
 *   await Subscription.purchase(offerings.monthly);
 *   const isPremium = await Subscription.checkPremiumStatus();
 */

import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesEntitlementInfo,
  PURCHASES_ERROR_CODE,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth, db } from '../api/client';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';


// ============================================================
// CONFIGURATION
// ============================================================
const REVENUECAT_API_KEY = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
};

const PREMIUM_ENTITLEMENT_ID = 'premium';

// Product IDs (App Store Connect / Play Console'da oluşturduğun)
export const PRODUCT_IDS = {
  monthly: 'com.pratiktarifler.premium.monthly',
  yearly: 'com.pratiktarifler.premium.yearly',
  lifetime: 'com.pratiktarifler.premium.lifetime',
};


// ============================================================
// INITIALIZATION
// ============================================================
let initialized = false;


/**
 * App açılışında çağrılır.
 * Kullanıcı login olduktan SONRA tekrar identify ile bağlanır.
 */
export async function init(userId?: string): Promise<void> {
  if (initialized) return;
  
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
  
  const apiKey = Platform.OS === 'ios' 
    ? REVENUECAT_API_KEY.ios 
    : REVENUECAT_API_KEY.android;
  
  if (!apiKey) {
    console.warn('⚠️  RevenueCat API key not set. Subscription disabled.');
    return;
  }
  
  await Purchases.configure({ 
    apiKey,
    appUserID: userId, // optional — login sonrası tekrar set edilebilir
  });
  
  // Customer info değişikliklerini dinle
  Purchases.addCustomerInfoUpdateListener(async (info) => {
    await syncSubscriptionToFirestore(info);
  });
  
  initialized = true;
}


/**
 * Kullanıcı login olduğunda RevenueCat'e identify et.
 * Sayesinde cross-device sync çalışır.
 */
export async function identify(userId: string): Promise<void> {
  if (!initialized) await init();
  
  const result = await Purchases.logIn(userId);
  
  if (result.created) {
    console.log('✨ New RevenueCat user');
  }
  
  // İlk sync
  await syncSubscriptionToFirestore(result.customerInfo);
}


/**
 * Kullanıcı logout olduğunda
 */
export async function signOut(): Promise<void> {
  if (!initialized) return;
  await Purchases.logOut();
}


// ============================================================
// OFFERINGS — Hangi planlar mevcut?
// ============================================================
export interface PlanOption {
  id: string;
  package: PurchasesPackage;
  title: string;
  description: string;
  priceString: string;        // "₺59,99"
  pricePerMonthString?: string; // yıllık için "ayda ₺41,58"
  type: 'monthly' | 'yearly' | 'lifetime';
  trialDays?: number;
  savePercent?: number;       // yıllık için "30% indirim"
  badge?: string;             // "EN POPÜLER" / "EN AVANTAJLI"
}


export async function getOfferings(): Promise<PlanOption[]> {
  if (!initialized) await init();
  
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    
    if (!current) {
      console.warn('No current offering found');
      return [];
    }
    
    const plans: PlanOption[] = [];
    
    // Aylık
    if (current.monthly) {
      plans.push({
        id: 'monthly',
        package: current.monthly,
        title: 'Aylık',
        description: 'İstediğin zaman iptal et',
        priceString: current.monthly.product.priceString,
        type: 'monthly',
        trialDays: hasIntroOffer(current.monthly) ? 7 : undefined,
      });
    }
    
    // Yıllık (en popüler genelde)
    if (current.annual) {
      const annualPrice = current.annual.product.price;
      const monthlyEquivalent = annualPrice / 12;
      const monthlyPlan = current.monthly?.product.price || 0;
      const savePercent = monthlyPlan > 0 
        ? Math.round((1 - monthlyEquivalent / monthlyPlan) * 100)
        : 0;
      
      plans.push({
        id: 'yearly',
        package: current.annual,
        title: 'Yıllık',
        description: 'En avantajlı seçim',
        priceString: current.annual.product.priceString,
        pricePerMonthString: formatMonthlyEquivalent(annualPrice, current.annual.product.currencyCode),
        type: 'yearly',
        trialDays: hasIntroOffer(current.annual) ? 7 : undefined,
        savePercent: savePercent > 0 ? savePercent : undefined,
        badge: 'EN POPÜLER',
      });
    }
    
    // Lifetime
    const lifetime = current.availablePackages.find(
      p => p.product.identifier === PRODUCT_IDS.lifetime
    );
    if (lifetime) {
      plans.push({
        id: 'lifetime',
        package: lifetime,
        title: 'Ömür Boyu',
        description: 'Tek seferlik ödeme, hep premium',
        priceString: lifetime.product.priceString,
        type: 'lifetime',
        badge: 'TEK ÖDEME',
      });
    }
    
    return plans;
  } catch (error) {
    console.error('getOfferings error:', error);
    return [];
  }
}


function hasIntroOffer(pkg: PurchasesPackage): boolean {
  return !!pkg.product.introPrice && pkg.product.introPrice.price === 0;
}


function formatMonthlyEquivalent(annualPrice: number, currency: string): string {
  const monthly = (annualPrice / 12).toFixed(2);
  // Türk Lirası için özel format
  if (currency === 'TRY') {
    return `ayda ₺${monthly.replace('.', ',')}`;
  }
  return `${currency} ${monthly}/mo`;
}


// ============================================================
// PURCHASE
// ============================================================
export interface PurchaseResult {
  success: boolean;
  isPremium: boolean;
  productId?: string;
  error?: string;
  errorCode?: string;
  userCancelled?: boolean;
}


export async function purchase(plan: PlanOption): Promise<PurchaseResult> {
  if (!initialized) await init();
  
  try {
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(plan.package);
    
    const isPremium = isPremiumActive(customerInfo);
    
    if (isPremium) {
      await syncSubscriptionToFirestore(customerInfo);
      await AsyncStorage.setItem('last_purchase', JSON.stringify({
        product_id: productIdentifier,
        purchased_at: new Date().toISOString(),
      }));
    }
    
    return {
      success: true,
      isPremium,
      productId: productIdentifier,
    };
  } catch (error: any) {
    const userCancelled = error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
    
    return {
      success: false,
      isPremium: false,
      error: error.message,
      errorCode: error.code,
      userCancelled,
    };
  }
}


// ============================================================
// RESTORE PURCHASES
// ============================================================
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!initialized) await init();
  
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = isPremiumActive(customerInfo);
    
    if (isPremium) {
      await syncSubscriptionToFirestore(customerInfo);
    }
    
    return {
      success: true,
      isPremium,
    };
  } catch (error: any) {
    return {
      success: false,
      isPremium: false,
      error: error.message,
    };
  }
}


// ============================================================
// STATUS CHECKS
// ============================================================
export async function checkPremiumStatus(): Promise<{
  isPremium: boolean;
  expiresAt: Date | null;
  productId: string | null;
  isInTrial: boolean;
  willRenew: boolean;
}> {
  if (!initialized) await init();
  
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    
    if (!entitlement) {
      return {
        isPremium: false,
        expiresAt: null,
        productId: null,
        isInTrial: false,
        willRenew: false,
      };
    }
    
    return {
      isPremium: true,
      expiresAt: entitlement.expirationDate 
        ? new Date(entitlement.expirationDate) 
        : null,
      productId: entitlement.productIdentifier,
      isInTrial: entitlement.periodType === 'TRIAL',
      willRenew: entitlement.willRenew,
    };
  } catch (error) {
    console.error('checkPremiumStatus error:', error);
    return {
      isPremium: false,
      expiresAt: null,
      productId: null,
      isInTrial: false,
      willRenew: false,
    };
  }
}


function isPremiumActive(customerInfo: CustomerInfo): boolean {
  return !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
}


// ============================================================
// FIRESTORE SYNC
// ============================================================
async function syncSubscriptionToFirestore(customerInfo: CustomerInfo): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  
  const entitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  
  const subscriptionData: any = {
    tier: entitlement ? 'premium' : 'free',
    rc_user_id: customerInfo.originalAppUserId,
    last_synced_at: serverTimestamp(),
  };
  
  if (entitlement) {
    subscriptionData.product_id = entitlement.productIdentifier;
    subscriptionData.expires_at = entitlement.expirationDate;
    subscriptionData.purchased_at = entitlement.originalPurchaseDate;
    subscriptionData.will_renew = entitlement.willRenew;
    subscriptionData.is_trial = entitlement.periodType === 'TRIAL';
    subscriptionData.store = entitlement.store; // 'APP_STORE' | 'PLAY_STORE'
    subscriptionData.status = 'active';
  } else {
    subscriptionData.status = 'free';
  }
  
  try {
    await setDoc(
      doc(db, `users/${user.uid}/subscription/current`),
      subscriptionData,
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to sync subscription:', error);
  }
}


// ============================================================
// HOOK — React'te kullanım için
// ============================================================
import { useState, useEffect } from 'react';

export function useSubscriptionStatus() {
  const [status, setStatus] = useState({
    isPremium: false,
    isLoading: true,
    expiresAt: null as Date | null,
    isInTrial: false,
  });
  
  useEffect(() => {
    let mounted = true;
    
    checkPremiumStatus().then(s => {
      if (mounted) {
        setStatus({
          isPremium: s.isPremium,
          isLoading: false,
          expiresAt: s.expiresAt,
          isInTrial: s.isInTrial,
        });
      }
    });
    
    // Listen to changes
    const listener = (customerInfo: CustomerInfo) => {
      if (!mounted) return;
      const entitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
      setStatus({
        isPremium: !!entitlement,
        isLoading: false,
        expiresAt: entitlement?.expirationDate 
          ? new Date(entitlement.expirationDate) 
          : null,
        isInTrial: entitlement?.periodType === 'TRIAL',
      });
    };
    
    Purchases.addCustomerInfoUpdateListener(listener);
    
    return () => {
      mounted = false;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);
  
  return status;
}
