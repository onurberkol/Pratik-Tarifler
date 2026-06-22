import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApi, hasPermission } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { logAudit } from "@/lib/audit";

// PATCH — Premium ver/al, ban, vb.
export async function PATCH(req: NextRequest) {
  const user = await verifyAdminApi();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(user, "write")) {
    return NextResponse.json({ error: "Yetkin yetersiz" }, { status: 403 });
  }

  const { uid, action, duration_days = 365 } = await req.json();

  const userRef = adminDb.collection("users").doc(uid);

  if (action === "grant_premium") {
    const expires = Date.now() + duration_days * 86400000;
    await userRef.update({
      "subscription.status": "active",
      "subscription.plan": "yearly",
      "subscription.expires_at": expires,
      "subscription.granted_by_admin": user.uid,
    });
    await logAudit(user, "user.grant_premium", { target_uid: uid, duration_days });
    return NextResponse.json({ ok: true, expires });
  }

  if (action === "revoke_premium") {
    await userRef.update({
      "subscription.status": "free",
      "subscription.plan": null,
      "subscription.expires_at": null,
    });
    await logAudit(user, "user.revoke_premium", { target_uid: uid });
    return NextResponse.json({ ok: true });
  }

  if (action === "ban") {
    const { reason } = await req.json();
    await userRef.update({ banned: true, ban_reason: reason || "Admin kararı" });
    await logAudit(user, "user.update", { target_uid: uid, banned: true, reason });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Bilinmeyen aksiyon" }, { status: 400 });
}
