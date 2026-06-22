/**
 * App.tsx — Ana Entry Point
 * =============================
 * - i18n init (TR default)
 * - Firebase init (api/client.ts'de oluyor)
 * - Theme provider (gelecekte)
 * - RootNavigator
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import RootNavigator from './RootNavigator';

// i18n resources
import tr from './i18n/tr.json';
import en from './i18n/en.json';

// i18n init
i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: 'tr',           // Default Türkçe
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <RootNavigator />
    </GestureHandlerRootView>
  );
}
