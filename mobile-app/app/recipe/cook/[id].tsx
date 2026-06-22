import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useRecipe } from "@/hooks/useRecipe";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@/components/Button";
import { Timer } from "@/components/Timer";
import { colors, radius, spacing, typography } from "@/theme";

export default function CookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);

  const { data: recipe, isLoading } = useRecipe(id);
  const [stepIdx, setStepIdx] = useState(0);

  if (isLoading || !recipe) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const localized =
    recipe.i18n[locale] ?? recipe.i18n.en ?? Object.values(recipe.i18n)[0]!;
  const step = localized.steps[stepIdx]!;
  const isLast = stepIdx === localized.steps.length - 1;

  const next = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } else {
      setStepIdx((s) => s + 1);
    }
  };
  const prev = () => {
    if (stepIdx > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStepIdx((s) => s - 1);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <Text style={styles.stepLabel}>
            {t("cooking.step", { current: stepIdx + 1, total: localized.steps.length })}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((stepIdx + 1) / localized.steps.length) * 100}%` },
            ]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepBody}>{step.body}</Text>

          {step.timer_sec && step.timer_sec > 0 && (
            <Timer seconds={step.timer_sec} label={t("cooking.timer")} />
          )}

          <Text style={styles.voiceHint}>🎤 {t("cooking.voice_hint")}</Text>
        </ScrollView>

        <View style={styles.controls}>
          <Button
            title={t("cooking.prev")}
            variant="secondary"
            onPress={prev}
            disabled={stepIdx === 0}
            style={{ flex: 1 }}
          />
          <View style={{ width: spacing.md }} />
          <Button
            title={isLast ? t("cooking.finish") : t("cooking.next")}
            onPress={next}
            style={{ flex: 1 }}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white,
    alignItems: "center", justifyContent: "center",
  },
  closeText: { fontSize: 20, color: colors.dark },
  stepLabel: { ...typography.label, color: colors.primary },
  progressBar: {
    height: 4, backgroundColor: colors.light, marginHorizontal: spacing.lg,
    borderRadius: 2, overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.primary },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  stepTitle: { ...typography.h1, color: colors.dark, marginBottom: spacing.md },
  stepBody: { ...typography.body, color: colors.charcoal, fontSize: 18, lineHeight: 26 },
  voiceHint: {
    ...typography.caption, color: colors.gray, textAlign: "center",
    marginTop: spacing.xl, fontStyle: "italic",
  },
  controls: {
    flexDirection: "row", padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider,
    backgroundColor: colors.white,
  },
});
