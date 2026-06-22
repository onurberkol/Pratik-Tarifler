/**
 * RecipeDetailScreen — Tarif Detay
 * ====================================
 * - Büyük görsel (4:3)
 * - Meta: rating, süre, zorluk, kişi
 * - Servis ayarlayıcı (2x, 4x, 6x)
 * - Malzeme listesi (dinamik miktarlar)
 * - Adım adım talimatlar
 * - İpuçları
 * - "Pişirmeye Başla" CTA → CookMode
 * 
 * Mod 2'den gelmişse: eksik malzemeler vurgulanır
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { BlurImage } from '../components/BlurImage';
import { useRecipe } from '../hooks/useRecipe';
import { useFavorites } from '../hooks/useFavorites';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import type { Recipe, MissingIngredient, Ingredient, Step } from '../types';

export default function RecipeDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  
  const recipeId: string = route.params?.recipeId;
  const missingIngredients: MissingIngredient[] = route.params?.missing_ingredients || [];
  const missingTokens = new Set(missingIngredients.map(m => m.token));
  
  const { recipe, loading, error } = useRecipe(recipeId);
  const { favorites, toggleFavorite } = useFavorites();
  
  const [servingMultiplier, setServingMultiplier] = useState<number>(1);
  
  useEffect(() => {
    if (recipe) {
      analytics.track('recipe_viewed', { recipe_id: recipe.id });
    }
  }, [recipe]);
  
  const handleStartCooking = () => {
    if (!recipe) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    analytics.track('cook_mode_started', { recipe_id: recipe.id });
    navigation.navigate('CookMode', { recipeId: recipe.id });
  };
  
  const handleShare = async () => {
    if (!recipe) return;
    try {
      await Share.share({
        message: t('share.recipe', { title: recipe.title }),
      });
      analytics.track('recipe_shared', { recipe_id: recipe.id });
    } catch (e) {}
  };
  
  const handleFavorite = () => {
    if (!recipe) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(recipe.id);
  };
  
  // Servis çarpanı uygulanmış malzemeler
  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];
    return recipe.ingredients.map(ing => ({
      ...ing,
      scaled_amount: scaleAmount(ing.amount, servingMultiplier),
    }));
  }, [recipe, servingMultiplier]);
  
  if (loading || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const isFavorited = favorites.has(recipe.id);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <BlurImage
            url={recipe.image?.url_full}
            thumbUrl={recipe.image?.url_thumb}
            blurHash={recipe.image?.blur_hash}
            width={SCREEN_WIDTH}
            height={SCREEN_WIDTH * 0.75}
          />
          
          {/* Floating header buttons */}
          <View style={styles.heroButtons}>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.heroButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <TouchableOpacity style={styles.heroButton} onPress={handleFavorite}>
                <Text style={styles.heroButtonText}>{isFavorited ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroButton} onPress={handleShare}>
                <Text style={styles.heroButtonText}>↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>
              ⭐ {recipe.rating_avg.toFixed(1)} ({recipe.rating_count} {t('recipe.votes')})
            </Text>
          </View>
          
          <Text style={styles.description}>{recipe.description}</Text>
          
          {/* Meta Cards */}
          <View style={styles.metaCards}>
            <View style={styles.metaCard}>
              <Text style={styles.metaCardIcon}>⏱</Text>
              <Text style={styles.metaCardLabel}>{t('recipe.total_time')}</Text>
              <Text style={styles.metaCardValue}>{recipe.total_time_min}{t('common.min_short')}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaCardIcon}>👥</Text>
              <Text style={styles.metaCardLabel}>{t('recipe.servings')}</Text>
              <Text style={styles.metaCardValue}>{recipe.servings * servingMultiplier}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaCardIcon}>🔥</Text>
              <Text style={styles.metaCardLabel}>{t('recipe.difficulty')}</Text>
              <Text style={styles.metaCardValue}>{t(`difficulty.${recipe.difficulty}`)}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaCardIcon}>🌿</Text>
              <Text style={styles.metaCardLabel}>{t('recipe.cuisine')}</Text>
              <Text style={styles.metaCardValue} numberOfLines={1}>
                {t(`cuisine.${recipe.cuisine}`)}
              </Text>
            </View>
          </View>
          
          {/* Missing ingredients warning (Mod 2'den geldiyse) */}
          {missingIngredients.length > 0 && (
            <View style={styles.missingWarning}>
              <Text style={styles.missingTitle}>
                🛒 {t('recipe.missing_warning', { count: missingIngredients.length })}
              </Text>
              <Text style={styles.missingList}>
                {missingIngredients.map(m => m.label_localized).join(', ')}
              </Text>
            </View>
          )}
          
          {/* Servings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('recipe.ingredients')}</Text>
              <View style={styles.servingControls}>
                {[1, 2, 3].map(m => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setServingMultiplier(m)}
                    style={[
                      styles.servingButton,
                      servingMultiplier === m && styles.servingButtonActive,
                    ]}
                  >
                    <Text style={[
                      styles.servingButtonText,
                      servingMultiplier === m && styles.servingButtonTextActive,
                    ]}>
                      {m}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {scaledIngredients.map((ing, idx) => {
              const isMissing = missingTokens.has(ing.token);
              return (
                <View 
                  key={idx} 
                  style={[
                    styles.ingredientRow,
                    isMissing && styles.ingredientRowMissing,
                  ]}
                >
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientAmount}>{ing.scaled_amount}</Text>
                  <Text style={styles.ingredientName}>
                    {t(`ingredient.${ing.token}`)}
                  </Text>
                  {ing.note && (
                    <Text style={styles.ingredientNote}>({ing.note})</Text>
                  )}
                  {isMissing && (
                    <Text style={styles.ingredientMissingTag}>🛒</Text>
                  )}
                </View>
              );
            })}
          </View>
          
          {/* Steps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('recipe.steps')}</Text>
            {recipe.steps.map((step, idx) => (
              <View key={step.order} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.order}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                  {step.timer_sec && step.timer_sec > 0 && (
                    <View style={styles.stepTimer}>
                      <Text style={styles.stepTimerText}>
                        ⏲ {Math.floor(step.timer_sec / 60)}{t('common.min_short')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
          
          {/* Tips */}
          {recipe.tips.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('recipe.tips')}</Text>
              {recipe.tips.map((tip, idx) => (
                <View key={idx} style={styles.tipRow}>
                  <Text style={styles.tipIcon}>💡</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
      
      {/* Sticky Cook button */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={handleStartCooking}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>🍳  {t('recipe.start_cooking')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


// Helper: "1 su bardağı" → "2 su bardağı" (basit çarpan)
function scaleAmount(amount: string, multiplier: number): string {
  if (multiplier === 1) return amount;
  
  // Sayı bulup çarp
  const match = amount.match(/^(\d+(?:[.,]\d+)?(?:\/\d+)?)\s*(.*)/);
  if (!match) return amount;
  
  const [, numStr, rest] = match;
  
  // 1/2 gibi kesirler
  if (numStr.includes('/')) {
    const [n, d] = numStr.split('/').map(parseFloat);
    const result = (n / d) * multiplier;
    return `${formatNumber(result)} ${rest}`;
  }
  
  const num = parseFloat(numStr.replace(',', '.'));
  if (isNaN(num)) return amount;
  
  const scaled = num * multiplier;
  return `${formatNumber(scaled)} ${rest}`;
}

function formatNumber(n: number): string {
  if (n === Math.floor(n)) return n.toString();
  if (n < 1) {
    // Yakın kesirleri göster
    if (Math.abs(n - 0.5) < 0.05) return '1/2';
    if (Math.abs(n - 0.25) < 0.05) return '1/4';
    if (Math.abs(n - 0.75) < 0.05) return '3/4';
    if (Math.abs(n - 0.33) < 0.05) return '1/3';
  }
  return n.toFixed(1).replace('.', ',');
}


import { Dimensions } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },
  
  // Hero
  heroContainer: {
    position: 'relative',
  },
  heroButtons: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.base,
    right: theme.spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.card,
  },
  heroButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  
  // Content
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.base,
  },
  ratingText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  
  // Meta cards
  metaCards: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  metaCard: {
    flex: 1,
    backgroundColor: theme.colors.backgroundElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radius.base,
    alignItems: 'center',
    ...theme.shadow.card,
  },
  metaCardIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  metaCardLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  metaCardValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text,
  },
  
  // Missing
  missingWarning: {
    backgroundColor: theme.colors.warning + '20',
    padding: theme.spacing.base,
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  missingTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  missingList: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  // Sections
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  servingControls: {
    flexDirection: 'row',
    gap: 4,
  },
  servingButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundMuted,
  },
  servingButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  servingButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  servingButtonTextActive: {
    color: theme.colors.textInverse,
  },
  
  // Ingredients
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  ingredientRowMissing: {
    backgroundColor: theme.colors.warning + '15',
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  ingredientAmount: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
  },
  ingredientName: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  ingredientNote: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  ingredientMissingTag: {
    fontSize: theme.fontSize.sm,
    marginLeft: 'auto',
  },
  
  // Steps
  stepRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.base,
    gap: theme.spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  stepBody: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 22,
  },
  stepTimer: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing.sm,
  },
  stepTimerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  // Tips
  tipRow: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tipIcon: {
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  
  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.base,
    borderRadius: theme.radius.base,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textInverse,
  },
});
