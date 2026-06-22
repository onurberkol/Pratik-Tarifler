import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

interface Props {
  label: string;
  emoji?: string;
  onRemove?: () => void;
  onPress?: () => void;
  selected?: boolean;
}

export function IngredientChip({ label, emoji, onRemove, onPress, selected }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected && { backgroundColor: colors.primary, borderColor: colors.primary },
      ]}
    >
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={[styles.label, selected && { color: colors.white }]}>{label}</Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} style={styles.remove}>
          <Text style={[styles.removeText, selected && { color: colors.white }]}>×</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.light,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    gap: spacing.xs,
  },
  emoji: { fontSize: 16 },
  label: { ...typography.bodySm, color: colors.dark, fontWeight: "600" },
  remove: {
    marginLeft: spacing.xs,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: { color: colors.dark, fontSize: 13, lineHeight: 16, fontWeight: "700" },
});
