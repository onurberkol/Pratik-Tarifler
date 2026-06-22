import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Screen } from "@/components/Screen";
import { RecipeCard } from "@/components/RecipeCard";
import { IngredientChip } from "@/components/IngredientChip";
import { useSearchStore } from "@/store/searchStore";
import { useRecipeMatch } from "@/hooks/useRecipeMatch";
import { colors, radius, spacing, typography } from "@/theme";
import type { DietTag } from "@/types";

const DIET_FILTERS: { key: DietTag | "quick" | "all"; labelKey: string }[] = [
  { key: "all", labelKey: "results.filters.all" },
  { key: "quick", labelKey: "results.filters.quick" },
  { key: "vegan", labelKey: "results.filters.vegan" },
  { key: "vegetarian", labelKey: "results.filters.vegetarian" },
  { key: "gluten_free", labelKey: "results.filters.gluten_free" },
  { key: "low_carb", labelKey: "results.filters.low_carb" },
];

export default function SearchScreen() {
  const { t } = useTranslation();
  const ingredients = useSearchStore((s) => s.ingredients);
  const filters = useSearchStore((s) => s.filters);
  const setFilters = useSearchStore((s) => s.setFilters);
  const removeIngredient = useSearchStore((s) => s.removeIngredient);

  const { data, isLoading, error } = useRecipeMatch({
    tokens: ingredients,
    dietTags: filters.diet,
    maxTimeMin: filters.maxTimeMin,
  });

  const toggleFilter = (key: DietTag | "quick" | "all") => {
    if (key === "all") {
      setFilters({ diet: [], maxTimeMin: null });
    } else if (key === "quick") {
      setFilters({ maxTimeMin: filters.maxTimeMin ? null : 30 });
    } else {
      const next = filters.diet.includes(key)
        ? filters.diet.filter((d) => d !== key)
        : [...filters.diet, key];
      setFilters({ diet: next });
    }
  };

  const isActive = (key: DietTag | "quick" | "all"): boolean => {
    if (key === "all") return filters.diet.length === 0 && !filters.maxTimeMin;
    if (key === "quick") return filters.maxTimeMin === 30;
    return filters.diet.includes(key as DietTag);
  };

  return (
    <Screen>
      <Text style={styles.title}>{t("results.title")}</Text>
      <Text style={styles.count}>
        {data ? t("results.count", { count: data.length }) : ""}
      </Text>

      {ingredients.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ingChipsRow}
        >
          {ingredients.map((token) => (
            <IngredientChip
              key={token}
              label={token}
              onRemove={() => removeIngredient(token)}
            />
          ))}
        </ScrollView>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {DIET_FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => toggleFilter(f.key)}
            style={[styles.filter, isActive(f.key) && styles.filterActive]}
          >
            <Text
              style={[styles.filterText, isActive(f.key) && styles.filterTextActive]}
            >
              {t(f.labelKey)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>{t("common.loading")}</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.muted}>{t("common.error")}</Text>
        </View>
      ) : !data || data.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>
            {ingredients.length < 3 ? t("home.tip_body") : t("results.empty")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.recipe.id}
          renderItem={({ item }) => <RecipeCard result={item} />}
          contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.dark, marginTop: spacing.sm },
  count: { ...typography.bodySm, color: colors.gray, marginBottom: spacing.md },
  ingChipsRow: { gap: spacing.sm, paddingVertical: spacing.xs, marginBottom: spacing.sm },
  filterRow: { gap: spacing.sm, paddingVertical: spacing.sm, marginBottom: spacing.md },
  filter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.light,
  },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { ...typography.bodySm, color: colors.dark, fontWeight: "600" },
  filterTextActive: { color: colors.white },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  muted: { ...typography.body, color: colors.gray, marginTop: spacing.md },
  empty: { ...typography.body, color: colors.gray, textAlign: "center" },
});
