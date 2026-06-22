/**
 * WelcomeScreen — Karşılama / Onboarding
 * ============================================
 * - Brand + 3 modun hızlı tanıtımı
 * - Misafir olarak başla / Giriş yap / Kayıt ol
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { theme } from '../styles/theme';

const FEATURES = [
  { emoji: '🥘', titleKey: 'welcome.feature_pantry', descKey: 'welcome.feature_pantry_desc' },
  { emoji: '🛒', titleKey: 'welcome.feature_supply', descKey: 'welcome.feature_supply_desc' },
  { emoji: '🌍', titleKey: 'welcome.feature_discover', descKey: 'welcome.feature_discover_desc' },
];

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBg}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Brand */}
          <View style={styles.brandSection}>
            <Text style={styles.logo}>🍳</Text>
            <Text style={styles.brandName}>{t('welcome.brand_name')}</Text>
            <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
          </View>
          
          {/* Features */}
          <View style={styles.featuresContainer}>
            {FEATURES.map((feature, idx) => (
              <View key={idx} style={styles.featureCard}>
                <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{t(feature.titleKey)}</Text>
                  <Text style={styles.featureDesc}>{t(feature.descKey)}</Text>
                </View>
              </View>
            ))}
          </View>
          
          {/* CTA's */}
          <View style={styles.ctaSection}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.primaryButtonText}>{t('welcome.signup_cta')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('SignIn')}
            >
              <Text style={styles.secondaryButtonText}>{t('welcome.signin_cta')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('Main')}>
              <Text style={styles.guestText}>{t('welcome.continue_guest')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBg: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.lg,
  },
  
  brandSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  logo: { fontSize: 80, marginBottom: theme.spacing.base },
  brandName: {
    fontSize: theme.fontSize.display,
    fontWeight: '800',
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  
  featuresContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxxl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.radius.base,
    padding: theme.spacing.base,
    gap: theme.spacing.md,
  },
  featureEmoji: { fontSize: 40 },
  featureTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  
  ctaSection: {
    gap: theme.spacing.md,
    marginTop: 'auto',
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingVertical: theme.spacing.base,
    borderRadius: theme.radius.base,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  secondaryButton: {
    paddingVertical: theme.spacing.base,
    borderRadius: theme.radius.base,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: 'white',
  },
  guestText: {
    textAlign: 'center',
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    padding: theme.spacing.sm,
    textDecorationLine: 'underline',
  },
});
