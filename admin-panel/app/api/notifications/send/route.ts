import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApi, hasPermission } from "@/lib/auth";
import { adminDb, adminMessaging } from "@/lib/firebase/admin";
import { logAudit } from "@/lib/audit";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const user = await verifyAdminApi();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(user, "write")) {
    return NextResponse.json({ error: "Yetkin yetersiz" }, { status: 403 });
  }

  const { title, body, image_url, deep_link, segment } = await req.json();

  // 1) Hedef kullanıcıları bul
  let userQuery = adminDb.collection("users").where("push_token", "!=", null);
  if (segment.type === "premium") {
    userQuery = userQuery.where("subscription.status", "in", ["trial", "active"]);
  } else if (segment.type === "free") {
    userQuery = userQuery.where("subscription.status", "==", "free");
  } else if (segment.type === "language" && segment.languages) {
    userQuery = userQuery.where("language", "in", segment.languages);
  }

  const userSnap = await userQuery.get();
  const tokens = userSnap.docs.map((d) => d.data().push_token).filter(Boolean);

  // 2) FCM ile gönder (500'lük gruplar)
  let delivered = 0;
  let failed = 0;
  for (let i = 0; i < tokens.length; i += 500) {
    const batch = tokens.slice(i, i + 500);
    const response = await adminMessaging.sendEachForMulticast({
      tokens: batch,
      notification: { title, body, imageUrl: image_url },
      data: deep_link ? { deep_link } : undefined,
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default", badge: 1 } } },
    });
    delivered += response.successCount;
    failed += response.failureCount;
  }

  // 3) Kampanya kaydı oluştur
  const campaignRef = await adminDb.collection("push_campaigns").add({
    title, body, image_url, deep_link, segment,
    status: "sent",
    recipients_count: tokens.length,
    delivered_count: delivered,
    failed_count: failed,
    opened_count: 0,
    sent_at: FieldValue.serverTimestamp(),
    created_by: user.uid,
    created_at: FieldValue.serverTimestamp(),
  });

  await logAudit(user, "notification.send", {
    campaign_id: campaignRef.id,
    recipients: tokens.length,
    delivered,
  });

  return NextResponse.json({ campaign_id: campaignRef.id, delivered, failed, total: tokens.length });
}
