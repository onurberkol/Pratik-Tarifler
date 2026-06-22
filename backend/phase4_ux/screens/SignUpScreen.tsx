/**
 * SignUpScreen — Yeni Hesap Oluşturma
 * ========================================
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '../api/client';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import type { User } from '../types';

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const validate = useCallback((): string | null => {
    if (!displayName.trim() || displayName.trim().length < 2) {
      return t('auth.error_name_too_short');
    }
    if (!email.trim() || !email.includes('@')) {
      return t('auth.error_invalid_email');
    }
    if (password.length < 8) {
      return t('auth.error_password_too_short');
    }
    if (!agreeToTerms) {
      return t('auth.error_must_agree');
    }
    return null;
  }, [displayName, email, password, agreeToTerms, t]);
  
  const handleSignUp = useCallback(async () => {
    const error = validate();
    if (error) {
      Alert.alert(t('auth.error'), error);
      return;
    }
    
    try {
      setLoading(true);
      analytics.track('sign_up_started');
      
      // 1. Auth oluştur
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = cred.user;
      
      // 2. Profil güncelle
      await updateProfile(fbUser, { displayName: displayName.trim() });
      
      // 3. Firestore'da user document oluştur
      const userData: Partial<User> = {
        uid: fbUser.uid,
        email: fbUser.email,
        display_name: displayName.trim(),
        photo_url: null,
        language: i18n.language as any,
        preferences: {
          dietary: [],
          allergies: [],
          favorite_cuisines: [],
          cooking_skill: 'beginner',
          serving_default: 4,
        },
        subscription: {
          tier: 'free',
          status: 'active',
          started_at: null,
          expires_at: null,
          provider: null,
        },
        stats: {
          recipes_viewed: 0,
          recipes_cooked: 0,
          favorites_count: 0,
          streak_days: 0,
        },
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        app_version: '1.0.0',
      };
      
      await setDoc(doc(db, 'users', fbUser.uid), {
        ...userData,
        created_at: serverTimestamp(),
        last_active_at: serverTimestamp(),
      });
      
      analytics.setUser(fbUser.uid);
      analytics.track('sign_up_completed', { method: 'email' });
      
      // Onboarding akışı için (ilk dietary preferences vs)
      navigation.replace('Onboarding');
    } catch (e: any) {
      analytics.error(e, { context: 'sign_up' });
      Alert.alert(t('auth.error'), e.message);
    } finally {
      setLoading(false);
    }
  }, [validate, email, password, displayName, i18n.language, navigation, t]);
  
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← {t('common.back')}</Text>
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.sign_up_title')}</Text>
            <Text style={styles.subtitle}>{t('auth.sign_up_subtitle')}</Text>
          </View>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('auth.name')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.name_placeholder')}
                placeholderTextColor={theme.colors.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('auth.email')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.email_placeholder')}
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('auth.password')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.password_hint')}
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
              />
              <Text style={styles.hint}>{t('auth.password_requirement')}</Text>
            </View>
            
            {/* Terms checkbox */}
            <TouchableOpacity 
              style={styles.termsRow}
              onPress={() => setAgreeToTerms(prev => !prev)}
            >
              <View style={[
                styles.checkbox,
                agreeToTerms && styles.checkboxChecked
              ]}>
                {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                {t('auth.agree_terms_prefix')}{' '}
                <Text style={styles.termsLink}>{t('auth.terms')}</Text>
                {' '}{t('common.and')}{' '}
                <Text style={styles.termsLink}>{t('auth.privacy')}</Text>
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.textInverse} />
              ) : (
                <Text style={styles.submitText}>{t('auth.create_account')}</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.has_account')}</Text>
            <TouchableOpacity onPress={() => navigation.replace('SignIn')}>
              <Text style={styles.footerLink}>{t('auth.sign_in')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  
  backButton: { paddingVertical: theme.spacing.sm },
  backText: { fontSize: theme.fontSize.base, color: theme.colors.text },
  
  header: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  
  form: { gap: theme.spacing.base },
  inputGroup: {},
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.base,
    padding: theme.spacing.base,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  hint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.base,
    borderRadius: theme.radius.base,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textInverse,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  footerLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
