/**
 * ModeSelectionScreen — ANA EKRAN
 * ===================================
 * Açılışta kullanıcı 3 moddan birini seçer.
 * 
 * Mod 1: Evdeki Kalanlarla
 * Mod 2: 1-2 Ek Malzeme
 * Mod 3: Sınırsız Keşfet
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ModeCard } from '../components/ModeCard';
import { RecipeCardCompact } from '../components/RecipeCardCompact';
import { useAuth } from '../hooks/useAuth';
import { useRecipeOfTheDay } from '../hooks/useRecipeOfTheDay';
import { useLastUsedMode } from '../hooks/useLastUsedMode';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import type { RecommendationMode } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ModeConfig {
  id: RecommendationMode;
  emoji: string;
  titleKey: string;            // i18n key
  subtitleKey: string;
  gradientColors: [string, string];
  iconBgColor: string;
  route: string;
  analyticsName: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'pantry',
    emoji: '🥘',
    titleKey: 'mode.pantry.title',
    subtitleKey: 'mode.pantry.subtitle',
    gradientColors: ['#E8B53B', '#D89A1E'],     // Terracotta sıcak
    iconBgColor: '#FFF4E0',
    route: 'PantryInput',
    analyticsName: 'mode_pantry_selected',
  },
  {
    id: 'supply',
    emoji: '🛒',
    titleKey: 'mode.supply.title',
    subtitleKey: 'mode.supply.subtitle',
    gradientColors: ['#5B8C5A', '#3F6B40'],     // Yeşil
    iconBgColor: '#E8F0E8',
    route: 'SupplyInput',
    analyticsName: 'mode_supply_selected',
  },
  {
    id: 'discover',
    emoji: '🌍',
    titleKey: 'mode.discover.title',
    subtitleKey: 'mode.discover.subtitle',
    gradientColors: ['#4A7A9C', '#2F5773'],     // Mavi
    iconBgColor: '#E0EBF3',
    route: 'Discover',
    analyticsName: 'mode_discover_selected',
  },
];


export default function ModeSelectionScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { recipe: recipeOfTheDay, loading: rotdLoading } = useRecipeOfTheDay();
  const { lastMode } = useLastUsedMode();
  
  // Animasyon: ilk açılışta kartlar yukarıdan kayarak iner
  const [animValues] = useState(() => MODES.map(() => new Animated.Value(0)));
  
  useEffect(() => {
    Animated.stagger(
      80,
      animValues.map((v) =>
        Animated.spring(v, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        })
      )
    ).start();
  }, []);
  
  const handleModeSelect = async (mode: ModeConfig) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analytics.track(mode.analyticsName, { user_id: user?.uid });
    navigation.navigate(mode.route);
  };
  
  const handleRecipePress = (recipeId: string) => {
    analytics.track('rotd_pressed', { recipe_id: recipeId });
    navigation.navigate('RecipeDetail', { recipeId });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {t('mode.greeting', { name: user?.display_name?.split(' ')[0] || '' })}
          </Text>
          <Text style={styles.title}>{t('mode.title')}</Text>
          <Text style={styles.subtitle}>{t('mode.subtitle')}</Text>
        </View>
        
        {/* 3 MOD KARTLARI */}
        <View style={styles.modesContainer}>
          {MODES.map((mode, idx) => (
            <Animated.View
              key={mode.id}
              style={{
                opacity: animValues[idx],
                transform: [
                  {
                    translateY: animValues[idx].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }}
            >
              <ModeCard
                mode={mode}
                isLastUsed={lastMode === mode.id}
                onPress={() => handleModeSelect(mode)}
                title={t(mode.titleKey)}
                subtitle={t(mode.subtitleKey)}
              />
            </Animated.View>
          ))}
        </View>
        
        {/* GÜNÜN TARİFİ */}
        {recipeOfTheDay && (
          <View style={styles.recipeOfTheDay}>
            <Text style={styles.sectionTitle}>{t('mode.recipe_of_the_day')}</Text>
            <RecipeCardCompact
              recipe={recipeOfTheDay}
              onPress={() => handleRecipePress(recipeOfTheDay.id)}
            />
          </View>
        )}
        
        {/* PREMIUM TEASE (free user) */}
        {user?.subscription?.tier === 'free' && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => navigation.navigate('Subscription')}
          >
            <LinearGradient
              colors={['#FFD700', '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumGradient}
            >
              <Text style={styles.premiumEmoji}>👑</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumTitle}>{t('premium.banner_title')}</Text>
                <Text style={styles.premiumSubtitle}>{t('premium.banner_subtitle')}</Text>
              </View>
              <Text style={styles.premiumArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        <View style={{ height: 40 }} />
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
  },
  header: {
    paddingTop: 16,
    paddingBottom: 28,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  modesContainer: {
    gap: 14,
    marginBottom: 32,
  },
  recipeOfTheDay: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  premiumBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  premiumEmoji: {
    fontSize: 32,
  },
  premiumTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  premiumSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 2,
  },
  premiumArrow: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
});
