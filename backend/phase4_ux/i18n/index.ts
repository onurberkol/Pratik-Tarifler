/**
 * i18n Configuration
 * =====================
 * 13 dil + otomatik RTL (Arapça/İbranice)
 * 
 * KULLANIM (App.tsx'de):
 *   import './i18n';  // bu dosyayı bir kere import et
 *   
 * SONRA:
 *   import { useTranslation } from 'react-i18next';
 *   const { t, i18n } = useTranslation();
 *   t('mode.title')          // "Bugün ne pişirelim?"
 *   i18n.changeLanguage('en') // dil değiştir
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

// Tüm dilleri import et
import tr from './tr.json';
import en from './en.json';
import de from './de.json';
import fr from './fr.json';
import it from './it.json';
import es from './es.json';
import pt from './pt.json';
import el from './el.json';
import nl from './nl.json';
import ru from './ru.json';
import sr from './sr.json';
import ar from './ar.json';
import he from './he.json';

const SUPPORTED_LANGUAGES = [
  'tr', 'en', 'de', 'fr', 'it', 'es', 
  'pt', 'el', 'nl', 'ru', 'sr', 'ar', 'he'
] as const;

// RTL diller
const RTL_LANGUAGES = ['ar', 'he'];

// Resource bundle
const resources = {
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
};


/**
 * Cihaz dilini tespit et ve uygula
 */
async function detectInitialLanguage(): Promise<string> {
  try {
    // Önce kullanıcının seçtiği dili kontrol et
    const savedLang = await AsyncStorage.getItem('user_language');
    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang as any)) {
      return savedLang;
    }
    
    // Cihaz diline bak
    const deviceLocales = Localization.getLocales();
    for (const locale of deviceLocales) {
      const code = locale.languageCode;
      if (code && SUPPORTED_LANGUAGES.includes(code as any)) {
        return code;
      }
    }
  } catch (e) {
    console.warn('Language detection failed:', e);
  }
  
  return 'tr'; // default fallback
}


/**
 * RTL gerekiyorsa zorla
 */
function applyRTL(lang: string) {
  const isRTL = RTL_LANGUAGES.includes(lang);
  
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    // NOT: RTL değişikliği uygulamayı restart gerektirir
    // Bu yüzden ilk açılışta hemen ayarlanmalı
  }
}


/**
 * Dil değiştirme — async (persist + RTL)
 */
export async function changeLanguage(lang: string): Promise<void> {
  if (!SUPPORTED_LANGUAGES.includes(lang as any)) {
    console.warn(`Unsupported language: ${lang}`);
    return;
  }
  
  await AsyncStorage.setItem('user_language', lang);
  await i18n.changeLanguage(lang);
  applyRTL(lang);
}


export async function initI18n() {
  const initialLang = await detectInitialLanguage();
  applyRTL(initialLang);
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang,
      fallbackLng: 'en',
      
      // Türkçe + İngilizce için interpolation
      interpolation: {
        escapeValue: false, // React zaten XSS'e karşı koruyor
      },
      
      // Performans
      react: {
        useSuspense: false, // Suspense kullanmıyoruz
      },
      
      // Pluralization
      pluralSeparator: '_',
      
      // Debug (geliştirme)
      debug: __DEV__,
    });
}


export { SUPPORTED_LANGUAGES, RTL_LANGUAGES };
export default i18n;
