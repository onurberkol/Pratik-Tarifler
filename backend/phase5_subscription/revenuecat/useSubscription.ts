/**
 * useSubscription Hook
 * =======================
 * React hook'lar:
 * - useSubscription: Real-time subscription status (Firestore listener)
 * - useTrialCountdown: Trial bitimi geri sayım
 * - usePremiumFeature: Feature gate check + paywall trigger
 *
 * KULLANIM:
 *   const { isPremium, tier, daysUntilExpiry } = useSubscription();
 *   const { canUse, requirePremium } = usePremiumFeature('shopping_list_export');
 *   const { remaining, formatted } = useTrialCountdown();
 */

import { useEffect, useState, useCallback } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../api/client';
import { trackEvent } from '../api/analytics';


// ============================================================
// TYPES
// ============================================================
export type SubscriptionTier = 
  | 'free' 
  | 'premium_monthly' 
  | 'premium_yearly' 
  | 'premium_lifetime';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'inactive';

export interface SubscriptionData {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  provider: 'revenuecat' | 'stripe' | 'manual';
  current_period_end?: number;
  trial_end?: number;
  cancel_at_period_end?: boolean;
  isPremium: boolean;
  isTrialing: boolean;
  daysUntilExpiry: number | null;
}


// ============================================================
// useSubscription — Ana subscription durumu
// ============================================================
const DEFAULT_SUBSCRIPTION: SubscriptionData = {
  tier: 'free',
  status: 'inactive',
  provider: 'manual',
  isPremium: false,
  isTrialing: false,
  daysUntilExpiry: null,
};

export function useSubscription() {
  const [data, setData] = useState<SubscriptionData>(DEFAULT_SUBSCRIPTION);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setData(DEFAULT_SUBSCRIPTION);
      setLoading(false);
      return;
    }
    
    // Firestore real-time listener
    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        const userData = snapshot.data();
        const sub = userData?.subscription;
        
        if (!sub) {
          setData(DEFAULT_SUBSCRIPTION);
          setLoading(false);
          return;
        }
        
        const now = Date.now() / 1000;
        const isPremium = ['premium_monthly', 'premium_yearly', 'premium_lifetime'].includes(sub.tier);
        const isTrialing = sub.status === 'trialing' && sub.trial_end && sub.trial_end > now;
        
        let daysUntilExpiry: number | null = null;
        const expiryTimestamp = sub.trial_end || sub.current_period_end;
        if (expiryTimestamp && expiryTimestamp > now) {
          daysUntilExpiry = Math.ceil((expiryTimestamp - now) / 86400);
        }
        
        setData({
          tier: sub.tier || 'free',
          status: sub.status || 'inactive',
          provider: sub.provider || 'manual',
          current_period_end: sub.current_period_end,
          trial_end: sub.trial_end,
          cancel_at_period_end: sub.cancel_at_period_end,
          isPremium,
          isTrialing,
          daysUntilExpiry,
        });
        setLoading(false);
      },
      (err) => {
        console.error('Subscription listener error:', err);
        setLoading(false);
      }
    );
    
    return () => unsub();
  }, []);
  
  return { ...data, loading };
}


// ============================================================
// useTrialCountdown — Trial geri sayım (1 dk'da bir tick)
// ============================================================
interface TrialCountdown {
  isTrialing: boolean;
  remainingMs: number;
  remainingDays: number;
  remainingHours: number;
  formatted: string;  // "6 gün 4 saat" gibi
}

export function useTrialCountdown(): TrialCountdown {
  const subscription = useSubscription();
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    if (!subscription.isTrialing) return;
    
    // Her dakika tick
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [subscription.isTrialing]);
  
  if (!subscription.isTrialing || !subscription.trial_end) {
    return {
      isTrialing: false,
      remainingMs: 0,
      remainingDays: 0,
      remainingHours: 0,
      formatted: '',
    };
  }
  
  const remainingMs = Math.max(0, subscription.trial_end * 1000 - now);
  const remainingDays = Math.floor(remainingMs / 86_400_000);
  const remainingHours = Math.floor((remainingMs % 86_400_000) / 3_600_000);
  
  let formatted = '';
  if (remainingDays > 0) {
    formatted = `${remainingDays} gün`;
    if (remainingHours > 0) formatted += ` ${remainingHours} saat`;
  } else if (remainingHours > 0) {
    formatted = `${remainingHours} saat`;
  } else {
    const remainingMin = Math.ceil(remainingMs / 60_000);
    formatted = `${remainingMin} dakika`;
  }
  
  return {
    isTrialing: true,
    remainingMs,
    remainingDays,
    remainingHours,
    formatted,
  };
}


