/**
 * SubscriptionScreen — Premium Üyelik
 * ========================================
 * - Premium özelliklerinin tanıtımı
 * - Aylık / Yıllık plan seçimi
 * - In-app purchase entegrasyonu (RevenueCat veya expo-in-app-purchases)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../hooks';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';

type Plan = 'monthly' | 'yearly';

const FEATURES = [
  { emoji: '📸', titleKey: 'subscription.feature_unlimited_scan' },
  { emoji: '👑', titleKey: 'subscription.feature_premium_recipes' },
  { emoji: '🛒', titleKey: 'subscription.feature_shopping_list' },
  { emoji: '⭐', titleKey: 'subscription.feature_unlimited_favs' },
  { emoji: '📖', titleKey: 'subscription.feature_cook_history' },
  { emoji: '🚫', titleKey: 'subscription.feature_no_ads' },
  { emoji: '🗄️', titleKey: 'subscription.feature_multi_pantry' },
  { emoji: '🎯', titleKey: 'subscription.feature_smart_recommendations' },
];

export default function SubscriptionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [purchasing, setPurchasing] = useState(false);
  
  const source = route.params?.source || 'profile';
  
  React.useEffect(() => {
    analytics.track('premium_gate_shown', { source });
  }, [source]);
  
  const handlePurchase = useCallback(async () => {
    setPurchasing(true);
    analytics.track('premium_upgrade_started', { 
      plan: selectedPlan, 
      source 
    });
    
    try {
      // PROD: RevenueCat veya expo-in-app-purchases
      // const productId = selectedPlan === 'yearly' 
      //   ? 'pratik_tarifler_premium_yearly' 
      //   : 'pratik_tarifler_premium_monthly';
      // await Purchases.purchaseProduct(productId);
      
      // Geçici - prod entegrasyon eksik
      Alert.alert(
        t('subscription.coming_soon_title'),
        t('subscription.coming_soon_message')
      );
    } catch (e: any) {
      analytics.error(e, { context: 'purchase' });
      Alert.alert(t('common.error'), e.message);
    } finally {
      setPurchasing(false);
    }
  }, [selectedPlan, source, t]);
  
  const handleRestore = useCallback(async () => {
    // RevenueCat.restorePurchases()
    Alert.alert(
      t('subscription.restore_title'),
      t('subscription.restore_message')
    );
  }, [t]);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {/* Hero */}
        <LinearGradient
          colors={theme.colors.premiumGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <Text style={styles.heroEmoji}>👑</Text>
          <Text style={styles.heroTitle}>{t('subscription.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('subscription.subtitle')}</Text>
        </LinearGradient>
        
        {/* Features */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((f, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureText}>{t(f.titleKey)}</Text>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          ))}
        </View>
        
        {/* Plan Selection */}
        <View style={styles.plansContainer}>
          <TouchableOpacity 
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.planCardSelected,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedPlan('yearly');
            }}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{t('subscription.best_value')}</Text>
            </View>
            <Text style={styles.planTitle}>{t('subscription.yearly')}</Text>
            <Text style={styles.planPrice}>₺299/yıl</Text>
            <Text style={styles.planSavings}>{t('subscription.save_50')}</Text>
            <Text style={styles.planPerMonth}>≈ ₺24.92/ay</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedPlan('monthly');
            }}
          >
            <Text style={styles.planTitle}>{t('subscription.monthly')}</Text>
            <Text style={styles.planPrice}>₺49/ay</Text>
            <Text style={styles.planPerMonth}>{t('subscription.cancel_anytime')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Free Trial */}
        <View style={styles.trialBadge}>
          <Text style={styles.trialEmoji}>🎁</Text>
          <Text style={styles.trialText}>{t('subscription.free_trial_7_days')}</Text>
        </View>
        
        {/* CTA */}
        <TouchableOpacity 
          style={[styles.ctaButton, purchasing && styles.ctaButtonDisabled]}
          onPress={handlePurchase}
          disabled={purchasing}
        >
          <Text style={styles.ctaText}>{t('subscription.start_trial')}</Text>
        </TouchableOpacity>
        
        {/* Restore */}
        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.restoreText}>{t('subscription.restore_purchases')}</Text>
        </TouchableOpacity>
        
        {/* Fine print */}
        <Text style={styles.finePrint}>
          {t('subscription.fine_print')}
        </Text>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.base,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '700',
  },
  
  heroSection: {
    margin: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 64, marginBottom: theme.spacing.md },
  heroTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: theme.fontSize.base,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
  },
  
  featuresContainer: {
    backgroundColor: theme.colors.backgroundElevated,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.base,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.card,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: theme.spacing.md,
  },
  featureEmoji: { fontSize: 22, width: 28 },
  featureText: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  checkmark: {
    color: theme.colors.success,
    fontSize: 18,
    fontWeight: '700',
  },
  
  plansContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.base,
  },
  planCard: {
    flex: 1,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.base,
    padding: theme.spacing.base,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: theme.colors.premium,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  planBadgeText: {
    fontSize: theme.fontSize.xs,
    color: 'white',
    fontWeight: '700',
  },
  planTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  planSavings: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    fontWeight: '700',
  },
  planPerMonth: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.success + '20',
    borderRadius: theme.radius.full,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.base,
  },
  trialEmoji: { fontSize: 18 },
  trialText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: '700',
  },
  
  ctaButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.base,
    borderRadius: theme.radius.base,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  ctaButtonDisabled: { opacity: 0.6 },
  ctaText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textInverse,
  },
  
  restoreText: {
    textAlign: 'center',
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    padding: theme.spacing.sm,
    textDecorationLine: 'underline',
  },
  
  finePrint: {
    textAlign: 'center',
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.base,
    lineHeight: 16,
  },
});
