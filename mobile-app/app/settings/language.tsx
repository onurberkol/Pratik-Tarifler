import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Screen } from "@/components/Screen";
import { SUPPORTED_LANGS, LANG_LABELS, changeLanguage } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";
import { colors, radius, spacing, typography } from "@/theme";
import type { LangCode } from "@/types";

export default function LanguageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);

  const handleSelect = async (lng: LangCode) => {
    setLocale(lng);
    await changeLanguage(lng);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
          <Text style={styles.title}>{t("language.title")}</Text>
          <View style={{ width: 30 }} />
        </View>

        <Text style={styles.subtitle}>{t("language.subtitle")}</Text>
        <Text style={styles.section}>{t("language.available")}</Text>

        <FlatList
          data={SUPPORTED_LANGS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const label = LANG_LABELS[item];
            const selected = item === locale;
            return (
              <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [
                  styles.row,
                  pressed && { backgroundColor: colors.cream },
                  selected && { borderColor: colors.primary, borderWidth: 2 },
                ]}
              >
                <Text style={styles.flag}>{label.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.native}>{label.native}</Text>
                  <Text style={styles.english}>{label.english}</Text>
                </View>
                {selected && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          }}
          contentContainerStyle={{ paddingBottom: spacing["3xl"], gap: spacing.sm }}
          showsVerticalScrollIndicator={false}
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: spacing.sm, marginBottom: spacing.md,
  },
  close: { fontSize: 22, color: colors.dark, padding: spacing.xs },
  title: { ...typography.h2, color: colors.dark },
  subtitle: { ...typography.body, color: colors.gray, marginBottom: spacing.md },
  section: { ...typography.label, color: colors.gray, marginBottom: spacing.sm },
  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.light,
    gap: spacing.md,
  },
  flag: { fontSize: 32 },
  native: { ...typography.bodyBold, color: colors.dark },
  english: { ...typography.caption, color: colors.gray, marginTop: 2 },
  check: { fontSize: 22, color: colors.primary, fontWeight: "700" },
});
