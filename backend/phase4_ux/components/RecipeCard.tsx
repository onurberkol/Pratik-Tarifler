/**
 * RecipeCard — Liste İçin Tarif Kartı
 * ========================================
 * Mod 1 (pantry):    "✓ Tüm malzemen var (5/5)"
 * Mod 2 (supply):    "🛒 1 eksik: tavuk göğüs"
 * Mod 3 (discover):  Standart kart
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { BlurImage } from './BlurImage';
import { theme } from '../styles/theme';
import type { RecipeWithMatch, RecommendationMode, MissingIngredient } from '../types';

interface RecipeCardProps {
  recipe: RecipeWithMatch;
  mode: RecommendationMode;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
}

export function RecipeCard({ recipe, mode, onPress, onFavorite, isFavorited }: RecipeCardProps) {
  const { t } = useTranslation();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Sol: Görsel */}
      <BlurImage
        url={recipe.image?.url_full}
        thumbUrl={recipe.image?.url_thumb}
        blurHash={recipe.image?.blur_hash}
        width={90}
        height={90}
        style={styles.image}
      />
      
      {/* Orta: İçerik */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        
        {/* Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>⭐ {recipe.rating_avg.toFixed(1)}</Text>
          <Text style={styles.metaSeparator}>•</Text>
          <Text style={styles.metaItem}>⏱ {recipe.total_time_min}{t('common.min_short')}</Text>
          <Text style={styles.metaSeparator}>•</Text>
          <Text style={styles.metaItem}>
            {t(`difficulty.${recipe.difficulty}`)}
          </Text>
        </View>
        
        {/* Mod-specific badge */}
        {mode === 'pantry' && recipe.match_percentage === 100 && (
          <View style={styles.matchBadgeFull}>
            <Text style={styles.matchTextFull}>
              ✓ {t('mode.pantry.full_match', { 
                count: recipe.uses_ingredients?.length || 0 
              })}
            </Text>
          </View>
        )}
        
        {mode === 'supply' && recipe.missing_ingredients && recipe.missing_count! > 0 && (
          <View style={styles.missingBadge}>
            <Text style={styles.missingText} numberOfLines={1}>
              🛒 {t('mode.supply.missing', { count: recipe.missing_count })}: {' '}
              {recipe.missing_ingredients
                .slice(0, 2)
                .map((m: MissingIngredient) => m.label_localized)
                .join(', ')
              }
              {recipe.missing_count! > 2 && ` +${recipe.missing_count! - 2}`}
            </Text>
          </View>
        )}
        
        {/* Premium badge */}
        {recipe.is_premium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>👑 Premium</Text>
          </View>
        )}
      </View>
      
      {/* Sağ: Favorite */}
      {onFavorite && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onFavorite();
          }}
          style={styles.favoriteButton}
          hitSlop={10}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorited ? '❤️' : '🤍'}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}


const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.base,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadow.card,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.97,
  },
  image: {
    borderRadius: theme.radius.md,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  metaItem: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  metaSeparator: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginHorizontal: 6,
  },
  
  // Mod 1 — Full match
  matchBadgeFull: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  matchTextFull: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    fontWeight: '600',
  },
  
  // Mod 2 — Missing
  missingBadge: {
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    maxWidth: '100%',
  },
  missingText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  
  // Premium
  premiumBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.premium + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  premiumText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.premium,
    fontWeight: '700',
  },
  
  // Favorite
  favoriteButton: {
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  favoriteIcon: {
    fontSize: 22,
  },
});
