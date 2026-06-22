/**
 * ProfileScreen — Kullanıcı Profili + Ayarlar
 * ================================================
 * - Avatar, ad, e-posta
 * - Premium üyelik durumu
 * - Hızlı erişim menüsü (Pantry, Settings, Subscription, Language)
 * - Çıkış
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../hooks';
import { auth } from '../api/client';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';

interface MenuItem {
  icon: string;
  labelKey: string;
  onPress: () => void;
  showChevron?: boolean;
  rightLabel?: string;
  destructive?: boolean;
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { firebaseUser, user } = useAuth();
  
  const isPremium = user?.subscription?.tier !== 'free';
  
  const handleSignOut = useCallback(() => {
    Alert.alert(
      t('profile.sign_out_title'),
      t('profile.sign_out_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.sign_out'),
          style: 'destructive',
          onPress: async () => {
            analytics.track('sign_out');
            await signOut(auth);
          },
        },
      ]
    );
  }, [t]);
  
  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: t('profile.section_account'),
      items: [
        {
          icon: '⭐',
          labelKey: 'profile.menu.favorites',
          onPress: () => navigation.navigate('Favorites'),
          showChevron: true,
        },
        {
          icon: '🗄️',
          labelKey: 'profile.menu.pantry',
          onPress: () => navigation.navigate('PantryManagement'),
          showChevron: true,
        },
        {
          icon: '📖',
          labelKey: 'profile.menu.cook_history',
          onPress: () => navigation.navigate('CookHistory'),
          showChevron: true,
          rightLabel: isPremium ? '' : t('premium.gate'),
        },
      ],
    },
    {
      title: t('profile.section_settings'),
      items: [
        {
          icon: '🌍',
          labelKey: 'profile.menu.language',
          onPress: () => navigation.navigate('Language'),
          showChevron: true,
        },
        {
          icon: '🥗',
          labelKey: 'profile.menu.dietary',
          onPress: () => navigation.navigate('DietaryPreferences'),
          showChevron: true,
        },
        {
          icon: '🔔',
          labelKey: 'profile.menu.notifications',
          onPress: () => navigation.navigate('NotificationSettings'),
          showChevron: true,
        },
      ],
    },
    {
      title: t('profile.section_more'),
      items: [
        {
          icon: '⭐',
          labelKey: 'profile.menu.rate_app',
          onPress: () => {/* StoreReview */},
          showChevron: true,
        },
        {
          icon: '💬',
          labelKey: 'profile.menu.feedback',
          onPress: () => navigation.navigate('Feedback'),
          showChevron: true,
        },
        {
          icon: '📜',
          labelKey: 'profile.menu.terms',
          onPress: () => navigation.navigate('Terms'),
          showChevron: true,
        },
        {
          icon: '🔒',
          labelKey: 'profile.menu.privacy',
          onPress: () => navigation.navigate('Privacy'),
          showChevron: true,
        },
      ],
    },
  ];
  
  if (!firebaseUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.signedOutContainer}>
          <Text style={styles.signedOutEmoji}>👋</Text>
          <Text style={styles.signedOutTitle}>{t('profile.signin_to_continue')}</Text>
          <TouchableOpacity 
            style={styles.signinButton}
            onPress={() => navigation.navigate('Auth', { screen: 'SignIn' })}
          >
            <Text style={styles.signinButtonText}>{t('auth.sign_in')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profil Kartı */}
        <View style={styles.profileCard}>
          {firebaseUser.photoURL ? (
            <Image source={{ uri: firebaseUser.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarLetter}>
                {(user?.display_name?.[0] || firebaseUser.email?.[0] || '?').toUpperCase()}
              </Text>
            </View>
          )}
          
          <Text style={styles.name}>
            {user?.display_name || firebaseUser.email || t('common.user')}
          </Text>
          {firebaseUser.email && (
            <Text style={styles.email}>{firebaseUser.email}</Text>
          )}
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.stats?.recipes_cooked || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.stats.cooked')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.stats?.favorites_count || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.stats.favorites')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.stats?.streak_days || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.stats.streak')}</Text>
            </View>
          </View>
        </View>
        
        {/* Premium Banner */}
        {!isPremium ? (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => navigation.navigate('Subscription', { source: 'profile' })}
          >
            <LinearGradient
              colors={theme.colors.premiumGradient}
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
        ) : (
          <View style={styles.premiumBadgeActive}>
            <Text style={styles.premiumEmoji}>👑</Text>
            <Text style={styles.premiumActiveText}>{t('premium.active')}</Text>
          </View>
        )}
        
        {/* Menüler */}
        {menuSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionItems}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.menuItem,
                    idx < section.items.length - 1 && styles.menuItemBordered,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    item.onPress();
                  }}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.menuLabel,
                    item.destructive && styles.menuLabelDestructive,
                  ]}>
                    {t(item.labelKey)}
                  </Text>
                  <View style={styles.menuRight}>
                    {item.rightLabel && (
                      <Text style={styles.menuRightLabel}>{item.rightLabel}</Text>
                    )}
                    {item.showChevron && (
                      <Text style={styles.menuChevron}>›</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        
        {/* Sign Out */}
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>{t('profile.sign_out')}</Text>
        </TouchableOpacity>
        
        <Text style={styles.appVersion}>v1.0.0 (build 1)</Text>
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
  
  // Signed out
  signedOutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  signedOutEmoji: { fontSize: 64, marginBottom: theme.spacing.lg },
  signedOutTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  signinButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.base,
  },
  signinButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  
  // Profile Card
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: theme.spacing.base,
  },
  avatarPlaceholder: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.textInverse,
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.base,
    padding: theme.spacing.base,
    width: '100%',
    ...theme.shadow.card,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  
  // Premium
  premiumBanner: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    borderRadius: theme.radius.base,
    overflow: 'hidden',
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.base,
    gap: theme.spacing.md,
  },
  premiumEmoji: { fontSize: 32 },
  premiumTitle: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  premiumSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
  premiumArrow: { color: 'white', fontSize: 22, fontWeight: '700' },
  
  premiumBadgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.premium + '15',
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.base,
    borderRadius: theme.radius.base,
    gap: theme.spacing.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.premium,
  },
  premiumActiveText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.premium,
  },
  
  // Sections
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionItems: {
    backgroundColor: theme.colors.backgroundElevated,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.base,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.md,
  },
  menuItemBordered: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuIcon: { fontSize: 20 },
  menuLabel: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  menuLabelDestructive: {
    color: theme.colors.error,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  menuRightLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.premium,
    fontWeight: '700',
    backgroundColor: theme.colors.premium + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  menuChevron: {
    fontSize: 20,
    color: theme.colors.textMuted,
    fontWeight: '300',
  },
  
  // Sign Out
  signOutButton: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error + '40',
  },
  signOutText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    fontWeight: '600',
  },
  appVersion: {
    textAlign: 'center',
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.lg,
  },
});
