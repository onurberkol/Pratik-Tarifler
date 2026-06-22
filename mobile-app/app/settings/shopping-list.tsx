import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Screen } from "@/components/Screen";
import { listShoppingLists, toggleItem } from "@/api/shopping";
import { useUserStore } from "@/store/userStore";
import { colors, radius, spacing, typography } from "@/theme";
import type { ShoppingList, ShoppingListItem } from "@/types";

export default function ShoppingListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isPremium = useUserStore((s) => s.premium.active);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }
    listShoppingLists()
      .then((data) => {
        setLists(data);
        if (data.length > 0 && data[0]) setActiveListId(data[0].id);
      })
      .finally(() => setLoading(false));
  }, [isPremium]);

  if (!isPremium) {
    return (
      <Screen>
        <View style={styles.lockedCenter}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>{t("shopping.premium_only")}</Text>
          <Pressable
            onPress={() => router.push("/settings/premium")}
            style={styles.upgradeBtn}
          >
            <Text style={styles.upgradeText}>{t("premium.title")}</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const activeList = lists.find((l) => l.id === activeListId);

  const handleToggle = async (idx: number, checked: boolean) => {
    if (!activeList) return;
    const newItems = activeList.items.map((it, i) =>
      i === idx ? { ...it, checked } : it
    );
    setLists((prev) =>
      prev.map((l) => (l.id === activeList.id ? { ...l, items: newItems } : l))
    );
    try {
      await toggleItem(activeList.id, idx, checked);
    } catch {
      // revert on error
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.title}>{t("shopping.title")}</Text>
          <View style={{ width: 32 }} />
        </View>

        {!activeList ? (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.empty}>Create a shopping list from any recipe.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              {t("shopping.subtitle", {
                count: activeList.items.length,
                recipes: activeList.recipe_ids.length,
              })}
            </Text>
            <FlatList
              data={activeList.items}
              keyExtractor={(item, i) => `${item.token}-${i}`}
              renderItem={({ item, index }) => (
                <ShoppingItemRow
                  item={item}
                  onToggle={(checked) => handleToggle(index, checked)}
                />
              )}
              contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </Screen>
    </>
  );
}

function ShoppingItemRow({
  item,
  onToggle,
}: {
  item: ShoppingListItem;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onToggle(!item.checked)} style={styles.itemRow}>
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && <Text style={styles.check}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
          {item.token}
        </Text>
        <Text style={styles.itemAmount}>{item.total_amount}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: spacing.sm, marginBottom: spacing.md,
  },
  back: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 28, color: colors.dark, lineHeight: 28 },
  title: { ...typography.h2, color: colors.dark },
  subtitle: { ...typography.bodySm, color: colors.gray, marginBottom: spacing.md },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  lockedCenter: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  lockIcon: { fontSize: 64, marginBottom: spacing.lg },
  lockTitle: { ...typography.h3, color: colors.dark, marginBottom: spacing.lg, textAlign: "center" },
  upgradeBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md, borderRadius: radius.lg,
  },
  upgradeText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  empty: { ...typography.body, color: colors.gray, textAlign: "center", marginTop: spacing.md },
  emptyEmoji: { fontSize: 48 },
  itemRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  checkbox: {
    width: 26, height: 26, borderRadius: 6, borderWidth: 2,
    borderColor: colors.light, alignItems: "center", justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
  check: { color: colors.white, fontWeight: "700" },
  itemName: { ...typography.bodyBold, color: colors.dark },
  itemNameChecked: { textDecorationLine: "line-through", color: colors.gray },
  itemAmount: { ...typography.caption, color: colors.gray, marginTop: 2 },
});
