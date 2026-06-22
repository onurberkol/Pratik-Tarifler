/**
 * Premium Gating Service
 * =========================
 * Tek bir kaynak — feature'lara erişimi kontrol eden helper'lar.
 * 
 * MİMARİ İLKE: "TRUST BUT VERIFY"
 *   - Client tarafı: hızlı UX (paywall göstermek için)
 *   - Server tarafı: GERÇEK kontrol (her premium endpoint Cloud Function'da check eder)
 */

import { useSubscriptionStatus } from '../revenuecat';


// ============================================================
// FEATURE GATE TANIMI
// ============================================================
export type Feature =
  | 'unlimited_pantry_scans'
  | 'unlimited_favorites'
  | 'premium_recipes'
  | 'shopping_list_export'
  | 'unlimited_offline'
  | 'no_ads'
  | 'family_sharing'
  | 'priority_support';


export interface FeatureGate {
  feature: Feature;
  freeTierLimit?: number;       // free için sayısal limit (varsa)
  premiumOnly: boolean;
  description: string;
}


export const FEATURE_GATES: Record<Feature, FeatureGate> = {
  unlimited_pantry_scans: {
    feature: 'unlimited_pantry_scans',
    freeTierLimit: 3, // günlük
    premiumOnly: false,
    description: 'Buzdolabı taraması',
  },
  unlimited_favorites: {
    feature: 'unlimited_favorites',
    freeTierLimit: 20,
    premiumOnly: false,
    description: 'Favori tarifler',
  },
  premium_recipes: {
    feature: 'premium_recipes',
    premiumOnly: true,
    description: 'Premium tarifler',
  },
  shopping_list_export: {
    feature: 'shopping_list_export',
    premiumOnly: true,
    description: 'Alışveriş listesi export',
  },
  unlimited_offline: {
    feature: 'unlimited_offline',
    freeTierLimit: 10,
    premiumOnly: false,
    description: 'Offline tarif indir',
  },
  no_ads: {
    feature: 'no_ads',
    premiumOnly: true,
    description: 'Reklamsız deneyim',
  },
  family_sharing: {
    feature: 'family_sharing',
    premiumOnly: true,
    description: 'Aile paylaşımı (5 kişi)',
  },
  priority_support: {
    feature: 'priority_support',
    premiumOnly: true,
    description: 'Öncelikli destek',
  },
};


// ============================================================
// CLIENT HOOKS
// ============================================================

/**
 * Genel premium kontrol hook'u.
 * 
 * KULLANIM:
 *   const { canUse, limit, used, remaining } = useFeatureAccess('unlimited_favorites');
 *   if (!canUse) showPaywall();
 */
export function useFeatureAccess(feature: Feature, currentUsage: number = 0) {
  const { isPremium } = useSubscriptionStatus();
  const gate = FEATURE_GATES[feature];
  
  if (isPremium) {
    return {
      canUse: true,
      isPremium: true,
      limit: Infinity,
      used: currentUsage,
      remaining: Infinity,
      requiresUpgrade: false,
    };
  }
  
  // Free user
  if (gate.premiumOnly) {
    return {
      canUse: false,
      isPremium: false,
      limit: 0,
      used: 0,
      remaining: 0,
      requiresUpgrade: true,
    };
  }
  
  const limit = gate.freeTierLimit || Infinity;
  const remaining = Math.max(0, limit - currentUsage);
  
  return {
    canUse: remaining > 0,
    isPremium: false,
    limit,
    used: currentUsage,
    remaining,
    requiresUpgrade: remaining === 0,
  };
}


/**
 * Daily quota tracking — pantry scans için
 */
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useDailyScanQuota() {
  const { isPremium } = useSubscriptionStatus();
  const [scansToday, setScansToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadScansToday();
  }, []);
  
  async function loadScansToday() {
    const today = new Date().toISOString().split('T')[0];
    const stored = await AsyncStorage.getItem(`scans_${today}`);
    setScansToday(stored ? parseInt(stored, 10) : 0);
    setIsLoading(false);
  }
  
  async function incrementScansToday() {
    const today = new Date().toISOString().split('T')[0];
    const next = scansToday + 1;
    await AsyncStorage.setItem(`scans_${today}`, String(next));
    setScansToday(next);
  }
  
  const limit = isPremium ? Infinity : FEATURE_GATES.unlimited_pantry_scans.freeTierLimit!;
  
  return {
    scansToday,
    limit,
    remaining: isPremium ? Infinity : Math.max(0, limit - scansToday),
    canScan: isPremium || scansToday < limit,
    isLoading,
    incrementScansToday,
  };
}


// ============================================================
// SERVER-SIDE CHECK
// ============================================================
/**
 * Bu fonksiyon Cloud Function'larda kullanılır.
 * Client'ın iddialarına ASLA güvenme — bu kaynaktan kontrol et.
 * 
 * KULLANIM (Cloud Function içinde):
 *   import { requirePremium } from './premiumGating';
 *   await requirePremium(userId);
 *   // veya
 *   const canUse = await checkFeatureAccess(userId, 'shopping_list_export');
 */

// NOT: Bu cloud_functions/'da ayrı dosya olarak da olabilir,
// ama burada referans amaçlı:

/*
import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';

const db = admin.firestore();

export async function isUserPremium(userId: string): Promise<boolean> {
  const subDoc = await db.doc(`users/${userId}/subscription/current`).get();
  if (!subDoc.exists) return false;
  
  const data = subDoc.data();
  if (data?.tier !== 'premium') return false;
  if (data?.status === 'expired') return false;
  
  // Expiry check
  if (data?.expires_at) {
    const expiresAt = (data.expires_at as admin.firestore.Timestamp).toMillis();
    if (expiresAt < Date.now()) return false;
  }
  
  return true;
}


export async function requirePremium(userId: string): Promise<void> {
  const isPremium = await isUserPremium(userId);
  if (!isPremium) {
    throw new HttpsError(
      'permission-denied',
      'Bu özellik Premium üyelik gerektirir'
    );
  }
}
*/
