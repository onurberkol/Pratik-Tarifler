import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { setupI18n } from "@/lib/i18n";
import { onAuthChange } from "@/api/auth";
import { signInAnonymous } from "@/api/auth";
import { useUserStore, subscribeUserProfile } from "@/store/userStore";
import { useSettingsStore } from "@/store/settingsStore";
import { listenForPurchases, watchPremiumStatus } from "@/api/premium";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const setAuthUser = useUserStore((s) => s.setAuthUser);
  const setPremium = useUserStore((s) => s.setPremium);
  const setLoading = useUserStore((s) => s.setLoading);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    let unsubPremium: (() => void) | undefined;
    let unsubPurchases: (() => void) | undefined;

    async function bootstrap() {
      try {
        await hydrateSettings();
        const initialLocale = await setupI18n();
        setLocale(initialLocale);

        unsubPurchases = listenForPurchases();

        const unsubAuth = onAuthChange(async (user) => {
          setAuthUser(user);
          if (!user) {
            try {
              await signInAnonymous();
            } catch (err) {
              console.warn("Anonymous sign-in failed:", err);
            }
            setLoading(false);
            return;
          }
          unsubProfile?.();
          unsubProfile = subscribeUserProfile(user.uid);
          unsubPremium?.();
          unsubPremium = watchPremiumStatus(setPremium);
          setLoading(false);
        });

        setReady(true);
        await SplashScreen.hideAsync();

        return () => {
          unsubAuth();
          unsubProfile?.();
          unsubPremium?.();
          unsubPurchases?.();
        };
      } catch (err) {
        console.error("Bootstrap error:", err);
        setReady(true);
        await SplashScreen.hideAsync();
      }
    }

    bootstrap();
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
            <Stack.Screen name="recipe/[id]" />
            <Stack.Screen name="recipe/cook/[id]" options={{ animation: "fade" }} />
            <Stack.Screen name="settings/language" options={{ presentation: "modal" }} />
            <Stack.Screen name="settings/premium" options={{ presentation: "modal" }} />
            <Stack.Screen name="settings/shopping-list" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
