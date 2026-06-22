/**
 * PantryResultsScreen — Mod 1 Sonuçları
 * ========================================
 * "Elimde olan malzemelerle yapılabilecek" tarifler.
 * 
 * Tüm sonuçlar tarif'in TÜM tokenları kullanıcıda var demek.
 * Sonuçlar rating_avg'a göre sıralı.
 * 
 * Boş sonuç durumunda kullanıcıya alternatif öner:
 *   - 1-2 malzeme daha ekle → Mod 2'ye geç
 *   - Filtreleri gevşet
 */

import React, { useState, useCallback } from 'react';
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
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import type { IngredientToken, RecipeWithMatch } from '../types';

type SortMode = 'best_match' | 'time' | 'rating';

export default function PantryResultsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  
  const ingredients: IngredientToken[] = route.params?.ingredients || [];
  const [sortMode, setSortMode] = useState<SortMode>('best_match');
  
  const { 
    recipes, 
    loading, 
    refreshing, 
    refresh, 
    loadMore, 
    hasMore, 
    error 
  } = useRecipeRecommendations({
    mode: 'pantry',
    ingredients,
    sort: sortMode,
  });
  
  const { favorites, toggleFavorite } = useFavorites();
  
  const handleRecipePress = useCallback((recipe: RecipeWithMatch, position: number) => {
    analytics.track('recipe_opened', { 
      recipe_id: recipe.id, 
      mode: 'pantry', 
      position 
    });
    navigation.navigate('RecipeDetail', { recipeId: recipe.id });
  }, [navigation]);
  
  const handleSwitchToSupply = useCallback(() => {
    analytics.track('mode_switch', { from: 'pantry', to: 'supply' });
    navigation.replace('SupplyResults', { ingredients });
  }, [navigation, ingredients]);
  
  const renderItem = useCallback(({ item, index }: { item: RecipeWithMatch; index: number }) => (
    <RecipeCard
      recipe={item}
      mode="pantry"
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
            : t('results.pantry.title', { 
                count: recipes.length,
                ingredientCount: ingredients.length,
              })
          }
        </Text>
        
        {/* Sort */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortContainer}
        >
          {(['best_match', 'time', 'rating'] as SortMode[]).map(mode => (
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
          icon="🥘"
          title={t('results.pantry.empty_title')}
          message={t('results.pantry.empty_message')}
          actionLabel={t('results.pantry.switch_to_supply')}
          onAction={handleSwitchToSupply}
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
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            <View style={styles.footer}>
              {/* Cross-sell to Mod 2 */}
              <View style={styles.crossSellCard}>
                <Text style={styles.crossSellIcon}>💡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.crossSellTitle}>
                    {t('results.pantry.cross_sell_title')}
                  </Text>
                  <Text style={styles.crossSellMessage}>
                    {t('results.pantry.cross_sell_message')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.crossSellButton}
                  onPress={handleSwitchToSupply}
                >
                  <Text style={styles.crossSellButtonText}>
                    🛒 {t('results.pantry.cross_sell_cta')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
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
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
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
    paddingBottom: theme.spacing.xxl,
  },
  footer: {
    paddingVertical: theme.spacing.lg,
  },
  
  // Cross-sell
  crossSellCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.base,
    borderRadius: theme.radius.base,
    gap: theme.spacing.md,
  },
  crossSellIcon: {
    fontSize: 24,
  },
  crossSellTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  crossSellMessage: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  crossSellButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
  },
  crossSellButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});
