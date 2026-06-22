import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";
import { GoogleAuth } from "google-auth-library";

const REGION = "europe-west1";

interface ValidateInput {
  receipt: string;
  platform: "ios" | "android" | "web";
  productId: string;
}

interface ValidateOutput {
  success: boolean;
  expires_at: number;
}

/**
 * Server-side IAP receipt verification.
 * iOS: verifies against Apple verifyReceipt endpoint.
 * Android: verifies against Google Play Developer API.
 * On success, writes premium status to /users/{uid}.
 */
export const validateIAP = onCall<ValidateInput, Promise<ValidateOutput>>(
  { region: REGION, cors: true },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign-in required.");
    }
    const { receipt, platform, productId } = request.data;

    if (!receipt || !platform || !productId) {
      throw new HttpsError("invalid-argument", "Missing fields.");
    }

    let expiresAt: number;
    let plan: "monthly" | "yearly";

    if (platform === "ios") {
      expiresAt = await verifyApple(receipt);
    } else if (platform === "android") {
      expiresAt = await verifyGoogle(receipt, productId);
    } else {
      throw new HttpsError("invalid-argument", "Unsupported platform.");
    }

    plan = productId.includes("yearly") ? "yearly" : "monthly";

    await admin
      .firestore()
      .doc(`users/${uid}`)
      .set(
        {
          premium: {
            active: expiresAt > Date.now(),
            plan,
            started_at: admin.firestore.FieldValue.serverTimestamp(),
            expires_at: admin.firestore.Timestamp.fromMillis(expiresAt),
            platform,
            receipt_id: receipt.substring(0, 32),
          },
        },
        { merge: true }
      );

    return { success: true, expires_at: expiresAt };
  }
);

async function verifyApple(receipt: string): Promise<number> {
  const sharedSecret = process.env.APPLE_SHARED_SECRET || "";
  const endpoints = [
    "https://buy.itunes.apple.com/verifyReceipt",
    "https://sandbox.itunes.apple.com/verifyReceipt",
  ];

  for (const url of endpoints) {
    try {
      const { data } = await axios.post(url, {
        "receipt-data": receipt,
        password: sharedSecret,
        "exclude-old-transactions": true,
      });
      if (data.status === 21007 && url.includes("buy")) continue; // Sandbox fallback
      if (data.status !== 0) {
        throw new HttpsError(
          "failed-precondition",
          `Apple verify status: ${data.status}`
        );
      }
      const latest = data.latest_receipt_info?.[0];
      const expiresMs = parseInt(latest?.expires_date_ms ?? "0", 10);
      if (!expiresMs) {
        throw new HttpsError("not-found", "No expiry in receipt.");
      }
      return expiresMs;
    } catch (err) {
      if ((err as HttpsError).code === "failed-precondition") throw err;
    }
  }
  throw new HttpsError("internal", "Apple verification failed.");
}

async function verifyGoogle(
  purchaseToken: string,
  productId: string
): Promise<number> {
  const packageName = process.env.ANDROID_PACKAGE_NAME ?? "app.pratiktarifler";
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });
  const client = await auth.getClient();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`;

  const res = await client.request<{ expiryTimeMillis: string; paymentState: number }>({
    url,
  });
  if (!res.data?.expiryTimeMillis) {
    throw new HttpsError("not-found", "No expiry from Google.");
  }
  return parseInt(res.data.expiryTimeMillis, 10);
}
