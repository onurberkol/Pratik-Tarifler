import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApi, hasPermission } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { logAudit } from "@/lib/audit";
import { FieldValue } from "firebase-admin/firestore";

// GET — Liste (filtre + sayfalama)
export async function GET(req: NextRequest) {
  const user = await verifyAdminApi();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const language = searchParams.get("lang") || "tr";
  const cuisine = searchParams.get("cuisine");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = adminDb.collection(`recipes_${language}`).limit(limit);
  if (cuisine) query = query.where("cuisine", "==", cuisine) as any;

  const snap = await query.get();
  const recipes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json({ recipes, count: snap.size });
}

// POST — Yeni tarif
export async function POST(req: NextRequest) {
  const user = await verifyAdminApi();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!hasPermission(user, "write")) {
    return NextResponse.json({ error: "Yetkin yetersiz" }, { status: 403 });
  }

  const body = await req.json();
  const language = body.language || "tr";
  const docRef = await adminDb.collection(`recipes_${language}`).add({
    ...body,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
    image_status: "pending",
    published: body.published ?? true,
  });

  await logAudit(user, "recipe.create", { recipe_id: docRef.id, title: body.title });

  return NextResponse.json({ id: docRef.id });
}
