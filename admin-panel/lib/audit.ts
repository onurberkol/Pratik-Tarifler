import { adminDb } from "./firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { AdminUser } from "./auth";

export type AuditAction =
  | "recipe.create" | "recipe.update" | "recipe.delete" | "recipe.bulk_import"
  | "user.update" | "user.delete" | "user.grant_premium" | "user.revoke_premium"
  | "notification.send" | "notification.schedule" | "notification.cancel"
  | "announcement.create" | "announcement.update" | "announcement.delete"
  | "config.update" | "image.regenerate" | "support.reply" | "support.close";

export async function logAudit(
  user: AdminUser,
  action: AuditAction,
  details: Record<string, unknown> = {}
) {
  await adminDb.collection("audit_logs").add({
    admin_uid: user.uid,
    admin_email: user.email,
    action,
    details,
    timestamp: FieldValue.serverTimestamp(),
    ip: details.ip || null,
  });
}
