import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApi, hasPermission } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { logAudit } from "@/lib/audit";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const user = await verifyAdminApi();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(user, "write")) {
    return NextResponse.json({ error: "Yetkin yetersiz" }, { status: 403 });
  }

  const { recipe_id, force_ai = false } = await req.json();

  // Image job oluştur (Cloud Function bunu pickleyecek)
  await adminDb.collection("image_jobs").add({
    recipe_id,
    status: "queued",
    attempts: [],
    force_ai,
    triggered_by: user.uid,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  });

  await logAudit(user, "image.regenerate", { recipe_id, force_ai });

  return NextResponse.json({ ok: true, message: "Görsel kuyruğa alındı" });
}
