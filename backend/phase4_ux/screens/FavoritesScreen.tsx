/**
 * FavoritesScreen — Favori Tarifler
 * =====================================
 * - Kullanıcının kaydettiği tarifleri listeler
 * - Boş durumda CTA: "Tarifleri keşfet"
 * - Pişirme geçmişi tab'ı (premium için sınırsız)
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

import { RecipeCard } from '../components/RecipeCard';
import { EmptyState } from '../components/EmptyState';
import { useAuth, useFavorites } from '../hooks';
import { db } from '../api/client';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import type { Recipe, RecipeWithMatch } from '../types';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const { firebaseUser, user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchFavorites = useCallback(async (isRefresh = false) => {
    if (!firebaseUser) {
      setRecipes([]);
      setLoading(false);
      return;
    }
    
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      // 1. Favori ID'leri al, en yeni en üstte
      const favRef = collection(db, `users/${firebaseUser.uid}/favorites`);
      const q = query(favRef, orderBy('added_at', 'desc'));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setRecipes([]);
        return;
      }
      
      const favoriteIds = snap.docs.map(d => d.id);
      
      // 2. Tarif detaylarını paralel al
      const { getRecipe } = await import('../api/client');
      const recipePromises = favoriteIds.map(id => 
        getRecipe(id, i18n.language as any).catch(() => null)
      );
      const fetchedRecipes = (await Promise.all(recipePromises)).filter(Boolean) as Recipe[];
      
      setRecipes(fetchedRecipes);
    } catch (e) {
      analytics.error(e as Error, { context: 'favorites_fetch' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [firebaseUser, i18n.language]);
  
  // Her ekrana gelindiğinde yenile (favori toggle sonrası)
  useFocusEffect(
    useCallback(() => {
      fetchFavorites(false);
    }, [fetchFavorites])
  );
  
  const handleRecipePress = useCallback((recipe: Recipe) => {
    analytics.track('recipe_opened', { 
      recipe_id: recipe.id, 
      source: 'favorites' 
    });
    navigation.navigate('RecipeDetail', { recipeId: recipe.id });
  }, [navigation]);
  
  if (!firebaseUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('favorites.title')}</Text>
        </View>
        <EmptyState
          icon="🔒"
          title={t('favorites.signin_required_title')}
          message={t('favorites.signin_required_message')}
          actionLabel={t('auth.sign_in')}
          onAction={() => navigation.navigate('Auth', { screen: 'SignIn' })}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('favorites.title')}</Text>
        {recipes.length > 0 && (
          <Text style={styles.count}>
            {t('favorites.count', { count: recipes.length })}
          </Text>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : recipes.length === 0 ? (
        <EmptyState
          icon="⭐"
          title={t('favorites.empty_title')}
          message={t('favorites.empty_message')}
          actionLabel={t('favorites.discover_cta')}
          onAction={() => navigation.navigate('Home', { screen: 'ModeSelection' })}
        />
      ) : (
        <FlashList
          data={recipes}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item as RecipeWithMatch}
              mode="discover"
              isFavorited={favorites.has(item.id)}
              onPress={() => handleRecipePress(item)}
              onFavorite={() => toggleFavorite(item.id)}
            />
          )}
          keyExtractor={item => item.id}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => fetchFavorites(true)}
              tintColor={theme.colors.primary}
            />
          }
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
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  count: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
});
