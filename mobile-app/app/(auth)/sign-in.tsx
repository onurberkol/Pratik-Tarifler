import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { useRouter, Link } from "expo-router";
import { useTranslation } from "react-i18next";
import * as AppleAuthentication from "expo-apple-authentication";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { signInEmail, signInWithAppleIdToken } from "@/api/auth";
import { colors, radius, spacing, typography } from "@/theme";

export default function SignInScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = async () => {
    setLoading(true);
    try {
      await signInEmail(email, password);
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert(t("common.error"), t("auth.errors.wrong_credentials"));
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        await signInWithAppleIdToken(credential.identityToken, "");
        router.replace("/(tabs)");
      }
    } catch (err) {
      if ((err as { code?: string }).code !== "ERR_REQUEST_CANCELED") {
        Alert.alert(t("common.error"), (err as Error).message);
      }
    }
  };

  return (
    <Screen scrollable>
      <Pressable onPress={() => router.back()} style={styles.close}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <Text style={styles.title}>{t("auth.sign_in")}</Text>
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
          placeholderTextColor={colors.grayLight}
        />

        <Text style={styles.label}>{t("auth.password")}</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          placeholderTextColor={colors.grayLight}
        />

        <Button title={t("auth.sign_in")} onPress={handleEmail} loading={loading} />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t("auth.or")}</Text>
          <View style={styles.dividerLine} />
        </View>

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={14}
            style={{ width: "100%", height: 52, marginBottom: spacing.md }}
            onPress={handleApple}
          />
        )}

        <Text style={styles.footer}>
          {t("auth.no_account")}{" "}
          <Link href="/(auth)/sign-up" style={styles.link}>
            {t("auth.sign_up")}
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
    fontSize: 16, color: colors.dark,
    marginBottom: spacing.sm,
  },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.light },
  dividerText: { marginHorizontal: spacing.md, color: colors.gray, ...typography.caption },
  footer: { ...typography.body, color: colors.gray, textAlign: "center", marginTop: spacing.lg },
  link: { color: colors.primary, fontWeight: "600" },
});
