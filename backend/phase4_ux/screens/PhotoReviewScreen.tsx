/**
 * PhotoReviewScreen — Vision Sonucu İnceleme
 * ===============================================
 * - Çekilen fotoğraf thumbnail
 * - Vision API tarafından tespit edilen malzemeler (chip)
 * - Kullanıcı silebilir / yenisini ekleyebilir
 * - "Tarifleri Göster" → Results ekranına gider
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { IngredientChip } from '../components/IngredientChip';
import { usePantryScan } from '../hooks/index';
import { useDailyScanLimit } from '../hooks/index';
import { INGREDIENT_CATALOG } from '../api/ingredients';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import type { IngredientToken, RecommendationMode, DetectedIngredient } from '../types';

export default function PhotoReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  
  const photoUri: string = route.params?.photoUri;
  const mode: RecommendationMode = route.params?.mode || 'pantry';
  
  const { scan, scanning, result } = usePantryScan();
  const { incrementScan } = useDailyScanLimit();
  
  const [detectedTokens, setDetectedTokens] = useState<Set<IngredientToken>>(new Set());
  const [scanStartTime, setScanStartTime] = useState<number>(0);
  
  // İlk açılışta scan başlat
  useEffect(() => {
    if (photoUri) {
      setScanStartTime(Date.now());
      scan(photoUri).then(response => {
        if (response) {
          const tokens = response.detected_ingredients.map(d => d.token);
          setDetectedTokens(new Set(tokens));
          incrementScan();
          
          const scanTime = Date.now() - scanStartTime;
          analytics.scanCompleted(tokens.length, scanTime);
        }
      });
    }
  }, [photoUri]);
  
  const toggleToken = (token: IngredientToken) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetectedTokens(prev => {
      const next = new Set(prev);
      if (next.has(token)) {
        next.delete(token);
        analytics.ingredientRemoved(token);
      }
      return next;
    });
  };
  
  const handleAddMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('IngredientList', { 
      mode, 
      initialItems: Array.from(detectedTokens) 
    });
  };
  
  const handleProceed = () => {
    if (detectedTokens.size < 2) {
      Alert.alert(
        t('photo_review.not_enough_title'),
        t('photo_review.not_enough_message'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('photo_review.add_more'), onPress: handleAddMore },
        ]
      );
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const tokens = Array.from(detectedTokens);
    analytics.track('recipe_search_started', { 
      mode, 
      ingredient_count: tokens.length,
      source: 'photo_scan',
    });
    
    const targetScreen = mode === 'supply' ? 'SupplyResults' : 'PantryResults';
    navigation.replace(targetScreen, { ingredients: tokens });
  };
  
  // Detected items with metadata
  const detectedList = useMemo(() => {
    if (!result) return [];
    return result.detected_ingredients
      .filter(d => detectedTokens.has(d.token))
      .map(d => ({
        ...d,
        emoji: INGREDIENT_CATALOG[d.token]?.emoji || '🥗',
        label: t(`ingredient.${d.token}`),
      }));
  }, [result, detectedTokens, t]);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('photo_review.title')}</Text>
        </View>
        
        {/* Photo preview */}
        <View style={styles.photoContainer}>
          <ExpoImage 
            source={{ uri: photoUri }}
            style={styles.photo}
            contentFit="cover"
          />
          {scanning && (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.scanningText}>{t('photo_review.scanning')}</Text>
            </View>
          )}
        </View>
        
        {/* Detected count */}
        {result && (
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>✓</Text>
            <Text style={styles.statusText}>
              {t('photo_review.detected_count', { count: detectedTokens.size })}
            </Text>
          </View>
        )}
        
        {/* Detected ingredients */}
        {result && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('photo_review.detected_ingredients')}
            </Text>
            <Text style={styles.sectionHint}>
              {t('photo_review.detected_hint')}
            </Text>
            
            <View style={styles.chipGrid}>
              {detectedList.map(item => (
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
          </View>
        )}
        
        {/* Add more */}
        <TouchableOpacity 
          style={styles.addMoreButton}
          onPress={handleAddMore}
        >
          <Text style={styles.addMoreIcon}>+</Text>
          <Text style={styles.addMoreText}>
            {t('photo_review.add_missing_ingredient')}
          </Text>
        </TouchableOpacity>
        
        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            {t('photo_review.tip')}
          </Text>
        </View>
      </ScrollView>
      
      {/* Sticky CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            (scanning || detectedTokens.size < 2) && styles.ctaButtonDisabled,
          ]}
          onPress={handleProceed}
          disabled={scanning || detectedTokens.size < 2}
        >
          <Text style={[
            styles.ctaText,
            (scanning || detectedTokens.size < 2) && styles.ctaTextDisabled,
          ]}>
            {scanning
              ? t('photo_review.scanning')
              : detectedTokens.size < 2
                ? t('photo_review.need_more')
                : t('photo_review.show_recipes', { count: detectedTokens.size })
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
  },
  backButton: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  
  // Photo
  photoContainer: {
    marginHorizontal: theme.spacing.lg,
    height: 200,
    borderRadius: theme.radius.base,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundMuted,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  scanningText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  
  // Status
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  statusIcon: {
    fontSize: 22,
    color: theme.colors.success,
    fontWeight: '700',
  },
  statusText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '600',
  },
  
  // Sections
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  
  // Add more
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.base,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  addMoreIcon: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  addMoreText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  // Tip
  tipCard: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.base,
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
