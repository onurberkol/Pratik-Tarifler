/**
 * SubscriptionScreen — Premium Paywall
 * =======================================
 * Production-ready paywall with:
 *   - 3 plan seçimi (Aylık / Yıllık / Lifetime)
 *   - Free trial badge (yıllık için 7 gün)
 *   - "EN POPÜLER" / "%30 AVANTAJ" badge'leri
 *   - Restore purchases butonu
 *   - Terms & Privacy linkleri (App Store gerekliliği)
 *   - Yükleme + hata state'leri
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../styles/theme';
import { trackEvent } from '../api/analytics';
import * as Subscription from '../services/revenuecat';
import type { PlanOption, PurchaseResult } from '../services/revenuecat';


export default function SubscriptionScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  
  // ============================================================
  // INITIAL LOAD
  // ============================================================
  useEffect(() => {
    trackEvent('subscription_screen_viewed');
    loadPlans();
  }, []);
  
  
  async function loadPlans() {
    try {
      setIsLoading(true);
      const offerings = await Subscription.getOfferings();
      setPlans(offerings);
      
      // Default'a yıllık seç (en popüler)
      const yearly = offerings.find(p => p.type === 'yearly');
      if (yearly) {
        setSelectedPlanId(yearly.id);
      } else if (offerings[0]) {
        setSelectedPlanId(offerings[0].id);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
      Alert.alert('Hata', 'Planlar yüklenemedi. Daha sonra tekrar dene.');
    } finally {
      setIsLoading(false);
    }
  }
  
  
  // ============================================================
  // INTERACTIONS
  // ============================================================
  function handleSelectPlan(plan: PlanOption) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlanId(plan.id);
    trackEvent('plan_selected', { plan_type: plan.type });
  }
  
  
  async function handlePurchase() {
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;
    
    setIsPurchasing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const result: PurchaseResult = await Subscription.purchase(plan);
      
      if (result.success && result.isPremium) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        trackEvent('subscription_purchased', {
          product_id: result.productId,
          plan_type: plan.type,
          is_trial: !!plan.trialDays,
        });
        
        if (plan.trialDays) {
          trackEvent('trial_started', { plan_type: plan.type });
        }
        
        // Başarı ekranına git veya geri dön
        Alert.alert(
          '🎉 Premium Aktif!',
          plan.trialDays
            ? `${plan.trialDays} günlük ücretsiz deneme başladı.`
            : 'Premium özelliklerin keyfini çıkar!',
          [{ text: 'Harika', onPress: () => navigation.goBack() }]
        );
      } else if (result.userCancelled) {
        trackEvent('paywall_dismissed', { plan_type: plan.type });
      } else {
        Alert.alert(
          'Satın Alma Başarısız',
          result.error || 'Beklenmedik bir hata oluştu. Tekrar dene.',
          [{ text: 'Tamam' }]
        );
      }
    } finally {
      setIsPurchasing(false);
    }
  }
  
  
  async function handleRestore() {
    setIsRestoring(true);
    trackEvent('restore_purchases_clicked');
    
    try {
      const result = await Subscription.restorePurchases();
      
      if (result.success && result.isPremium) {
        trackEvent('restore_successful');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          '✅ Geri Yüklendi',
          'Premium aboneliğin aktif edildi.',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Aktif Abonelik Bulunamadı',
          'Daha önce satın alma yaptıysan, App Store/Play Store hesabına bağlı olduğundan emin ol.',
          [{ text: 'Tamam' }]
        );
      }
    } finally {
      setIsRestoring(false);
    }
  }
  
  
  function openLink(url: string) {
    Linking.openURL(url);
  }
  
  
  // ============================================================
  // RENDER
  // ============================================================
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }
  
  
  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Close button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={[theme.colors.premium, '#B8860B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEmoji}>👑</Text>
          <Text style={styles.heroTitle}>Pratik Tarifler Premium</Text>
          <Text style={styles.heroSubtitle}>
            Sınırsız tarif, hiç reklam, premium tarifler
          </Text>
        </LinearGradient>
        
        {/* Benefits */}
        <View style={styles.benefits}>
          <Benefit icon="infinite" text="Sınırsız buzdolabı taraması" />
          <Benefit icon="bookmark" text="Sınırsız favori tarif" />
          <Benefit icon="star" text="502 özel premium tarif" />
          <Benefit icon="cart" text="Alışveriş listesi export (PDF)" />
          <Benefit icon="cloud-download" text="Sınırsız offline indir" />
          <Benefit icon="ban" text="Reklam yok" />
          <Benefit icon="people" text="Aile paylaşımı (yıllık+)" />
        </View>
        
        {/* Plans */}
        <View style={styles.plans}>
          <Text style={styles.plansTitle}>Plan Seç</Text>
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={plan.id === selectedPlanId}
              onSelect={() => handleSelectPlan(plan)}
            />
          ))}
        </View>
        
        {/* CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.ctaButton, isPurchasing && styles.ctaDisabled]}
            onPress={handlePurchase}
            disabled={isPurchasing || !selectedPlan}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>
                {selectedPlan?.trialDays
                  ? `${selectedPlan.trialDays} gün ücretsiz başlat`
                  : 'Premium\'a Geç'}
              </Text>
            )}
          </TouchableOpacity>
          
          {selectedPlan?.trialDays && (
            <Text style={styles.trialNote}>
              {selectedPlan.trialDays} gün sonra {selectedPlan.priceString} olarak yenilenir. İstediğin zaman iptal et.
            </Text>
          )}
        </View>
        
        {/* Restore */}
        <TouchableOpacity 
          onPress={handleRestore}
          disabled={isRestoring}
          style={styles.restoreBtn}
        >
          {isRestoring ? (
            <ActivityIndicator color={theme.colors.textSecondary} />
          ) : (
            <Text style={styles.restoreText}>Satın Almaları Geri Yükle</Text>
          )}
        </TouchableOpacity>
        
        {/* Legal */}
        <View style={styles.legal}>
          <Text style={styles.legalText}>
            Abonelik otomatik yenilenir. App Store/Play Store hesabından istediğin zaman iptal edebilirsin.
          </Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => openLink('https://pratiktarifler.com/terms')}>
              <Text style={styles.legalLink}>Kullanım Koşulları</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}> · </Text>
            <TouchableOpacity onPress={() => openLink('https://pratiktarifler.com/privacy')}>
              <Text style={styles.legalLink}>Gizlilik Politikası</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


