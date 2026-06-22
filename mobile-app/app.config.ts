import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Pratik Tarifler",
  slug: "pratik-tarifler",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "pratiktarifler",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#E85D04",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "app.pratiktarifler",
    buildNumber: "1",
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      NSMicrophoneUsageDescription:
        "Pratik Tarifler uses the microphone for hands-free voice commands during cooking mode.",
      NSSpeechRecognitionUsageDescription:
        "Pratik Tarifler uses speech recognition to understand voice commands like 'next' or 'previous' while you cook.",
      ITSAppUsesNonExemptEncryption: false,
      CFBundleLocalizations: [
        "tr", "en", "de", "fr", "it", "es", "pt", "el", "nl", "ru", "sr", "ar", "he",
      ],
    },
    associatedDomains: ["applinks:pratiktarifler.app"],
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#E85D04",
    },
    package: "app.pratiktarifler",
    versionCode: 1,
    permissions: ["RECORD_AUDIO"],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: "https", host: "pratiktarifler.app" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "expo-localization",
    "expo-apple-authentication",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#E85D04",
        image: "./assets/splash.png",
        imageWidth: 200,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "REPLACE_WITH_YOUR_EAS_PROJECT_ID",
    },
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
    googleSignIn: {
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    },
  },
  updates: {
    url: "https://u.expo.dev/REPLACE_WITH_YOUR_EAS_PROJECT_ID",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  owner: "your-eas-account",
});
