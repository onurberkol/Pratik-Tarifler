import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();
  if (!idToken) return NextResponse.json({ error: "ID token gerekli" }, { status: 400 });

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Admin yetki kontrolü
    if (!ADMIN_EMAILS.includes(decoded.email || "")) {
      return NextResponse.json(
        { error: "Bu hesap admin paneline erişim yetkisine sahip değil" },
        { status: 403 }
      );
    }

    // 8 saatlik session cookie
    const expiresIn = 8 * 60 * 60 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    cookies().set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ ok: true, email: decoded.email });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Token doğrulanamadı" }, { status: 401 });
  }
}
