/**
 * Push Notifications Service
 * ==============================
 * Expo Notifications + Firebase Cloud Messaging
 * 
 * 6 Senaryo:
 *   1. Cook Mode Timer biten — "Pirinç hazır!"
 *   2. Günün Tarifi (08:00 her gün)
 *   3. Yarın sonu malzeme uyarısı — "Yumurta yarın sonu, kullan!"
 *   4. Haftalık öneri — "Bu hafta sınırsız 30 yeni tarif!"
 *   5. Premium fırsat — "Premium 50% İNDİRİM 3 gün"
 *   6. Yeni follower / sosyal (ileride)
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth, db } from '../api/client';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';


// ============================================================
// CONFIGURATION
// ============================================================
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


// ============================================================
// REGISTRATION — Permission al + token kaydet
// ============================================================
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on real devices');
    return null;
  }
  
  // Permission kontrolü
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Push notification permission denied');
    return null;
  }
  
  // Android: Channel oluştur
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Pratik Tarifler',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D89A1E',
      sound: 'default',
    });
    
    // Timer/cook channel
    await Notifications.setNotificationChannelAsync('cook_timer', {
      name: 'Pişirme Zamanlayıcısı',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250, 250],
      sound: 'timer_ding.wav',
    });
    
    // Daily recipe channel
    await Notifications.setNotificationChannelAsync('daily_recipe', {
      name: 'Günün Tarifi',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  
  // Expo push token al
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    });
    const token = tokenData.data;
    
    // Firestore'a kaydet
    const user = auth.currentUser;
    if (user) {
      await setDoc(
        doc(db, `users/${user.uid}/push_tokens/${token}`),
        {
          token,
          platform: Platform.OS,
          device_name: Device.modelName,
          registered_at: serverTimestamp(),
          last_active: serverTimestamp(),
        }
      );
    }
    
    // Local cache
    await AsyncStorage.setItem('push_token', token);
    
    return token;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}


// ============================================================
// LOCAL NOTIFICATIONS — Cook Mode Timer için
// ============================================================
export async function scheduleCookTimerNotification(
  stepTitle: string,
  durationSec: number,
  recipeId: string
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Zamanlayıcı bitti!',
      body: `${stepTitle} hazır`,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { 
        type: 'cook_timer',
        recipe_id: recipeId,
        step_title: stepTitle,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: durationSec,
      channelId: 'cook_timer',
    },
  });
  
  return id;
}


export async function cancelCookTimer(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}


// ============================================================
// DAILY RECIPE — 08:00 her sabah
// ============================================================
export async function scheduleDailyRecipeReminder(): Promise<string> {
  // Önce eskisini iptal et
  await cancelDailyRecipeReminder();
  
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🍳 Bugünün Tarifi Hazır!',
      body: 'Sana özel bir öneri var. Açıp keşfet 👀',
      data: { type: 'daily_recipe' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
      channelId: 'daily_recipe',
    },
  });
  
  await AsyncStorage.setItem('daily_recipe_notif_id', id);
  return id;
}


export async function cancelDailyRecipeReminder() {
  const id = await AsyncStorage.getItem('daily_recipe_notif_id');
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id);
    await AsyncStorage.removeItem('daily_recipe_notif_id');
  }
}


// ============================================================
// EXPIRY WARNINGS — Yarın sonu malzemeler
// ============================================================
export async function scheduleExpiryWarning(
  ingredient: string,
  expiresAt: Date
): Promise<string> {
  // 1 gün öncesine bildir
  const notifyAt = new Date(expiresAt);
  notifyAt.setDate(notifyAt.getDate() - 1);
  notifyAt.setHours(10, 0, 0); // sabah 10:00
  
  if (notifyAt < new Date()) {
    return ''; // geçmişte ise atla
  }
  
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `⚠️ ${ingredient} yarın sonu!`,
      body: `${ingredient}'in raf ömrü dolmak üzere. Hemen kullanabileceğin tarifler var.`,
      data: { 
        type: 'expiry_warning',
        ingredient,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notifyAt,
    },
  });
  
  return id;
}


// ============================================================
// SETTINGS — Kullanıcı tercihleri
// ============================================================
export interface NotificationPreferences {
  daily_recipe: boolean;
  cook_timer: boolean;
  expiry_warnings: boolean;
  weekly_suggestions: boolean;
  premium_offers: boolean;
  marketing: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  daily_recipe: true,
  cook_timer: true,
  expiry_warnings: true,
  weekly_suggestions: false,
  premium_offers: true,
  marketing: false,
};


export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const stored = await AsyncStorage.getItem('notification_prefs');
  if (stored) {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  }
  return DEFAULT_PREFERENCES;
}


export async function updateNotificationPreferences(
  prefs: Partial<NotificationPreferences>
): Promise<void> {
  const current = await getNotificationPreferences();
  const updated = { ...current, ...prefs };
  
  await AsyncStorage.setItem('notification_prefs', JSON.stringify(updated));
  
  // Firestore'a senkronize et
  const user = auth.currentUser;
  if (user) {
    await setDoc(
      doc(db, `users/${user.uid}/settings/notifications`),
      updated,
      { merge: true }
    );
  }
  
  // Schedule/cancel'ı uygula
  if (updated.daily_recipe) {
    await scheduleDailyRecipeReminder();
  } else {
    await cancelDailyRecipeReminder();
  }
}


// ============================================================
// NOTIFICATION TAP HANDLER — Deep linking
// ============================================================
export function setupNotificationTapHandler(
  onTap: (data: any) => void
) {
  // Foreground'da gelirken
  const foregroundSub = Notifications.addNotificationReceivedListener((notif) => {
    console.log('Foreground notification:', notif.request.content.data);
  });
  
  // Tıklandığında
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    onTap(data);
  });
  
  return () => {
    foregroundSub.remove();
    responseSub.remove();
  };
}


// ============================================================
// BACKEND: Cloud Function ile push gönderme
// ============================================================
/**
 * Bu function backend tarafında çalışır (cloud_functions/notifications.ts).
 * Buradan sadece şema referansı:
 * 
 *   functions.https.onCall(async ({ uid, payload }, context) => {
 *     const tokens = await db.collection(`users/${uid}/push_tokens`).get();
 *     for (const tokenDoc of tokens.docs) {
 *       await admin.messaging().send({
 *         token: tokenDoc.data().token,
 *         notification: payload.notification,
 *         data: payload.data,
 *         android: { priority: 'high', channelId: payload.channel },
 *         apns: { payload: { aps: { sound: 'default' } } },
 *       });
 *     }
 *   });
 */
