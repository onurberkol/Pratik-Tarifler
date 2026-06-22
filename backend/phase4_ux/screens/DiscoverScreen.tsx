/**
 * DiscoverScreen — Mod 3 Sınırsız Keşif
 * =========================================
 * - Hero: Günün tarifi (büyük)
 * - Yatay scroll: Mutfaklar
 * - Yatay scroll: Hızlı (≤15dk)
 * - Yatay scroll: Vejetaryen
 * - Yatay scroll: Türk tatlıları
 * - Yatay scroll: Sezonluk
 * - "Tüm tarifleri ara" CTA → SearchScreen
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { BlurImage } from '../components/BlurImage';
import { useRecipeOfTheDay } from '../hooks/useRecipeOfTheDay';
import { useDiscoverFeed } from '../hooks/useDiscoverFeed';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import type { Recipe, Cuisine, MealType, DietTag } from '../types';

const CUISINES: { code: Cuisine; flag: string }[] = [
  { code: 'turkish', flag: '🇹🇷' },
  { code: 'italian', flag: '🇮🇹' },
  { code: 'french', flag: '🇫🇷' },
  { code: 'mediterranean', flag: '🌊' },
  { code: 'middle_eastern', flag: '🕌' },
  { code: 'mexican', flag: '🇲🇽' },
  { code: 'indian', flag: '🇮🇳' },
  { code: 'japanese', flag: '🇯🇵' },
];

export default function DiscoverScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  
  const { recipe: recipeOfTheDay } = useRecipeOfTheDay();
  
  // Farklı feed kategorileri
  const { recipes: quickRecipes } = useDiscoverFeed({ maxTime: 15 });
  const { recipes: vegetarianRecipes } = useDiscoverFeed({ dietTag: 'vegetarian' });
  const { recipes: turkishDesserts } = useDiscoverFeed({ 
    cuisine: 'turkish', 
    mealType: 'dessert' 
  });
  const { recipes: trending } = useDiscoverFeed({ sort: 'trending' });
  
  const handleRecipePress = useCallback((recipe: Recipe, source: string, position: number) => {
    analytics.track('recipe_opened', { 
      recipe_id: recipe.id, 
      mode: 'discover',
      source,
      position,
    });
    navigation.navigate('RecipeDetail', { recipeId: recipe.id });
  }, [navigation]);
  
  const handleCuisinePress = useCallback((cuisine: Cuisine) => {
    analytics.track('cuisine_browsed', { cuisine });
    navigation.navigate('Search', { 
      initialFilters: { cuisine } 
    });
  }, [navigation]);
  
  const handleAllRecipes = useCallback(() => {
    analytics.track('all_recipes_opened');
    navigation.navigate('Search');
  }, [navigation]);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search button (top) */}
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={handleAllRecipes}
          activeOpacity={0.7}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>
            {t('discover.search_placeholder')}
          </Text>
        </TouchableOpacity>
        
        {/* HERO: Günün Tarifi */}
        {recipeOfTheDay && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('discover.recipe_of_the_day')}</Text>
            <Pressable
              style={styles.heroCard}
              onPress={() => handleRecipePress(recipeOfTheDay, 'rotd', 0)}
            >
              <BlurImage
                url={recipeOfTheDay.image?.url_full}
                thumbUrl={recipeOfTheDay.image?.url_thumb}
                blurHash={recipeOfTheDay.image?.blur_hash}
                width={SCREEN_WIDTH - 40}
                height={220}
                style={styles.heroImage}
              />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>{recipeOfTheDay.title}</Text>
                <View style={styles.heroMeta}>
                  <Text style={styles.heroMetaItem}>
                    ⭐ {recipeOfTheDay.rating_avg.toFixed(1)}
                  </Text>
                  <Text style={styles.heroMetaItem}>
                    ⏱ {recipeOfTheDay.total_time_min}{t('common.min_short')}
                  </Text>
                  <Text style={styles.heroMetaItem}>
                    {t(`difficulty.${recipeOfTheDay.difficulty}`)}
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        )}
        
        {/* CUISINES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('discover.cuisines')}</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContent}
          >
            {CUISINES.map(({ code, flag }) => (
              <Pressable
                key={code}
                style={styles.cuisineCard}
                onPress={() => handleCuisinePress(code)}
              >
                <Text style={styles.cuisineFlag}>{flag}</Text>
                <Text style={styles.cuisineLabel}>
                  {t(`cuisine.${code}`)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        
        {/* QUICK RECIPES */}
        {quickRecipes.length > 0 && (
          <HorizontalRecipeRow
            title={t('discover.quick_recipes')}
            recipes={quickRecipes}
            onPress={(r, i) => handleRecipePress(r, 'quick', i)}
          />
        )}
        
        {/* VEGETARIAN */}
        {vegetarianRecipes.length > 0 && (
          <HorizontalRecipeRow
            title={t('discover.vegetarian_favorites')}
            recipes={vegetarianRecipes}
            onPress={(r, i) => handleRecipePress(r, 'vegetarian', i)}
          />
        )}
        
        {/* TURKISH DESSERTS */}
        {turkishDesserts.length > 0 && (
          <HorizontalRecipeRow
            title={t('discover.turkish_desserts')}
            recipes={turkishDesserts}
            onPress={(r, i) => handleRecipePress(r, 'turkish_desserts', i)}
          />
        )}
        
        {/* TRENDING */}
        {trending.length > 0 && (
          <HorizontalRecipeRow
            title={t('discover.trending')}
            recipes={trending}
            onPress={(r, i) => handleRecipePress(r, 'trending', i)}
          />
        )}
        
        {/* Tüm tarifleri ara CTA */}
        <TouchableOpacity 
          style={styles.allRecipesCta}
          onPress={handleAllRecipes}
        >
          <Text style={styles.allRecipesIcon}>📚</Text>
          <Text style={styles.allRecipesText}>
            {t('discover.browse_all', { count: 2500 })}
          </Text>
          <Text style={styles.allRecipesArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}


