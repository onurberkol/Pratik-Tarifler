import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecipe } from "@/hooks/useRecipe";
import { useIsFavorited, useToggleFavorite } from "@/hooks/useFavorites";
import { useSettingsStore } from "@/store/settingsStore";
import { useSearchStore } from "@/store/searchStore";
import { Button } from "@/components/Button";
import { colors, radius, spacing, typography } from "@/theme";

type Tab = "ingredients" | "steps" | "reviews";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const ingredients = useSearchStore((s) => s.ingredients);

  const { data: recipe, isLoading } = useRecipe(id);
  const isFav = useIsFavorited(id ?? "");
  const { add, remove, isLoading: favBusy } = useToggleFavorite();
  const [tab, setTab] = useState<Tab>("ingredients");

  if (isLoading || !recipe) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const localized =
    recipe.i18n[locale] ?? recipe.i18n.en ?? Object.values(recipe.i18n)[0]!;

  const userSet = new Set(ingredients);
  const have = localized.ingredients.filter((i) => userSet.has(i.token));
  const missing = localized.ingredients.filter((i) => !userSet.has(i.token));

  const toggleFav = async () => {
    if (favBusy) return;
    try {
      if (isFav) await remove(recipe.id);
      else await add(recipe.id);
    } catch (err) {
      console.warn("Favorite toggle failed:", err);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.heroWrap}>
            <Image
              source={{ uri: recipe.hero_image_url }}
              style={styles.hero}
              contentFit="cover"
            />
            <SafeAreaView style={styles.heroOverlay} edges={["top"]}>
              <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                <Text style={styles.iconText}>‹</Text>
              </Pressable>
              <Pressable onPress={toggleFav} style={styles.iconBtn}>
                <Text style={styles.iconText}>{isFav ? "❤️" : "🤍"}</Text>
              </Pressable>
            </SafeAreaView>
          </View>

          <View style={styles.body}>
            <Text style={styles.title}>{localized.title}</Text>
            <Text style={styles.description}>{localized.description}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaValue}>{recipe.total_time_min}</Text>
                <Text style={styles.metaLabel}>{t("recipe.minutes")}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaValue}>{recipe.servings}</Text>
                <Text style={styles.metaLabel}>{t("recipe.servings", { count: recipe.servings }).replace(/\d+/, "").trim() || "porsiyon"}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaValue}>★ {recipe.rating_avg.toFixed(1)}</Text>
                <Text style={styles.metaLabel}>({recipe.rating_count})</Text>
              </View>
            </View>

            <View style={styles.tabRow}>
              {(["ingredients", "steps", "reviews"] as Tab[]).map((tk) => (
                <Pressable
                  key={tk}
                  onPress={() => setTab(tk)}
                  style={[styles.tab, tab === tk && styles.tabActive]}
                >
                  <Text style={[styles.tabText, tab === tk && styles.tabTextActive]}>
                    {t(`recipe.tab_${tk}`)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {tab === "ingredients" && (
              <View>
                {have.length > 0 && (
                  <>
                    <Text style={styles.subhead}>✓ {t("recipe.you_have")}</Text>
                    {have.map((ing, i) => (
                      <View key={i} style={styles.ingRow}>
                        <Text style={styles.ingDot}>•</Text>
                        <Text style={styles.ingAmount}>{ing.amount}</Text>
                        <Text style={styles.ingName}>{ing.token}</Text>
                      </View>
                    ))}
                  </>
                )}
                {missing.length > 0 && (
                  <>
                    <Text style={[styles.subhead, { marginTop: spacing.lg, color: colors.warning }]}>
                      ⚠ {t("recipe.missing_ingredients")}
                    </Text>
                    {missing.map((ing, i) => (
                      <View key={i} style={styles.ingRow}>
                        <Text style={styles.ingDot}>•</Text>
                        <Text style={styles.ingAmount}>{ing.amount}</Text>
                        <Text style={[styles.ingName, { color: colors.warning }]}>{ing.token}</Text>
                        {ing.note && <Text style={styles.ingNote}>({ing.note})</Text>}
                      </View>
                    ))}
                  </>
                )}
              </View>
            )}

            {tab === "steps" && (
              <View>
                {localized.steps.map((step) => (
                  <View key={step.order} style={styles.stepRow}>
                    <View style={styles.stepNum}>
                      <Text style={styles.stepNumText}>{step.order}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepBody}>{step.body}</Text>
                      {step.timer_sec && step.timer_sec > 0 && (
                        <Text style={styles.stepTimer}>⏱ {Math.round(step.timer_sec / 60)} {t("recipe.minutes")}</Text>
                      )}
                    </View>
                  </View>
                ))}
                {localized.tips.length > 0 && (
                  <View style={styles.tips}>
                    <Text style={styles.tipsTitle}>💡 Tips</Text>
                    {localized.tips.map((tip, i) => (
                      <Text key={i} style={styles.tipText}>• {tip}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {tab === "reviews" && (
              <View style={styles.center}>
                <Text style={styles.muted}>Reviews coming soon.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <SafeAreaView edges={["bottom"]} style={styles.ctaWrap}>
          <Button
            title={t("recipe.start_cooking")}
            onPress={() => router.push(`/recipe/cook/${recipe.id}` as never)}
          />
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroWrap: { position: "relative" },
  hero: { width: "100%", height: 280, backgroundColor: colors.light },
  heroOverlay: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center", justifyContent: "center",
    marginTop: spacing.sm,
  },
  iconText: { fontSize: 22 },
  body: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.dark },
  description: { ...typography.body, color: colors.gray, marginTop: spacing.sm },
  metaRow: {
    flexDirection: "row", justifyContent: "space-around",
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, marginVertical: spacing.lg,
  },
  metaItem: { alignItems: "center" },
  metaValue: { ...typography.h3, color: colors.primary },
  metaLabel: { ...typography.caption, color: colors.gray, marginTop: 2 },
  tabRow: {
    flexDirection: "row", backgroundColor: colors.cream,
    borderRadius: radius.lg, padding: 4, marginBottom: spacing.lg,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: "center", borderRadius: radius.md },
  tabActive: { backgroundColor: colors.white, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  tabText: { ...typography.bodySm, color: colors.gray, fontWeight: "600" },
  tabTextActive: { color: colors.primary },
  subhead: { ...typography.label, color: colors.success, marginBottom: spacing.sm },
  ingRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.xs },
  ingDot: { color: colors.primary, fontSize: 18, marginRight: spacing.sm },
  ingAmount: { ...typography.bodyBold, color: colors.dark, marginRight: spacing.sm, minWidth: 60 },
  ingName: { ...typography.body, color: colors.dark, flex: 1 },
  ingNote: { ...typography.caption, color: colors.gray, marginLeft: spacing.xs },
  stepRow: { flexDirection: "row", marginBottom: spacing.lg },
  stepNum: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", marginRight: spacing.md,
  },
  stepNumText: { color: colors.white, fontWeight: "700" },
  stepTitle: { ...typography.bodyBold, color: colors.dark, marginBottom: spacing.xs },
  stepBody: { ...typography.body, color: colors.charcoal, lineHeight: 22 },
  stepTimer: { ...typography.caption, color: colors.accent, marginTop: spacing.xs, fontWeight: "600" },
  tips: {
    backgroundColor: colors.cream, borderRadius: radius.lg,
    padding: spacing.md, marginTop: spacing.md,
  },
  tipsTitle: { ...typography.bodyBold, color: colors.dark, marginBottom: spacing.sm },
  tipText: { ...typography.bodySm, color: colors.charcoal, marginBottom: spacing.xs },
  muted: { ...typography.body, color: colors.gray, padding: spacing.xl },
  ctaWrap: {
    backgroundColor: colors.white, padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider,
  },
});
