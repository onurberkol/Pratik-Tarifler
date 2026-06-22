/**
 * SignInScreen — E-posta + Şifre + Google ile Giriş
 * =====================================================
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
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

import { auth } from '../api/client';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';

export default function SignInScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSignIn = useCallback(async () => {
    if (!email.trim() || !password) {
      Alert.alert(t('auth.error'), t('auth.fill_all_fields'));
      return;
    }
    
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      analytics.track('sign_in_completed', { method: 'email' });
      // App.tsx auth state listener'ı Main stack'e geçirir
    } catch (e: any) {
      analytics.error(e, { context: 'sign_in' });
      Alert.alert(t('auth.error'), e.message);
    } finally {
      setLoading(false);
    }
  }, [email, password, t]);
  
  const handleForgotPassword = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert(t('auth.error'), t('auth.enter_email_first'));
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(t('auth.reset_sent_title'), t('auth.reset_sent_message'));
    } catch (e: any) {
      Alert.alert(t('auth.error'), e.message);
    }
  }, [email, t]);
  
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← {t('common.back')}</Text>
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.sign_in_title')}</Text>
            <Text style={styles.subtitle}>{t('auth.sign_in_subtitle')}</Text>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
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
                placeholder={t('auth.password_placeholder')}
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="go"
                onSubmitEditing={handleSignIn}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.forgotButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.textInverse} />
              ) : (
                <Text style={styles.submitText}>{t('auth.sign_in')}</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.no_account')}</Text>
            <TouchableOpacity onPress={() => navigation.replace('SignUp')}>
              <Text style={styles.footerLink}>{t('auth.sign_up')}</Text>
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
  
  backButton: {
    paddingVertical: theme.spacing.sm,
  },
  backText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  
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
  
  form: {
    gap: theme.spacing.base,
  },
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
  
  forgotButton: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.base,
    borderRadius: theme.radius.base,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
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
