/**
 * SearchScreen — Filtreli Arama (Mod 3)
 * ========================================
 * - Search bar (top)
 * - Filtre chip'leri (cuisine, meal type, diet, time, difficulty)
 * - 2 sütun grid sonuçlar
 * - Sonsuz scroll
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Pressable,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { BlurImage } from '../components/BlurImage';
import { EmptyState } from '../components/EmptyState';
import { useDebounce } from '../hooks';
import { searchRecipes } from '../api/client';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import type { Recipe, Cuisine, MealType, DietTag, Difficulty, SearchFilters } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const CUISINES: { value: Cuisine; label: string }[] = [
  { value: 'turkish', label: '🇹🇷 Türk' },
  { value: 'italian', label: '🇮🇹 İtalyan' },
  { value: 'mediterranean', label: '🌊 Akdeniz' },
  { value: 'french', label: '🇫🇷 Fransız' },
  { value: 'middle_eastern', label: '🕌 Orta Doğu' },
];

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'soup', 'dessert'];
const DIET_TAGS: DietTag[] = ['vegetarian', 'vegan', 'gluten_free'];
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  
  const initialFilters: Partial<SearchFilters> = route.params?.initialFilters || {};
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    cuisine: initialFilters.cuisine,
    meal_type: initialFilters.meal_type,
    diet_tags: initialFilters.diet_tags,
    max_time_min: initialFilters.max_time_min,
    difficulty: initialFilters.difficulty,
  });
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const fetchRecipes = useCallback(async (isInitial: boolean = false) => {
    if (loading || (!isInitial && !hasMore)) return;
    
    setLoading(true);
    try {
      const { recipes: fetched, cursor: newCursor } = await searchRecipes(
        { ...filters, search_query: debouncedQuery },
        'tr',
        isInitial ? undefined : cursor,
        20
      );
      
      if (isInitial) {
        setRecipes(fetched);
      } else {
        setRecipes(prev => [...prev, ...fetched]);
      }
      
      setCursor(newCursor);
      setHasMore(fetched.length >= 20);
      
      if (isInitial) {
        analytics.searchPerformed(debouncedQuery, Object.values(filters).filter(Boolean).length);
      }
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedQuery, cursor, hasMore, loading]);
  
  // İlk yükleme + filtre değişince
  useEffect(() => {
    setRecipes([]);
    setCursor(null);
    setHasMore(true);
    fetchRecipes(true);
  }, [filters, debouncedQuery]);
  
  const toggleFilter = useCallback(<K extends keyof SearchFilters>(
    key: K, 
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);
  
  const activeFilterCount = useMemo(() => 
    Object.values(filters).filter(v => v !== undefined && v !== null && 
      (Array.isArray(v) ? v.length > 0 : true)).length,
    [filters]
  );
  
  const renderCard = useCallback(({ item }: { item: Recipe }) => (
    <Pressable
      style={styles.card}
      onPress={() => {
        analytics.recipeOpened(item.id, 'search', recipes.indexOf(item));
        navigation.navigate('RecipeDetail', { recipeId: item.id });
      }}
    >
      <BlurImage
        url={item.image?.url_full}
        thumbUrl={item.image?.url_thumb}
        blurHash={item.image?.blur_hash}
        width={CARD_WIDTH}
        height={CARD_WIDTH}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardMetaItem}>⭐ {item.rating_avg.toFixed(1)}</Text>
          <Text style={styles.cardMetaItem}>⏱ {item.total_time_min}{t('common.min_short')}</Text>
        </View>
      </View>
    </Pressable>
  ), [navigation, t]);
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('discover.search_placeholder')}
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {activeFilterCount > 0 && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearText}>{t('common.clear_all')}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Filtreler */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {/* Cuisine */}
        {CUISINES.map(c => (
          <FilterChip
            key={c.value}
            label={c.label}
            active={filters.cuisine === c.value}
            onPress={() => toggleFilter('cuisine', c.value)}
          />
        ))}
        
        {/* Diet */}
        {DIET_TAGS.map(d => (
          <FilterChip
            key={d}
            label={t(`ingredient.${d}`) || d}
            active={filters.diet_tags?.includes(d)}
            onPress={() => setFilters(prev => ({
              ...prev,
              diet_tags: prev.diet_tags?.includes(d)
                ? prev.diet_tags.filter(t => t !== d)
                : [...(prev.diet_tags || []), d],
            }))}
          />
        ))}
        
        {/* Difficulty */}
        {DIFFICULTIES.map(d => (
          <FilterChip
            key={d}
            label={t(`difficulty.${d}`)}
            active={filters.difficulty === d}
            onPress={() => toggleFilter('difficulty', d)}
          />
        ))}
        
        {/* Quick time filters */}
        {[15, 30, 60].map(time => (
          <FilterChip
            key={`time_${time}`}
            label={`≤ ${time} ${t('common.min_short')}`}
            active={filters.max_time_min === time}
            onPress={() => toggleFilter('max_time_min', time)}
          />
        ))}
      </ScrollView>
      
      {/* Results count */}
      {recipes.length > 0 && !loading && (
        <Text style={styles.resultsCount}>
          {recipes.length} {t('results.found') || 'sonuç'}
        </Text>
      )}
      
      {/* Results */}
      {recipes.length === 0 && !loading ? (
        <EmptyState
          icon="🔍"
          title={t('search.empty_title') || 'Sonuç yok'}
          message={t('search.empty_message') || 'Farklı bir arama dene'}
          actionLabel={activeFilterCount > 0 ? t('common.clear_all') : undefined}
          onAction={activeFilterCount > 0 ? clearFilters : undefined}
        />
      ) : (
        <FlashList
          data={recipes}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          numColumns={2}
          estimatedItemSize={CARD_WIDTH + 50}
          contentContainerStyle={styles.gridContent}
          onEndReached={hasMore ? () => fetchRecipes(false) : undefined}
          onEndReachedThreshold={0.5}
        />
      )}
    </SafeAreaView>
  );
}


function FilterChip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterChip,
        active && styles.filterChipActive,
      ]}
    >
      <Text style={[
        styles.filterChipText,
        active && styles.filterChipTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Search
  searchHeader: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.base,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    padding: 0,
  },
  searchClear: {
    fontSize: 16,
    color: theme.colors.textMuted,
    paddingLeft: theme.spacing.sm,
  },
  clearButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  clearText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  
  // Filters
  filtersScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: theme.colors.textInverse,
    fontWeight: '600',
  },
  
  // Results
  resultsCount: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  gridContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  cardImage: {
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing.sm,
  },
  cardContent: {
    paddingHorizontal: 2,
  },
  cardTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  cardMetaItem: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
});
