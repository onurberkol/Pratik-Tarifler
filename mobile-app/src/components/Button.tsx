import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  PressableProps,
} from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends Omit<PressableProps, "style"> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  variant = "primary",
  loading,
  fullWidth = true,
  style,
  disabled,
  ...rest
}: Props) {
  const bgColor =
    variant === "primary"
      ? colors.primary
      : variant === "danger"
      ? colors.danger
      : variant === "secondary"
      ? colors.cream
      : "transparent";
  const textColor =
    variant === "secondary"
      ? colors.dark
      : variant === "ghost"
      ? colors.primary
      : colors.white;
  const borderColor =
    variant === "secondary" ? colors.light : "transparent";

  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bgColor, borderColor, borderWidth: variant === "secondary" ? 1 : 0 },
        fullWidth && { width: "100%" },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  text: {
    ...typography.button,
  },
});
