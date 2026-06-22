import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";

import tr from "@/locales/tr.json";
import en from "@/locales/en.json";
import de from "@/locales/de.json";
import fr from "@/locales/fr.json";
import it from "@/locales/it.json";
import es from "@/locales/es.json";
import pt from "@/locales/pt.json";
import el from "@/locales/el.json";
import nl from "@/locales/nl.json";
import ru from "@/locales/ru.json";
import sr from "@/locales/sr.json";
import ar from "@/locales/ar.json";
import he from "@/locales/he.json";

import type { LangCode } from "@/types";

export const SUPPORTED_LANGS: LangCode[] = [
  "tr", "en", "de", "fr", "it", "es", "pt", "el", "nl", "ru", "sr", "ar", "he",
];

export const RTL_LANGS = new Set<LangCode>(["ar", "he"]);

export const LANG_LABELS: Record<LangCode, { native: string; english: string; flag: string }> = {
  tr: { native: "Türkçe", english: "Turkish", flag: "🇹🇷" },
  en: { native: "English", english: "English", flag: "🇬🇧" },
  de: { native: "Deutsch", english: "German", flag: "🇩🇪" },
  fr: { native: "Français", english: "French", flag: "🇫🇷" },
  it: { native: "Italiano", english: "Italian", flag: "🇮🇹" },
  es: { native: "Español", english: "Spanish", flag: "🇪🇸" },
  pt: { native: "Português", english: "Portuguese", flag: "🇵🇹" },
  el: { native: "Ελληνικά", english: "Greek", flag: "🇬🇷" },
  nl: { native: "Nederlands", english: "Dutch", flag: "🇳🇱" },
  ru: { native: "Русский", english: "Russian", flag: "🇷🇺" },
  sr: { native: "Српски", english: "Serbian", flag: "🇷🇸" },
  ar: { native: "العربية", english: "Arabic", flag: "🇸🇦" },
  he: { native: "עברית", english: "Hebrew", flag: "🇮🇱" },
};

const STORAGE_KEY = "user_locale_v1";

export async function setupI18n(): Promise<LangCode> {
  const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as LangCode | null;
  const device = Localization.getLocales()[0]?.languageCode ?? "en";
  const initial: LangCode =
    saved ?? (SUPPORTED_LANGS.includes(device as LangCode) ? (device as LangCode) : "en");

  await i18n.use(initReactI18next).init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      de: { translation: de },
      fr: { translation: fr },
      it: { translation: it },
      es: { translation: es },
      pt: { translation: pt },
      el: { translation: el },
      nl: { translation: nl },
      ru: { translation: ru },
      sr: { translation: sr },
      ar: { translation: ar },
      he: { translation: he },
    },
    lng: initial,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    compatibilityJSON: "v4",
  });

  const shouldRTL = RTL_LANGS.has(initial);
  if (I18nManager.isRTL !== shouldRTL) {
    I18nManager.allowRTL(shouldRTL);
    I18nManager.forceRTL(shouldRTL);
  }
  return initial;
}

export async function changeLanguage(lng: LangCode): Promise<void> {
  await i18n.changeLanguage(lng);
  await AsyncStorage.setItem(STORAGE_KEY, lng);
  const shouldRTL = RTL_LANGS.has(lng);
  if (I18nManager.isRTL !== shouldRTL) {
    I18nManager.allowRTL(shouldRTL);
    I18nManager.forceRTL(shouldRTL);
    if (!__DEV__) {
      await Updates.reloadAsync();
    }
  }
}

export default i18n;