// ============================================================
// usePremiumFeature — Feature gate + paywall navigation
// ============================================================
export type PremiumFeature =
  | 'unlimited_pantry_scans'
  | 'shopping_list_export'
  | 'premium_recipes'
  | 'unlimited_favorites'
  | 'ad_free'
  | 'meal_planner'
  | 'nutrition_details'
  | 'family_sharing'
  | 'priority_support';

interface PremiumFeatureResult {
  canUse: boolean;
  reason: 'allowed' | 'requires_premium' | 'loading';
  requirePremium: (source?: string) => boolean;  // true = blocked
}

export function usePremiumFeature(feature: PremiumFeature): PremiumFeatureResult {
  const { isPremium, loading } = useSubscription();
  const navigation = useNavigation<any>();
  
  const requirePremium = useCallback((source: string = feature) => {
    if (isPremium) return false; // not blocked
    
    // Analytics
    trackEvent('paywall_triggered', { feature, source });
    
    // Navigate to SubscriptionScreen
    navigation.navigate('Subscription', {
      source: feature,
      title: getPaywallTitle(feature),
    });
    
    return true; // blocked
  }, [isPremium, navigation, feature]);
  
  return {
    canUse: isPremium,
    reason: loading ? 'loading' : isPremium ? 'allowed' : 'requires_premium',
    requirePremium,
  };
}


// ============================================================
// useDailyQuota — Free user için günlük limit (örn pantry scan)
// ============================================================
interface DailyQuotaResult {
  used: number;
  limit: number;
  remaining: number;
  canUse: boolean;
  resetAt: Date;
}

export function useDailyQuota(
  quotaType: 'pantry_scans' | 'ocr_scans',
  defaultLimit: number = 3
): DailyQuotaResult {
  const [used, setUsed] = useState(0);
  const { isPremium } = useSubscription();
  
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || isPremium) return;
    
    const today = new Date().toISOString().split('T')[0];
    const quotaRef = doc(db, `users/${user.uid}/quotas/${today}`);
    
    const unsub = onSnapshot(quotaRef, (snap) => {
      setUsed(snap.data()?.[quotaType] || 0);
    });
    
    return () => unsub();
  }, [quotaType, isPremium]);
  
  // Midnight reset (local time)
  const resetAt = new Date();
  resetAt.setHours(24, 0, 0, 0);
  
  if (isPremium) {
    return {
      used: 0,
      limit: Infinity,
      remaining: Infinity,
      canUse: true,
      resetAt,
    };
  }
  
  return {
    used,
    limit: defaultLimit,
    remaining: Math.max(0, defaultLimit - used),
    canUse: used < defaultLimit,
    resetAt,
  };
}


// ============================================================
// HELPERS
// ============================================================
function getPaywallTitle(feature: PremiumFeature): string {
  const titles: Record<PremiumFeature, string> = {
    unlimited_pantry_scans: 'Sınırsız Buzdolabı Tarama',
    shopping_list_export: 'Alışveriş Listesi Dışa Aktar',
    premium_recipes: 'Premium Tarifler',
    unlimited_favorites: 'Sınırsız Favori',
    ad_free: 'Reklamsız Deneyim',
    meal_planner: 'Haftalık Yemek Planı',
    nutrition_details: 'Detaylı Besin Bilgisi',
    family_sharing: 'Aile Paylaşımı',
    priority_support: 'Öncelikli Destek',
  };
  return titles[feature] || 'Premium Özellik';
}
