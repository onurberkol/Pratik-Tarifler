/**
 * PantryInputScreen — Mod 1 Giriş Ekranı
 * ==========================================
 * Kullanıcı malzemelerini nasıl ekleyeceğini seçer:
 *   1. Buzdolabı fotoğrafı çek
 *   2. Manuel liste gir
 *   3. Kayıtlı buzdolabını kullan
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../hooks/useAuth';
import { useUserPantry } from '../hooks/useUserPantry';
import { useDailyScanLimit } from '../hooks/useDailyScanLimit';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import type { RecommendationMode } from '../types';

type Props = {
  /** Hangi mod için giriş yapılıyor (Mod 1 veya Mod 2 — aynı ekran kullanılır) */
  route: { params?: { mode?: RecommendationMode } };
};

export default function PantryInputScreen({ route }: Props) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pantry, loading: pantryLoading } = useUserPantry();
  const { scansToday, dailyLimit, isPremium } = useDailyScanLimit();
  
  const mode: RecommendationMode = route?.params?.mode || 'pantry';
  const remainingScans = isPremium ? Infinity : Math.max(0, dailyLimit - scansToday);
  
  const handleCamera = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!isPremium && remainingScans <= 0) {
      analytics.track('scan_limit_hit', { user_id: user?.uid });
      Alert.alert(
        t('scan.limit_title'),
        t('scan.limit_message', { limit: dailyLimit }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { 
            text: t('premium.upgrade_cta'),
            onPress: () => navigation.navigate('Subscription', { source: 'scan_limit' })
          },
        ]
      );
      return;
    }
    
    analytics.track('scan_camera_opened', { mode });
    navigation.navigate('PhotoCamera', { mode });
  };
  
  const handleManual = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analytics.track('manual_list_opened', { mode });
    navigation.navigate('IngredientList', { mode, initialItems: [] });
  };
  
  const handleSaved = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!pantry || pantry.length === 0) {
      Alert.alert(
        t('pantry.empty_title'),
        t('pantry.empty_message'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('pantry.manage'), onPress: () => navigation.navigate('PantryManagement') },
        ]
      );
      return;
    }
    
    analytics.track('saved_pantry_used', { mode, item_count: pantry.length });
    const tokens = pantry.map(p => p.token);
    navigation.navigate('IngredientList', { mode, initialItems: tokens });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('pantry_input.title')}</Text>
          <Text style={styles.subtitle}>
            {mode === 'supply' 
              ? t('pantry_input.subtitle_supply')
              : t('pantry_input.subtitle_pantry')
            }
          </Text>
        </View>
        
        {/* OPTION 1: KAMERA */}
        <TouchableOpacity
          style={[styles.optionCard, styles.optionCardPrimary]}
          onPress={handleCamera}
          activeOpacity={0.85}
        >
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIconLarge}>📸</Text>
          </View>
          
          <Text style={styles.optionTitle}>{t('pantry_input.camera_title')}</Text>
          <Text style={styles.optionDescription}>{t('pantry_input.camera_desc')}</Text>
          
          {!isPremium && (
            <View style={styles.quotaBadge}>
              <Text style={styles.quotaText}>
                {t('pantry_input.daily_remaining', { 
                  remaining: remainingScans, 
                  total: dailyLimit 
                })}
              </Text>
            </View>
          )}
          
          {isPremium && (
            <View style={[styles.quotaBadge, styles.quotaBadgePremium]}>
              <Text style={styles.quotaText}>✨ {t('premium.unlimited')}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* DIVIDER */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('common.or')}</Text>
          <View style={styles.dividerLine} />
        </View>
        
        {/* OPTION 2: MANUEL */}
        <TouchableOpacity
          style={styles.optionCardSecondary}
          onPress={handleManual}
          activeOpacity={0.85}
        >
          <Text style={styles.optionIcon}>✍️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitleSecondary}>
              {t('pantry_input.manual_title')}
            </Text>
            <Text style={styles.optionDescriptionSecondary}>
              {t('pantry_input.manual_desc')}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        
        {/* OPTION 3: KAYITLI BUZDOLABI */}
        <TouchableOpacity
          style={styles.optionCardSecondary}
          onPress={handleSaved}
          activeOpacity={0.85}
        >
          <Text style={styles.optionIcon}>🗄️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitleSecondary}>
              {t('pantry_input.saved_title')}
            </Text>
            <Text style={styles.optionDescriptionSecondary}>
              {pantryLoading 
                ? t('common.loading')
                : pantry?.length > 0
                  ? t('pantry_input.saved_desc_items', { count: pantry.length })
                  : t('pantry_input.saved_desc_empty')
              }
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        
        {/* TIP */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>{t('pantry_input.tip')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  
  // PRIMARY OPTION (Camera)
  optionCard: {
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadow.card,
  },
  optionCardPrimary: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  optionIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  optionIconLarge: {
    fontSize: 44,
  },
  optionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  quotaBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
  },
  quotaBadgePremium: {
    backgroundColor: theme.colors.premium + '22',
  },
  quotaText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  
  // DIVIDER
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.base,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.base,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  
  // SECONDARY OPTIONS (Manual, Saved)
  optionCardSecondary: {
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.base,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.base,
    ...theme.shadow.card,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionTitleSecondary: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  optionDescriptionSecondary: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  chevron: {
    fontSize: 22,
    color: theme.colors.textMuted,
    fontWeight: '300',
  },
  
  // TIP
  tipCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.base,
    borderRadius: theme.radius.base,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 19,
  },
});
