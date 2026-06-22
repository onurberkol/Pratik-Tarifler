import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { colors, matchColor, radius, spacing, typography } from "@/theme";
import { useSettingsStore } from "@/store/settingsStore";
import type { MatchResult } from "@/types";

interface Props {
  result: MatchResult;
  showMissing?: boolean;
}

export function RecipeCard({ result, showMissing = true }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useSettingsStore((s) => s.locale);
  const { recipe, matchPct, missingTokens } = result;
  const localized = recipe.i18n[locale] ?? recipe.i18n.en ?? Object.values(recipe.i18n)[0];

  return (
    <Pressable
      onPress={() => router.push(`/recipe/${recipe.id}` as never)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: recipe.hero_image_url }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
        />
        <View style={[styles.matchBadge, { backgroundColor: matchColor(matchPct) }]}>
          <Text style={styles.matchText}>{matchPct}%</Text>
        </View>
        {recipe.is_premium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>{t("common.premium_badge")}</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {localized?.title ?? recipe.id}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            ⏱ {recipe.total_time_min} {t("recipe.minutes")}
          </Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>
            {t(`recipe.difficulty_${recipe.difficulty}`)}
          </Text>
        </View>
        {showMissing && missingTokens.length > 0 && (
          <Text style={styles.missing} numberOfLines={1}>
            {t("recipe.you_need")}: {missingTokens.slice(0, 3).join(", ")}
            {missingTokens.length > 3 ? "…" : ""}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrap: { position: "relative" },
  image: { width: "100%", height: 160, backgroundColor: colors.light },
  matchBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  matchText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  premiumBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.premium,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  premiumText: { color: colors.white, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  body: { padding: spacing.md },
  title: { ...typography.h3, color: colors.dark, marginBottom: spacing.xs },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  meta: { ...typography.bodySm, color: colors.gray },
  dot: { color: colors.gray, fontSize: 12 },
  missing: { ...typography.caption, color: colors.gray, marginTop: spacing.xs, fontStyle: "italic" },
});
