import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, UserPlus, Crown, Ban, MoreVertical, Mail } from "lucide-react";
import { formatDate, timeAgo } from "@/lib/utils";
import { SUBSCRIPTION_STATUS } from "@/lib/constants";

async function getUsers() {
  return {
    total: 24580,
    active: 18432,
    premium: 942,
    sample: [
      { uid: "uid_001", email: "ayse.k@example.com", display_name: "Ayşe K.", language: "tr",
        subscription: { status: "active" as const, plan: "yearly" as const, expires_at: Date.now() + 86400000 * 200 },
        created_at: Date.now() - 86400000 * 45, last_active: Date.now() - 3600000, banned: false },
      { uid: "uid_002", email: "mehmet@example.com", display_name: "Mehmet Y.", language: "tr",
        subscription: { status: "trial" as const, plan: "monthly" as const, trial_ends_at: Date.now() + 86400000 * 3 },
        created_at: Date.now() - 86400000 * 4, last_active: Date.now() - 600000, banned: false },
      { uid: "uid_003", email: "sarah@example.com", display_name: "Sarah J.", language: "en",
        subscription: { status: "free" as const, plan: null },
        created_at: Date.now() - 86400000 * 90, last_active: Date.now() - 86400000 * 7, banned: false },
      { uid: "uid_004", email: "test@spam.io", display_name: "Test User", language: "tr",
        subscription: { status: "free" as const, plan: null },
        created_at: Date.now() - 86400000 * 2, last_active: Date.now() - 3600000, banned: true, ban_reason: "Spam" },
    ],
  };
}

export default async function UsersPage() {
  const data = await getUsers();
  const premiumPct = ((data.premium / data.total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Kullanıcılar</h1>
          <p className="text-muted-foreground">{data.total.toLocaleString("tr-TR")} kullanıcı</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />CSV İndir</Button>
          <Button variant="outline"><UserPlus className="mr-2 h-4 w-4" />Manuel Kayıt</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
            <p className="mt-1 text-3xl font-bold">{data.total.toLocaleString("tr-TR")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Aktif (30 gün)</p>
            <p className="mt-1 text-3xl font-bold text-basil">{data.active.toLocaleString("tr-TR")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Premium Aboneler</p>
            <p className="mt-1 text-3xl font-bold text-tomato">{data.premium.toLocaleString("tr-TR")}</p>
            <p className="mt-1 text-xs text-muted-foreground">%{premiumPct} dönüşüm</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[280px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="E-posta, isim veya UID..." className="pl-10" />
            </div>
            <select className="rounded-md border bg-background px-3 text-sm">
              <option value="">Tüm abonelik</option>
              {Object.entries(SUBSCRIPTION_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select className="rounded-md border bg-background px-3 text-sm">
              <option value="">Tüm diller</option>
              <option>Türkçe</option><option>English</option>
            </select>
            <select className="rounded-md border bg-background px-3 text-sm">
              <option value="">Tüm durum</option>
              <option>Aktif</option><option>Yasaklı</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Kullanıcı Listesi</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="pb-3">Kullanıcı</th>
                <th className="pb-3">Abonelik</th>
                <th className="pb-3">Dil</th>
                <th className="pb-3">Kayıt</th>
                <th className="pb-3">Son Aktif</th>
                <th className="pb-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {data.sample.map((u) => {
                const subStatus = SUBSCRIPTION_STATUS[u.subscription.status];
                return (
                  <tr key={u.uid} className="border-b last:border-0 hover:bg-secondary/30">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tomato text-sm font-bold text-white">
                          {(u.display_name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{u.display_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${subStatus.color}`}>
                        {subStatus.label}
                      </span>
                      {u.subscription.plan && (
                        <div className="mt-1 text-xs text-muted-foreground">{u.subscription.plan === "yearly" ? "Yıllık" : "Aylık"}</div>
                      )}
                    </td>
                    <td className="py-3 text-sm uppercase">{u.language}</td>
                    <td className="py-3 text-sm text-muted-foreground">{formatDate(u.created_at)}</td>
                    <td className="py-3 text-sm text-muted-foreground">{timeAgo(u.last_active)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {u.subscription.status === "free" ? (
                          <Button variant="ghost" size="icon" title="Premium ver">
                            <Crown className="h-4 w-4 text-honey" />
                          </Button>
                        ) : null}
                        <Button variant="ghost" size="icon" title="E-posta gönder">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Yasakla" disabled={u.banned}>
                          <Ban className={`h-4 w-4 ${u.banned ? "text-destructive" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
