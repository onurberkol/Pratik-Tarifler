import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { IngredientChip } from "@/components/IngredientChip";
import { useSearchStore } from "@/store/searchStore";
import { useUserStore } from "@/store/userStore";
import { colors, radius, spacing, typography } from "@/theme";

const POPULAR_INGREDIENTS = [
  { token: "tomato", emoji: "🍅", labelKey: "tomato" },
  { token: "onion", emoji: "🧅", labelKey: "onion" },
  { token: "egg", emoji: "🥚", labelKey: "egg" },
  { token: "chicken", emoji: "🍗", labelKey: "chicken" },
  { token: "potato", emoji: "🥔", labelKey: "potato" },
  { token: "cheese", emoji: "🧀", labelKey: "cheese" },
  { token: "rice", emoji: "🍚", labelKey: "rice" },
  { token: "garlic", emoji: "🧄", labelKey: "garlic" },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const ingredients = useSearchStore((s) => s.ingredients);
  const addIngredient = useSearchStore((s) => s.addIngredient);
  const removeIngredient = useSearchStore((s) => s.removeIngredient);
  const profile = useUserStore((s) => s.profile);

  const [text, setText] = useState("");

  const handleAdd = () => {
    const trimmed = text.trim().toLowerCase();
    if (trimmed) {
      addIngredient(trimmed);
      setText("");
    }
  };

  const canSearch = ingredients.length >= 3;
  const greeting = profile?.display_name
    ? t("home.greeting", { name: profile.display_name })
    : t("home.greeting_guest");

  return (
    <Screen scrollable>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.prompt}>{t("home.prompt")}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t("home.section_title")}</Text>
        <Text style={styles.subtitle}>{t("home.section_subtitle")}</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={t("home.input_placeholder")}
            placeholderTextColor={colors.grayLight}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Pressable
            onPress={handleAdd}
            style={[styles.addBtn, !text.trim() && { opacity: 0.4 }]}
            disabled={!text.trim()}
          >
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.chipsRow}>
          {ingredients.map((token) => (
            <IngredientChip
              key={token}
              label={token}
              onRemove={() => removeIngredient(token)}
            />
          ))}
        </View>

        <Text style={styles.popularLabel}>{t("home.popular_categories")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularRow}
        >
          {POPULAR_INGREDIENTS.map((ing) => (
            <IngredientChip
              key={ing.token}
              label={ing.token}
              emoji={ing.emoji}
              onPress={() => addIngredient(ing.token)}
              selected={ingredients.includes(ing.token)}
            />
          ))}
        </ScrollView>

        <Button
          title={t("home.cta")}
          onPress={() => router.push("/(tabs)/search")}
          disabled={!canSearch}
          style={{ marginTop: spacing.lg }}
        />
        {!canSearch && (
          <Text style={styles.tip}>
            {t("home.tip_title")}: {t("home.tip_body")}
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { ...typography.h2, color: colors.dark, marginTop: spacing.md },
  prompt: { ...typography.body, color: colors.gray, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  label: { ...typography.label, color: colors.primary, marginBottom: spacing.xs },
  subtitle: { ...typography.bodySm, color: colors.gray, marginBottom: spacing.md },
  inputRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  input: {
    flex: 1,
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    fontSize: 16,
    color: colors.dark,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: colors.white, fontSize: 28, lineHeight: 30, fontWeight: "300" },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  popularLabel: {
    ...typography.label,
    color: colors.gray,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  popularRow: { flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.xs },
  tip: {
    ...typography.caption,
    color: colors.gray,
    textAlign: "center",
    marginTop: spacing.md,
    fontStyle: "italic",
  },
});
