import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Key, Bell, Database } from "lucide-react";

export default async function SettingsPage() {
  const user = await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Sistem ayarları ve admin yönetimi</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-tomato" />
            <CardTitle>Admin Kullanıcıları</CardTitle>
          </div>
          <CardDescription>Panele erişimi olan kullanıcılar ve rolleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { email: "founder@pratiktarifler.app", role: "super_admin", name: "Onur K." },
              { email: "icerik@pratiktarifler.app", role: "content_editor", name: "Editör" },
              { email: "destek@pratiktarifler.app", role: "support_agent", name: "Destek Ekibi" },
            ].map((a) => (
              <div key={a.email} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tomato text-sm font-bold text-white">
                    {a.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{a.role.replace("_", " ")}</Badge>
                  <Button variant="outline" size="sm">Düzenle</Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-3 w-full">+ Admin Ekle</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-tomato" />
            <CardTitle>API Anahtarları</CardTitle>
          </div>
          <CardDescription>3. parti entegrasyonlar (Firebase Secrets olarak saklanır)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "OpenAI", status: "✓ Aktif", masked: "sk-proj-••••XYZW" },
            { name: "RevenueCat", status: "✓ Aktif", masked: "sk_••••5421" },
            { name: "Google Vision", status: "✓ Aktif", masked: "Service Account" },
            { name: "Sentry DSN", status: "✓ Aktif", masked: "https://••••@sentry.io" },
            { name: "Stripe", status: "⚠ Test mode", masked: "sk_test_••••" },
          ].map((k) => (
            <div key={k.name} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex-1">
                <div className="font-medium">{k.name}</div>
                <div className="font-mono text-xs text-muted-foreground">{k.masked}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{k.status}</span>
                <Button variant="outline" size="sm">Yenile</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-tomato" />
            <CardTitle>Audit Log</CardTitle>
          </div>
          <CardDescription>Kim ne zaman ne yaptı — son işlemler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="font-medium">Onur K.</span> · Yeni tarif oluşturdu: <span className="font-mono">tr-mantar-corbasi</span>
              </div>
              <span className="text-xs text-muted-foreground">2 dk önce</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="font-medium">Onur K.</span> · Push bildirim gönderdi: "🌸 İlkbahar tarifleri" (24K alıcı)
              </div>
              <span className="text-xs text-muted-foreground">35 dk önce</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="font-medium">Editör</span> · Kullanıcıya Premium verdi: ayse@example.com
              </div>
              <span className="text-xs text-muted-foreground">1 sa önce</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="font-medium">Destek Ekibi</span> · Ticket #T-4818 çözüldü
              </div>
              <span className="text-xs text-muted-foreground">2 sa önce</span>
            </div>
          </div>
          <Button variant="outline" className="mt-3 w-full">Tüm Logları Görüntüle</Button>
        </CardContent>
      </Card>
    </div>
  );
}