// ============================================================
// HorizontalRecipeRow Component
// ============================================================
function HorizontalRecipeRow({
  title,
  recipes,
  onPress,
}: {
  title: string;
  recipes: Recipe[];
  onPress: (recipe: Recipe, index: number) => void;
}) {
  const { t } = useTranslation();
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContent}
      >
        {recipes.map((recipe, index) => (
          <Pressable
            key={recipe.id}
            style={styles.compactCard}
            onPress={() => onPress(recipe, index)}
          >
            <BlurImage
              url={recipe.image?.url_full}
              thumbUrl={recipe.image?.url_thumb}
              blurHash={recipe.image?.blur_hash}
              width={150}
              height={150}
              style={styles.compactImage}
            />
            <Text style={styles.compactTitle} numberOfLines={2}>
              {recipe.title}
            </Text>
            <View style={styles.compactMeta}>
              <Text style={styles.compactMetaText}>⭐ {recipe.rating_avg.toFixed(1)}</Text>
              <Text style={styles.compactMetaText}>⏱ {recipe.total_time_min}{t('common.min_short')}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}


import { Dimensions } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxxl,
  },
  
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.card,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  searchPlaceholder: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  
  // Sections
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  horizontalListContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  
  // Hero
  heroCard: {
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadow.cardElevated,
  },
  heroImage: {
    borderRadius: theme.radius.lg,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.base,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heroTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.textInverse,
    marginBottom: 6,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: theme.spacing.base,
  },
  heroMetaItem: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textInverse,
    fontWeight: '500',
  },
  
  // Cuisine
  cuisineCard: {
    width: 88,
    height: 100,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.base,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.card,
  },
  cuisineFlag: {
    fontSize: 36,
    marginBottom: 4,
  },
  cuisineLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    fontWeight: '600',
  },
  
  // Horizontal Recipe Card
  compactCard: {
    width: 150,
  },
  compactImage: {
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing.sm,
  },
  compactTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  compactMeta: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  compactMetaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  
  // All recipes CTA
  allRecipesCta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.modeDiscover + '15',
    borderRadius: theme.radius.base,
    borderWidth: 1.5,
    borderColor: theme.colors.modeDiscover,
    gap: theme.spacing.md,
  },
  allRecipesIcon: {
    fontSize: 24,
  },
  allRecipesText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.modeDiscover,
  },
  allRecipesArrow: {
    fontSize: 20,
    color: theme.colors.modeDiscover,
    fontWeight: '700',
  },
});
