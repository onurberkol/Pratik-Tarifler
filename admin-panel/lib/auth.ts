import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "./firebase/admin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());

export type AdminUser = {
  uid: string;
  email: string;
  name?: string;
  role: "super_admin" | "content_editor" | "support_agent" | "viewer";
};

/** Server Component / Action içinde — oturum doğrula, admin değilse redirect */
export async function requireAdmin(): Promise<AdminUser> {
  const sessionCookie = cookies().get("__session")?.value;
  if (!sessionCookie) redirect("/login");

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (!ADMIN_EMAILS.includes(decoded.email || "")) {
      redirect("/login?error=unauthorized");
    }
    return {
      uid: decoded.uid,
      email: decoded.email!,
      name: decoded.name,
      role: (decoded.role as AdminUser["role"]) || "viewer",
    };
  } catch (e) {
    redirect("/login?error=expired");
  }
}

/** API route içinde — JSON response döner */
export async function verifyAdminApi(): Promise<AdminUser | null> {
  const sessionCookie = cookies().get("__session")?.value;
  if (!sessionCookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (!ADMIN_EMAILS.includes(decoded.email || "")) return null;
    return {
      uid: decoded.uid,
      email: decoded.email!,
      name: decoded.name,
      role: (decoded.role as AdminUser["role"]) || "viewer",
    };
  } catch {
    return null;
  }
}

export function hasPermission(
  user: AdminUser,
  action: "read" | "write" | "delete" | "super"
): boolean {
  const matrix = {
    super_admin: ["read", "write", "delete", "super"],
    content_editor: ["read", "write"],
    support_agent: ["read"],
    viewer: ["read"],
  };
  return matrix[user.role].includes(action);
}
