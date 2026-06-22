/**
 * SupplyResultsScreen — Mod 2 Sonuçları
 * =========================================
 * "1-2 ek malzeme alabilirim" tarifler.
 * 
 * Sıralama varsayılan: az eksik → çok eksik
 * Her tarif "🛒 Eksik: tavuk göğüs, maydanoz" gösterir
 * 
 * Bonus: Toplu alışveriş listesi (premium)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { RecipeCard } from '../components/RecipeCard';
import { EmptyState } from '../components/EmptyState';
import { useRecipeRecommendations } from '../hooks/useRecipeRecommendations';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import type { IngredientToken, RecipeWithMatch, MissingIngredient } from '../types';

type SortMode = 'least_missing' | 'rating' | 'time';

export default function SupplyResultsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const ingredients: IngredientToken[] = route.params?.ingredients || [];
  const [sortMode, setSortMode] = useState<SortMode>('least_missing');
  const [maxMissing, setMaxMissing] = useState<number>(2);
  
  const isPremium = user?.subscription?.tier !== 'free';
  
  const { 
    recipes, 
    loading, 
    refreshing, 
    refresh, 
    loadMore, 
    hasMore,
  } = useRecipeRecommendations({
    mode: 'supply',
    ingredients,
    maxMissing,
    sort: sortMode,
  });
  
  const { favorites, toggleFavorite } = useFavorites();
  
  // Tüm tariflerin eksik malzemelerinden bir alışveriş listesi üret
  const aggregatedShoppingList = useMemo(() => {
    const counts: Record<string, MissingIngredient & { recipe_count: number }> = {};
    
    for (const recipe of recipes) {
      for (const missing of recipe.missing_ingredients || []) {
        if (!counts[missing.token]) {
          counts[missing.token] = { ...missing, recipe_count: 0 };
        }
        counts[missing.token].recipe_count++;
      }
    }
    
    return Object.values(counts).sort((a, b) => b.recipe_count - a.recipe_count);
  }, [recipes]);
  
  const handleRecipePress = useCallback((recipe: RecipeWithMatch, position: number) => {
    analytics.track('recipe_opened', { 
      recipe_id: recipe.id, 
      mode: 'supply',
      missing_count: recipe.missing_count,
      position,
    });
    navigation.navigate('RecipeDetail', { 
      recipeId: recipe.id,
      missing_ingredients: recipe.missing_ingredients,
    });
  }, [navigation]);
  
  const handleShoppingList = useCallback(() => {
    if (!isPremium) {
      navigation.navigate('Subscription', { source: 'shopping_list' });
      return;
    }
    
    analytics.track('shopping_list_opened', { 
      ingredient_count: aggregatedShoppingList.length 
    });
    navigation.navigate('ShoppingList', { 
      items: aggregatedShoppingList,
      source_recipes: recipes.map(r => r.id),
    });
  }, [isPremium, navigation, aggregatedShoppingList, recipes]);
  
  const renderItem = useCallback(({ item, index }: { item: RecipeWithMatch; index: number }) => (
    <RecipeCard
      recipe={item}
      mode="supply"
      isFavorited={favorites.has(item.id)}
      onPress={() => handleRecipePress(item, index)}
      onFavorite={() => toggleFavorite(item.id)}
    />
  ), [favorites, handleRecipePress, toggleFavorite]);
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {loading 
            ? t('results.loading')
            : t('results.supply.title', { count: recipes.length })
          }
        </Text>
        
        {/* Max missing slider (1 or 2) */}
        <View style={styles.maxMissingRow}>
          <Text style={styles.maxMissingLabel}>
            {t('results.supply.max_missing')}:
          </Text>
          {[1, 2, 3].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => setMaxMissing(n)}
              style={[
                styles.maxMissingChip,
                maxMissing === n && styles.maxMissingChipActive,
              ]}
            >
              <Text style={[
                styles.maxMissingText,
                maxMissing === n && styles.maxMissingTextActive,
              ]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Sort */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortContainer}
        >
          {(['least_missing', 'rating', 'time'] as SortMode[]).map(mode => (
            <TouchableOpacity
              key={mode}
              onPress={() => setSortMode(mode)}
              style={[
                styles.sortChip,
                sortMode === mode && styles.sortChipActive,
              ]}
            >
              <Text style={[
                styles.sortText,
                sortMode === mode && styles.sortTextActive,
              ]}>
                {t(`results.sort.${mode}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* List */}
      {recipes.length === 0 && !loading ? (
        <EmptyState
          icon="🛒"
          title={t('results.supply.empty_title')}
          message={t('results.supply.empty_message')}
        />
      ) : (
        <FlashList
          data={recipes}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={refresh}
            />
          }
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.5}
        />
      )}
      
      {/* Sticky shopping list CTA */}
      {recipes.length > 0 && aggregatedShoppingList.length > 0 && (
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleShoppingList}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaIcon}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>
                {t('results.supply.shopping_list')} ({aggregatedShoppingList.length})
              </Text>
              <Text style={styles.ctaSubtitle}>
                {isPremium 
                  ? t('results.supply.shopping_list_subtitle')
                  : t('results.supply.shopping_list_premium')
                }
              </Text>
            </View>
            <Text style={styles.ctaArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  maxMissingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  maxMissingLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  maxMissingChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maxMissingChipActive: {
    backgroundColor: theme.colors.modeSupply,
    borderColor: theme.colors.modeSupply,
  },
  maxMissingText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  maxMissingTextActive: {
    color: theme.colors.textInverse,
  },
  sortContainer: {
    gap: theme.spacing.sm,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortChipActive: {
    backgroundColor: theme.colors.modeSupply,
    borderColor: theme.colors.modeSupply,
  },
  sortText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  sortTextActive: {
    color: theme.colors.textInverse,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 100, // CTA için boşluk
  },
  
  // Sticky CTA
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.modeSupply,
    borderRadius: theme.radius.base,
    padding: theme.spacing.base,
    gap: theme.spacing.md,
  },
  ctaIcon: {
    fontSize: 28,
  },
  ctaTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textInverse,
  },
  ctaSubtitle: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  ctaArrow: {
    color: theme.colors.textInverse,
    fontSize: 20,
    fontWeight: '700',
  },
});