// ============================================================
// SUBCOMPONENTS
// ============================================================
function Benefit({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIconWrap}>
        <Ionicons name={icon as any} size={20} color={theme.colors.premium} />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}


function PlanCard({ 
  plan, 
  selected, 
  onSelect 
}: { 
  plan: PlanOption; 
  selected: boolean; 
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        selected && styles.planCardSelected,
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {plan.badge && (
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>{plan.badge}</Text>
        </View>
      )}
      
      <View style={styles.planRow}>
        <View style={styles.planRadio}>
          <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
            {selected && <View style={styles.radioInner} />}
          </View>
        </View>
        
        <View style={styles.planInfo}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planDescription}>
            {plan.description}
            {plan.trialDays ? ` · ${plan.trialDays} gün ücretsiz` : ''}
          </Text>
        </View>
        
        <View style={styles.planPriceContainer}>
          <Text style={styles.planPrice}>{plan.priceString}</Text>
          {plan.pricePerMonthString && (
            <Text style={styles.planPricePerMonth}>{plan.pricePerMonthString}</Text>
          )}
          {plan.savePercent && (
            <Text style={styles.planSave}>%{plan.savePercent} avantaj</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}


// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  
  // Scroll
  scroll: {
    paddingBottom: theme.spacing.xxxl,
  },
  
  // Hero
  hero: {
    margin: theme.spacing.md,
    padding: theme.spacing.xl,
    borderRadius: 20,
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  
  // Benefits
  benefits: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  benefitIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 168, 71, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  benefitText: {
    fontSize: 15,
    color: theme.colors.text,
    flex: 1,
  },
  
  // Plans
  plans: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  planCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: theme.colors.premium,
    backgroundColor: 'rgba(212, 168, 71, 0.05)',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: theme.colors.premium,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planRadio: {
    marginRight: theme.spacing.sm,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: theme.colors.premium,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.premium,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  planDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  planPriceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  planPricePerMonth: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  planSave: {
    fontSize: 11,
    color: theme.colors.modeSupply,
    fontWeight: '600',
    marginTop: 2,
  },
  
  // CTA
  ctaContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  ctaButton: {
    backgroundColor: theme.colors.premium,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  trialNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  
  // Restore
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  restoreText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  
  // Legal
  legal: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  legalText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  legalLink: {
    fontSize: 11,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});
