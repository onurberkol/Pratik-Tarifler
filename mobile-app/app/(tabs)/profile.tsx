import React from "react";
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { useUserStore } from "@/store/userStore";
import { useSettingsStore } from "@/store/settingsStore";
import { signOut, deleteAccount } from "@/api/auth";
import { LANG_LABELS } from "@/lib/i18n";
import { colors, radius, spacing, typography } from "@/theme";

interface RowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}
function Row({ icon, label, value, onPress, destructive }: RowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, destructive && { color: colors.danger }]}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <Text style={[styles.chevron, destructive && { color: colors.danger }]}>›</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const premium = useUserStore((s) => s.premium);
  const isAnonymous = useUserStore((s) => s.isAnonymous);
  const locale = useSettingsStore((s) => s.locale);

  const handleSignOut = () => {
    Alert.alert(t("profile.logout"), "", [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("profile.logout"), style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      t("profile.delete_account"),
      "This will permanently delete all your data.",
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (err) {
              Alert.alert(t("common.error"), (err as Error).message);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.display_name?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={styles.name}>
          {profile?.display_name ?? t("home.greeting_guest")}
        </Text>
        {profile?.email && <Text style={styles.email}>{profile.email}</Text>}
        {premium.active && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>★ PREMIUM</Text>
          </View>
        )}
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile?.stats?.recipes_cooked ?? 0}</Text>
          <Text style={styles.statLabel}>{t("profile.stats_cooked")}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile?.stats?.favorites_count ?? 0}</Text>
          <Text style={styles.statLabel}>{t("profile.stats_favorites")}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile?.stats?.streak_days ?? 0}</Text>
          <Text style={styles.statLabel}>{t("profile.stats_streak")}</Text>
        </View>
      </View>

      <Text style={styles.section}>{t("profile.settings")}</Text>
      <View style={styles.card}>
        <Row
          icon={LANG_LABELS[locale].flag}
          label={t("profile.language")}
          value={LANG_LABELS[locale].native}
          onPress={() => router.push("/settings/language")}
        />
        <Row
          icon="⭐"
          label={t("profile.premium")}
          value={premium.active ? "Active" : "Free"}
          onPress={() => router.push("/settings/premium")}
        />
        <Row
          icon="🛒"
          label={t("shopping.title")}
          onPress={() => router.push("/settings/shopping-list")}
        />
      </View>

      <Text style={styles.section}>{t("profile.manage_account")}</Text>
      <View style={styles.card}>
        {isAnonymous ? (
          <Row icon="🔑" label={t("auth.sign_in")} onPress={() => router.push("/(auth)/sign-in")} />
        ) : (
          <Row icon="🚪" label={t("profile.logout")} onPress={handleSignOut} />
        )}
        <Row icon="🗑️" label={t("profile.delete_account")} onPress={handleDelete} destructive />
      </View>

      <Text style={styles.version}>Pratik Tarifler v1.0.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginTop: spacing.lg, marginBottom: spacing.xl },
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", marginBottom: spacing.md,
  },
  avatarText: { color: colors.white, fontSize: 36, fontWeight: "700" },
  name: { ...typography.h2, color: colors.dark },
  email: { ...typography.bodySm, color: colors.gray, marginTop: spacing.xs },
  premiumBadge: {
    marginTop: spacing.sm, backgroundColor: colors.premium,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill,
  },
  premiumText: { color: colors.white, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  stats: {
    flexDirection: "row", backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.lg,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { ...typography.h2, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.gray, marginTop: 2 },
  section: { ...typography.label, color: colors.gray, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: "hidden" },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderBottomColor: colors.divider, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: { fontSize: 20, marginRight: spacing.md },
  rowLabel: { ...typography.body, color: colors.dark, flex: 1 },
  rowValue: { ...typography.bodySm, color: colors.gray, marginRight: spacing.sm },
  chevron: { color: colors.grayLight, fontSize: 24, lineHeight: 24 },
  version: { ...typography.caption, color: colors.grayLight, textAlign: "center", marginTop: spacing.xl },
});
