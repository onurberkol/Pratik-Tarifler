import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  // @ts-expect-error - getReactNativePersistence not in public types yet
  getReactNativePersistence,
} from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const firebaseConfig = Constants.expoConfig?.extra?.firebase as {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
};

if (!firebaseConfig?.apiKey) {
  throw new Error(
    "Firebase config missing. Set EXPO_PUBLIC_FIREBASE_* env vars."
  );
}

export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

// Auth with AsyncStorage persistence (RN does not have window.localStorage)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Already initialized (Fast Refresh)
  auth = getAuth(app);
}
export { auth };

// Firestore with persistent offline cache (40 MB)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: 40 * 1024 * 1024,
  }),
});

export const functions = getFunctions(app, "europe-west1");
export const storage = getStorage(app);
