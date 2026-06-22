import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useQueries } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { useFavorites } from "@/hooks/useFavorites";
import { getRecipe } from "@/api/recipes";
import { useSettingsStore } from "@/store/settingsStore";
import { useUserStore } from "@/store/userStore";
import { colors, radius, spacing, typography } from "@/theme";
import type { Recipe } from "@/types";

export default function FavoritesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const favorites = useFavorites();
  const locale = useSettingsStore((s) => s.locale);
  const isPremium = useUserStore((s) => s.premium.active);

  const recipeQueries = useQueries({
    queries: favorites.map((f) => ({
      queryKey: ["recipe", f.recipe_id],
      queryFn: () => getRecipe(f.recipe_id),
      staleTime: 30 * 60 * 1000,
    })),
  });

  const recipes = recipeQueries
    .map((q) => q.data)
    .filter((r): r is Recipe => r != null);
  const isLoading = recipeQueries.some((q) => q.isLoading);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{t("favorites.title")}</Text>
        <Text style={styles.count}>
          {t("favorites.count", { count: favorites.length })}
        </Text>
        {!isPremium && (
          <Text style={styles.limit}>{t("favorites.limit_free")}</Text>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.empty}>{t("favorites.empty")}</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.md }}
          renderItem={({ item }) => {
            const localized = item.i18n[locale] ?? item.i18n.en ?? Object.values(item.i18n)[0];
            return (
              <Pressable
                style={styles.gridItem}
                onPress={() => router.push(`/recipe/${item.id}` as never)}
              >
                <Image
                  source={{ uri: item.hero_image_url }}
                  style={styles.gridImage}
                  contentFit="cover"
                />
                <Text style={styles.gridTitle} numberOfLines={2}>
                  {localized?.title}
                </Text>
                <Text style={styles.gridMeta}>
                  ⏱ {item.total_time_min} {t("recipe.minutes")}
                </Text>
              </Pressable>
            );
          }}
          contentContainerStyle={{ paddingBottom: spacing["3xl"], gap: spacing.md }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm, marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.dark },
  count: { ...typography.bodySm, color: colors.gray, marginTop: spacing.xs },
  limit: { ...typography.caption, color: colors.warning, marginTop: spacing.xs },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  empty: { ...typography.body, color: colors.gray, textAlign: "center", marginTop: spacing.md },
  emptyEmoji: { fontSize: 48 },
  gridItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  gridImage: { width: "100%", aspectRatio: 1, backgroundColor: colors.light },
  gridTitle: {
    ...typography.bodyBold,
    color: colors.dark,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  gridMeta: {
    ...typography.caption,
    color: colors.gray,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    paddingTop: 2,
  },
});
