/**
 * CookModeScreen — Adım Adım Pişirme Modu
 * ============================================
 * - Büyük yazı (eller meşgul, gözle okur)
 * - Adım numarası + tam talimat
 * - Otomatik timer (varsa)
 * - TTS sesli okuma (opsiyonel)
 * - Wake-lock (ekran kapanmasın)
 * - Önceki/Sonraki navigation
 * - Adım tamamlandı işaretleme
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

import { useRecipe } from '../hooks';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';

export default function CookModeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t, i18n } = useTranslation();
  
  const recipeId: string = route.params?.recipeId;
  const { recipe, loading } = useRecipe(recipeId);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [ttsEnabled, setTtsEnabled] = useState(false);
  
  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Wake-lock (ekran kapanmasın)
  useEffect(() => {
    activateKeepAwakeAsync('cook_mode');
    return () => {
      deactivateKeepAwake('cook_mode');
      // Timer cleanup
      if (timerRef.current) clearInterval(timerRef.current);
      // TTS cleanup
      Speech.stop();
    };
  }, []);
  
  // Cook mode başladığında log
  useEffect(() => {
    if (recipe) {
      analytics.recipeCooked(recipe.id);
    }
  }, [recipe?.id]);
  
  // Step değişince TTS oku
  useEffect(() => {
    if (recipe && ttsEnabled) {
      const step = recipe.steps[currentStep];
      if (step) {
        Speech.stop();
        Speech.speak(`${t('cook_mode.step')} ${step.order}. ${step.title}. ${step.body}`, {
          language: i18n.language,
          rate: 0.9,
        });
      }
    }
  }, [currentStep, ttsEnabled, recipe]);
  
  // Step değişince timer'ı reset et
  useEffect(() => {
    if (recipe) {
      const step = recipe.steps[currentStep];
      if (step?.timer_sec && step.timer_sec > 0) {
        setTimerRemaining(step.timer_sec);
        setTimerActive(false);
      } else {
        setTimerRemaining(0);
        setTimerActive(false);
      }
    }
  }, [currentStep, recipe]);
  
  // Timer tick
  useEffect(() => {
    if (timerActive && timerRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            // Timer bitti — bildirim
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Speech.speak(t('cook_mode.timer_done'), { language: i18n.language });
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [timerActive, timerRemaining]);
  
  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  
  const handleNext = useCallback(() => {
    if (!recipe) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Mevcut adımı tamamlandı işaretle
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Tüm adımlar tamamlandı → tarif tamamlandı modal
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      analytics.track('recipe_completed', { recipe_id: recipe.id });
      navigation.replace('RatingPrompt', { recipeId: recipe.id });
    }
  }, [recipe, currentStep, navigation]);
  
  const handleExit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);
  
  const toggleTimer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimerActive(prev => !prev);
  }, []);
  
  const toggleTts = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (ttsEnabled) {
      Speech.stop();
    }
    setTtsEnabled(prev => !prev);
  }, [ttsEnabled]);
  
  if (loading || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const step = recipe.steps[currentStep];
  const totalSteps = recipe.steps.length;
  const progress = (currentStep + 1) / totalSteps;
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topButton} onPress={handleExit}>
          <Text style={styles.topButtonIcon}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {t('cook_mode.step')} {currentStep + 1}/{totalSteps}
          </Text>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressBarFill,
              { width: `${progress * 100}%` }
            ]} />
          </View>
        </View>
        
        <TouchableOpacity style={styles.topButton} onPress={toggleTts}>
          <Text style={styles.topButtonIcon}>
            {ttsEnabled ? '🔊' : '🔇'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.stepNumber}>
          {t('cook_mode.step_n', { n: step.order })}
        </Text>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepBody}>{step.body}</Text>
        
        {/* Timer */}
        {step.timer_sec && step.timer_sec > 0 && (
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>⏲ {t('cook_mode.timer')}</Text>
            <Text style={styles.timerDisplay}>
              {formatTime(timerRemaining)}
            </Text>
            <TouchableOpacity 
              style={[
                styles.timerButton,
                timerActive && styles.timerButtonActive,
              ]}
              onPress={toggleTimer}
            >
              <Text style={styles.timerButtonText}>
                {timerActive 
                  ? t('cook_mode.pause')
                  : timerRemaining === 0
                    ? t('cook_mode.timer_done_short')
                    : t('cook_mode.start')
                }
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Navigation */}
      <View style={styles.navContainer}>
        <TouchableOpacity 
          style={[
            styles.navButton,
            currentStep === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrev}
          disabled={currentStep === 0}
        >
          <Text style={[
            styles.navButtonText,
            currentStep === 0 && styles.navButtonTextDisabled,
          ]}>
            ◀ {t('cook_mode.prev')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={handleNext}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
            {currentStep < totalSteps - 1
              ? `${t('cook_mode.next')} ▶`
              : `${t('cook_mode.finish')} ✓`
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },
  
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  topButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButtonIcon: {
    fontSize: 18,
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.backgroundMuted,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  
  // Content
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    letterSpacing: 1.5,
  },
  stepTitle: {
    fontSize: theme.fontSize.display,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    lineHeight: 40,
  },
  stepBody: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
    lineHeight: 32,
    marginBottom: theme.spacing.xl,
  },
  
  // Timer
  timerCard: {
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  timerLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: '700',
    color: theme.colors.primary,
    fontVariant: ['tabular-nums'],
    marginBottom: theme.spacing.base,
  },
  timerButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
  },
  timerButtonActive: {
    backgroundColor: theme.colors.warning,
  },
  timerButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  
  // Navigation
  navContainer: {
    flexDirection: 'row',
    padding: theme.spacing.base,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navButton: {
    flex: 1,
    padding: theme.spacing.base,
    borderRadius: theme.radius.base,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  navButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  navButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  navButtonTextPrimary: {
    color: theme.colors.textInverse,
  },
});
