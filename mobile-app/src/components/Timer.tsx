import React, { useState, useEffect, useRef } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing, typography } from "@/theme";

interface Props {
  seconds: number;
  label?: string;
}

export function Timer({ seconds, label }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining]);

  useEffect(() => setRemaining(seconds), [seconds]);

  const mm = Math.floor(remaining / 60).toString().padStart(2, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Text style={styles.time}>
        {mm}:{ss}
      </Text>
      <View style={styles.controls}>
        <Pressable
          style={[styles.btn, running ? styles.btnPause : styles.btnPlay]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setRunning((r) => !r);
          }}
        >
          <Text style={styles.btnText}>{running ? "❚❚" : "▶"}</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnReset]}
          onPress={() => {
            setRunning(false);
            setRemaining(seconds);
          }}
        >
          <Text style={[styles.btnText, { color: colors.dark }]}>↻</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginVertical: spacing.md,
  },
  label: { ...typography.label, color: colors.primary, marginBottom: spacing.sm },
  time: {
    fontSize: 56,
    fontWeight: "700",
    color: colors.dark,
    fontVariant: ["tabular-nums"],
  },
  controls: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPlay: { backgroundColor: colors.primary },
  btnPause: { backgroundColor: colors.accent },
  btnReset: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.light },
  btnText: { color: colors.white, fontSize: 20, fontWeight: "700" },
});
