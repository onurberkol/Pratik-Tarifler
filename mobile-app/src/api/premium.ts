import * as InAppPurchases from "expo-in-app-purchases";
import { Platform } from "react-native";
import { httpsCallable } from "firebase/functions";
import { functions, auth } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PremiumStatus } from "@/types";

// SKU map — keep in sync with App Store Connect / Google Play Console
export const PRODUCTS = {
  monthly: Platform.select({
    ios: "app.pratiktarifler.premium.monthly",
    android: "premium_monthly",
  })!,
  yearly: Platform.select({
    ios: "app.pratiktarifler.premium.yearly",
    android: "premium_yearly",
  })!,
} as const;

export type PremiumPlan = keyof typeof PRODUCTS;

let connected = false;

async function ensureConnected() {
  if (connected) return;
  await InAppPurchases.connectAsync();
  connected = true;
}

export async function loadProducts(): Promise<InAppPurchases.IAPItemDetails[]> {
  await ensureConnected();
  const { results, responseCode } = await InAppPurchases.getProductsAsync(
    Object.values(PRODUCTS)
  );
  if (responseCode !== InAppPurchases.IAPResponseCode.OK || !results) {
    throw new Error("iap_load_failed");
  }
  return results;
}

/**
 * Begin a purchase. The system handles the payment sheet.
 * The actual entitlement toggle happens server-side via finalizePurchase below.
 */
export async function purchase(plan: PremiumPlan): Promise<void> {
  await ensureConnected();
  await InAppPurchases.purchaseItemAsync(PRODUCTS[plan]);
}

/**
 * Set up the purchase listener. Call this once at app start.
 * On a successful purchase, the receipt is sent to Cloud Functions for
 * server-side verification.
 */
export function listenForPurchases(
  onSuccess?: (plan: PremiumPlan) => void,
  onError?: (err: Error) => void
): () => void {
  return InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
    if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
      if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) return;
      onError?.(new Error(`iap_error: ${errorCode}`));
      return;
    }
    if (!results) return;

    for (const purchase of results) {
      if (!purchase.acknowledged) {
        try {
          await finalizePurchase(purchase);
          await InAppPurchases.finishTransactionAsync(purchase, false);
          const plan = (Object.entries(PRODUCTS).find(
            ([, sku]) => sku === purchase.productId
          )?.[0] ?? "monthly") as PremiumPlan;
          onSuccess?.(plan);
        } catch (err) {
          onError?.(err as Error);
        }
      }
    }
  });
}

/**
 * Send receipt to Cloud Function for server-side verification.
 * The function writes the premium status to Firestore.
 */
async function finalizePurchase(
  purchase: InAppPurchases.InAppPurchase
): Promise<void> {
  const validateIAP = httpsCallable<
    { receipt: string; platform: string; productId: string },
    { success: boolean; expires_at: number }
  >(functions, "validateIAP");
  const receipt =
    Platform.OS === "ios"
      ? // iOS: transactionReceipt is base64
        (purchase as unknown as { transactionReceipt: string }).transactionReceipt
      : // Android: purchaseToken
        (purchase as unknown as { purchaseToken: string }).purchaseToken;
  await validateIAP({
    receipt,
    platform: Platform.OS,
    productId: purchase.productId,
  });
}

/**
 * Restore previously-purchased subscriptions.
 */
export async function restorePurchases(): Promise<void> {
  await ensureConnected();
  await InAppPurchases.getPurchaseHistoryAsync();
  // The purchase listener will handle any restored items.
}

/**
 * Subscribe to real-time premium status from Firestore.
 */
export function watchPremiumStatus(
  callback: (status: PremiumStatus) => void
): () => void {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    callback({ active: false });
    return () => {};
  }
  return onSnapshot(doc(db, "users", uid), (snap) => {
    const data = snap.data();
    callback((data?.premium as PremiumStatus) ?? { active: false });
  });
}

export async function disconnect() {
  if (connected) {
    await InAppPurchases.disconnectAsync();
    connected = false;
  }
}
