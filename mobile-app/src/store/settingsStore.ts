import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LangCode, DietTag } from "@/types";

interface SettingsState {
  locale: LangCode;
  dietaryFilters: DietTag[];
  metricSystem: boolean;
  notifications: {
    dailyRecipe: boolean;
    timerAlerts: boolean;
  };
  hasSeenOnboarding: boolean;

  setLocale: (l: LangCode) => void;
  setDietaryFilters: (f: DietTag[]) => void;
  setMetric: (m: boolean) => void;
  setNotifications: (n: Partial<SettingsState["notifications"]>) => void;
  setSeenOnboarding: (v: boolean) => void;
  hydrate: () => Promise<void>;
}

const STORAGE_KEY = "settings_v1";

export const useSettingsStore = create<SettingsState>((set, get) => ({
  locale: "en",
  dietaryFilters: [],
  metricSystem: true,
  notifications: { dailyRecipe: true, timerAlerts: true },
  hasSeenOnboarding: false,

  setLocale: (l) => {
    set({ locale: l });
    persist(get());
  },
  setDietaryFilters: (f) => {
    set({ dietaryFilters: f });
    persist(get());
  },
  setMetric: (m) => {
    set({ metricSystem: m });
    persist(get());
  },
  setNotifications: (n) => {
    set((s) => ({ notifications: { ...s.notifications, ...n } }));
    persist(get());
  },
  setSeenOnboarding: (v) => {
    set({ hasSeenOnboarding: v });
    persist(get());
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Partial<SettingsState>;
        set(data);
      }
    } catch (err) {
      console.warn("Settings hydrate failed:", err);
    }
  },
}));

function persist(state: SettingsState) {
  const { locale, dietaryFilters, metricSystem, notifications, hasSeenOnboarding } = state;
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      locale,
      dietaryFilters,
      metricSystem,
      notifications,
      hasSeenOnboarding,
    })
  ).catch(() => {});
}
