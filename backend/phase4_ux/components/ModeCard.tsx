/**
 * ModeCard — Ana ekrandaki büyük mod seçim kartı
 * ===================================================
 * 3 mod (pantry, supply, discover) için kullanılır.
 * Her kart gradient bg, emoji, başlık, alt yazı + → ok
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import type { RecommendationMode } from '../types';

interface ModeConfig {
  id: RecommendationMode;
  emoji: string;
  gradientColors: [string, string];
  iconBgColor: string;
}

interface ModeCardProps {
  mode: ModeConfig;
  title: string;
  subtitle: string;
  isLastUsed?: boolean;
  onPress: () => void;
}

export function ModeCard({ mode, title, subtitle, isLastUsed, onPress }: ModeCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.cardWrapper,
      pressed && styles.pressed,
    ]}>
      <LinearGradient
        colors={mode.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Sol: Icon container */}
        <View style={[styles.iconContainer, { backgroundColor: mode.iconBgColor }]}>
          <Text style={styles.emoji}>{mode.emoji}</Text>
        </View>
        
        {/* Orta: Metin */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        
        {/* Sağ: Arrow */}
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
        
        {/* "Son kullanılan" rozet */}
        {isLastUsed && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Son</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.base,
    minHeight: 110,
    position: 'relative',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.base,
  },
  emoji: {
    fontSize: 36,
  },
  content: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.textInverse,
    marginBottom: 4,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.92)',
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: theme.colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
  },
  badgeText: {
    color: theme.colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
