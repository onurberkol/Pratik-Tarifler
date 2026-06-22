/**
 * IngredientChip — Silinebilir Malzeme Chip
 * ==========================================
 * Üç durum:
 *   - default: gri arka plan, ekle (+)
 *   - selected: yeşil arka plan, tik (✓)
 *   - removable: kırmızı X
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface IngredientChipProps {
  emoji: string;
  label: string;
  selected?: boolean;
  removable?: boolean;
  onPress: () => void;
}

export function IngredientChip({
  emoji,
  label,
  selected = false,
  removable = false,
  onPress,
}: IngredientChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[
        styles.label,
        selected && styles.labelSelected,
      ]} numberOfLines={1}>
        {label}
      </Text>
      {removable && (
        <View style={styles.removeIcon}>
          <Text style={styles.removeText}>✕</Text>
        </View>
      )}
      {selected && !removable && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </Pressable>
  );
}


const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  chipPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  labelSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 2,
  },
  removeIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.error + 'DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  removeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
