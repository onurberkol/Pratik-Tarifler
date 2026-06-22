import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { signUpEmail, linkEmailToAnonymous } from "@/api/auth";
import { useUserStore } from "@/store/userStore";
import { colors, radius, spacing, typography } from "@/theme";

export default function SignUpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAnonymous = useUserStore((s) => s.isAnonymous);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (password.length < 8) {
      Alert.alert(t("common.error"), t("auth.errors.weak_password"));
      return;
    }
    setLoading(true);
    try {
      if (isAnonymous) {
        await linkEmailToAnonymous(email, password);
      } else {
        await signUpEmail(email, password);
      }
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert(t("common.error"), (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scrollable>
      <Pressable onPress={() => router.back()} style={styles.close}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <Text style={styles.title}>{t("auth.sign_up")}</Text>
      <Text style={styles.subtitle}>{t("app.tagline")}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>{t("auth.email")}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />

        <Text style={styles.label}>{t("auth.password")}</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />

        <Button title={t("auth.sign_up")} onPress={handle} loading={loading} />

        <Text style={styles.footer}>
          {t("auth.have_account")}{" "}
          <Link href="/(auth)/sign-in" style={styles.link}>
            {t("auth.sign_in")}
          </Link>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { alignSelf: "flex-end", padding: spacing.sm },
  closeText: { fontSize: 24, color: colors.dark },
  title: { ...typography.h1, color: colors.dark, marginTop: spacing.md },
  subtitle: { ...typography.body, color: colors.gray, marginBottom: spacing.xl },
  form: { gap: spacing.sm },
  label: { ...typography.label, color: colors.gray, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, height: 52,
    borderWidth: 1, borderColor: colors.light,
    fontSize: 16, color: colors.dark, marginBottom: spacing.sm,
  },
  footer: { ...typography.body, color: colors.gray, textAlign: "center", marginTop: spacing.lg },
  link: { color: colors.primary, fontWeight: "600" },
});
