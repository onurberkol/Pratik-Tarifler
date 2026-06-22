/**
 * IngredientListScreen — Malzeme Listesi Düzenleme
 * ==================================================
 * - Search ile malzeme ara
 * - Sık kullanılanlardan hızlı ekle (chip grid)
 * - Seçilenleri chip listesi olarak göster (silinebilir)
 * - "Tarifleri Göster" CTA en altta sticky
 * 
 * Hem Mod 1 (pantry) hem Mod 2 (supply) için aynı ekran kullanılır,
 * sadece route.params.mode değişir, sonuç ekranı farklı olur.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { IngredientChip } from '../components/IngredientChip';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import { INGREDIENT_CATALOG, FREQUENT_INGREDIENTS } from '../api/ingredients';
import type { IngredientToken, RecommendationMode } from '../types';

interface IngredientItem {
  token: IngredientToken;
  emoji: string;
  label: string;
}

export default function IngredientListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  
  const mode: RecommendationMode = route.params?.mode || 'pantry';
  const initialItems: IngredientToken[] = route.params?.initialItems || [];
  
  const [selectedTokens, setSelectedTokens] = useState<Set<IngredientToken>>(
    new Set(initialItems)
  );
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sık kullanılan malzemeler — emoji ile (top 12)
  const frequentList = useMemo<IngredientItem[]>(() => 
    FREQUENT_INGREDIENTS.map(token => ({
      token,
      emoji: INGREDIENT_CATALOG[token]?.emoji || '🥗',
      label: t(`ingredient.${token}`),
    })), 
    [t]
  );
  
  // Search filtrelemesi
  const searchResults = useMemo<IngredientItem[]>(() => {
    if (!searchQuery.trim()) return [];
    
    const q = searchQuery.toLowerCase();
    return Object.entries(INGREDIENT_CATALOG)
      .filter(([token, data]) => {
        const labelLower = t(`ingredient.${token}`).toLowerCase();
        return labelLower.includes(q) || token.includes(q);
      })
      .slice(0, 8)
      .map(([token, data]) => ({
        token: token as IngredientToken,
        emoji: data.emoji,
        label: t(`ingredient.${token}`),
      }));
  }, [searchQuery, t]);
  
  // Seçili olanlar
  const selectedList = useMemo<IngredientItem[]>(() => 
    Array.from(selectedTokens).map(token => ({
      token,
      emoji: INGREDIENT_CATALOG[token]?.emoji || '🥗',
      label: t(`ingredient.${token}`),
    })), 
    [selectedTokens, t]
  );
  
  const toggleToken = useCallback((token: IngredientToken) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTokens(prev => {
      const next = new Set(prev);
      if (next.has(token)) {
        next.delete(token);
        analytics.track('ingredient_removed', { token });
      } else {
        next.add(token);
        analytics.track('ingredient_added', { token, source: 'manual' });
      }
      return next;
    });
  }, []);
  
  const handleShowResults = useCallback(() => {
    if (selectedTokens.size === 0) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const tokens = Array.from(selectedTokens);
    analytics.track('recipe_search_started', { 
      mode, 
      ingredient_count: tokens.length,
      ingredients: tokens,
    });
    
    const targetScreen = mode === 'supply' ? 'SupplyResults' : 'PantryResults';
    navigation.navigate(targetScreen, { ingredients: tokens });
  }, [selectedTokens, mode, navigation]);
  
  const minIngredients = mode === 'pantry' ? 3 : 2;
  const canProceed = selectedTokens.size >= minIngredients;
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Text style={styles.title}>{t('ingredient_list.title')}</Text>
          <Text style={styles.subtitle}>
            {t(mode === 'supply' 
              ? 'ingredient_list.subtitle_supply' 
              : 'ingredient_list.subtitle_pantry'
            )}
          </Text>
          
          {/* Search */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={t('ingredient_list.search_placeholder')}
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.searchClear}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('ingredient_list.search_results')}
              </Text>
              <View style={styles.chipGrid}>
                {searchResults.map(item => (
                  <IngredientChip
                    key={item.token}
                    emoji={item.emoji}
                    label={item.label}
                    selected={selectedTokens.has(item.token)}
                    onPress={() => toggleToken(item.token)}
                  />
                ))}
              </View>
            </View>
          )}
          
          {/* Sık Kullanılanlar */}
          {searchQuery.length === 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('ingredient_list.frequent')}
              </Text>
              <View style={styles.chipGrid}>
                {frequentList.map(item => (
                  <IngredientChip
                    key={item.token}
                    emoji={item.emoji}
                    label={item.label}
                    selected={selectedTokens.has(item.token)}
                    onPress={() => toggleToken(item.token)}
                  />
                ))}
              </View>
            </View>
          )}
          
          {/* Seçilenler */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t('ingredient_list.selected', { count: selectedTokens.size })}
              </Text>
              {selectedTokens.size > 0 && (
                <TouchableOpacity 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedTokens(new Set());
                  }}
                >
                  <Text style={styles.clearAll}>{t('common.clear_all')}</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {selectedTokens.size === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👆</Text>
                <Text style={styles.emptyText}>
                  {t('ingredient_list.empty_hint')}
                </Text>
              </View>
            ) : (
              <View style={styles.chipGrid}>
                {selectedList.map(item => (
                  <IngredientChip
                    key={item.token}
                    emoji={item.emoji}
                    label={item.label}
                    selected
                    removable
                    onPress={() => toggleToken(item.token)}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
        
        {/* Sticky CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[
              styles.ctaButton,
              !canProceed && styles.ctaButtonDisabled,
            ]}
            onPress={handleShowResults}
            disabled={!canProceed}
            activeOpacity={0.85}
          >
            <Text style={[
              styles.ctaText,
              !canProceed && styles.ctaTextDisabled,
            ]}>
              {selectedTokens.size < minIngredients
                ? t('ingredient_list.need_more', { 
                    need: minIngredients - selectedTokens.size 
                  })
                : t('ingredient_list.show_recipes', { 
                    count: selectedTokens.size 
                  })
              }
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.base,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    fontSize: 18,
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
    padding: 4,
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
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  clearAll: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    fontWeight: '500',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  
  // Empty
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.backgroundMuted,
    borderRadius: theme.radius.base,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    ...theme.shadow.cardElevated,
  },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.base,
    padding: theme.spacing.base,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: theme.colors.backgroundMuted,
  },
  ctaText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textInverse,
  },
  ctaTextDisabled: {
    color: theme.colors.textMuted,
  },
});
