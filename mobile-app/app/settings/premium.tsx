import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { purchase, restorePurchases } from "@/api/premium";
import { colors, radius, spacing, typography } from "@/theme";

type Plan = "monthly" | "yearly";

const FEATURES = [
  { icon: "📖", key: "feature_recipes" },
  { icon: "🥗", key: "feature_filters" },
  { icon: "🛒", key: "feature_shopping" },
  { icon: "❤️", key: "feature_favorites" },
  { icon: "📊", key: "feature_nutrition" },
  { icon: "🎤", key: "feature_voice" },
] as const;

export default function PremiumScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>("yearly");
  const [busy, setBusy] = useState(false);

  const handlePurchase = async () => {
    setBusy(true);
    try {
      await purchase(plan);
    } catch (err) {
      Alert.alert(t("common.error"), (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      Alert.alert(t("common.ok"), "Restore initiated.");
    } catch (err) {
      Alert.alert(t("common.error"), (err as Error).message);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <SafeAreaView edges={["top"]}>
          <Pressable onPress={() => router.back()} style={styles.close}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </SafeAreaView>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.title}>{t("premium.title")}</Text>
          <Text style={styles.subtitle}>{t("premium.subtitle")}</Text>

          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f.key} style={styles.feature}>
                <Text style={styles.featIcon}>{f.icon}</Text>
                <Text style={styles.featText}>{t(`premium.${f.key}`)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.plans}>
            <Pressable
              onPress={() => setPlan("yearly")}
              style={[styles.plan, plan === "yearly" && styles.planActive]}
            >
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>{t("premium.save_badge")}</Text>
              </View>
              <Text style={styles.planLabel}>{t("premium.yearly")}</Text>
              <Text style={styles.planPrice}>{t("premium.price_yearly")}</Text>
              <Text style={styles.planTrial}>{t("premium.trial")}</Text>
            </Pressable>

            <Pressable
              onPress={() => setPlan("monthly")}
              style={[styles.plan, plan === "monthly" && styles.planActive]}
            >
              <Text style={styles.planLabel}>{t("premium.monthly")}</Text>
              <Text style={styles.planPrice}>{t("premium.price_monthly")}</Text>
            </Pressable>
          </View>
        </ScrollView>

        <SafeAreaView edges={["bottom"]} style={styles.ctaWrap}>
          <Button
            title={t("premium.title")}
            onPress={handlePurchase}
            loading={busy}
          />
          <Pressable onPress={handleRestore} style={{ marginTop: spacing.sm }}>
            <Text style={styles.restore}>{t("premium.restore")}</Text>
          </Pressable>
          <Text style={styles.terms}>{t("premium.terms")}</Text>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  close: { alignSelf: "flex-end", padding: spacing.md },
  closeText: { fontSize: 24, color: colors.white },
  content: { padding: spacing.lg, alignItems: "center" },
  crown: { fontSize: 64, marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.white, textAlign: "center" },
  subtitle: { ...typography.body, color: colors.cream, textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.xl },
  features: { width: "100%", marginBottom: spacing.xl, gap: spacing.sm },
  feature: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: spacing.md, borderRadius: radius.lg, gap: spacing.md,
  },
  featIcon: { fontSize: 22 },
  featText: { ...typography.body, color: colors.white, flex: 1 },
  plans: { width: "100%", gap: spacing.md },
  plan: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 3, borderColor: "transparent",
    position: "relative",
  },
  planActive: { borderColor: colors.accent },
  saveBadge: {
    position: "absolute", top: -10, right: 12,
    backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: 4,
    borderRadius: radius.pill,
  },
  saveText: { color: colors.dark, fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  planLabel: { ...typography.label, color: colors.gray },
  planPrice: { ...typography.h2, color: colors.dark, marginTop: spacing.xs },
  planTrial: { ...typography.bodySm, color: colors.success, marginTop: spacing.xs, fontWeight: "600" },
  ctaWrap: { backgroundColor: colors.primaryDark, padding: spacing.lg },
  restore: { ...typography.bodySm, color: colors.cream, textAlign: "center", textDecorationLine: "underline" },
  terms: { ...typography.caption, color: colors.cream, textAlign: "center", marginTop: spacing.sm, opacity: 0.8 },
});
