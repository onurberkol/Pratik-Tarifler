import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LifeBuoy, Search, AlertCircle, MessageSquare, CheckCircle2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";

async function getTickets() {
  return {
    open: 12, in_progress: 5, resolved_today: 18,
    sample: [
      { id: "T-4821", user_email: "ayse@example.com", subject: "Premium ödememe rağmen aktif olmadı",
        category: "billing", priority: "high" as const, status: "open" as const, created_at: Date.now() - 3600000 },
      { id: "T-4820", user_email: "mehmet@example.com", subject: "Buzdolabı taraması her seferinde donuyor",
        category: "bug", priority: "high" as const, status: "in_progress" as const, created_at: Date.now() - 7200000 },
      { id: "T-4819", user_email: "sarah@example.com", subject: "Can you add gluten-free filter to mode 3?",
        category: "feature_request", priority: "low" as const, status: "open" as const, created_at: Date.now() - 86400000 },
      { id: "T-4818", user_email: "fatih@example.com", subject: "Hesabımı tamamen silmek istiyorum",
        category: "account", priority: "medium" as const, status: "open" as const, created_at: Date.now() - 86400000 * 2 },
    ],
  };
}

export default async function SupportPage() {
  const data = await getTickets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Destek Talepleri</h1>
        <p className="text-muted-foreground">Kullanıcı destek talepleri ve geri bildirimler</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Açık</p>
                <p className="mt-1 text-3xl font-bold text-destructive">{data.open}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">İşlemde</p>
                <p className="mt-1 text-3xl font-bold text-honey">{data.in_progress}</p>
              </div>
              <MessageSquare className="h-5 w-5 text-honey" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Bugün Çözüldü</p>
                <p className="mt-1 text-3xl font-bold text-basil">{data.resolved_today}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-basil" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[280px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Ticket ID, e-posta, konu..." className="pl-10" />
            </div>
            <select className="rounded-md border bg-background px-3 text-sm">
              <option>Tüm durumlar</option><option>Açık</option><option>İşlemde</option><option>Çözüldü</option>
            </select>
            <select className="rounded-md border bg-background px-3 text-sm">
              <option>Tüm kategoriler</option><option>Bug</option><option>Faturalama</option><option>Hesap</option><option>Özellik istek</option>
            </select>
            <select className="rounded-md border bg-background px-3 text-sm">
              <option>Tüm öncelikler</option><option>Acil</option><option>Yüksek</option><option>Orta</option><option>Düşük</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Talepler</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="pb-3">ID</th><th className="pb-3">Kullanıcı</th><th className="pb-3">Konu</th>
                <th className="pb-3">Kategori</th><th className="pb-3">Öncelik</th>
                <th className="pb-3">Durum</th><th className="pb-3">Açıldı</th>
              </tr>
            </thead>
            <tbody>
              {data.sample.map((t) => (
                <tr key={t.id} className="border-b last:border-0 cursor-pointer hover:bg-secondary/30">
                  <td className="py-3 font-mono text-xs">{t.id}</td>
                  <td className="py-3 text-sm">{t.user_email}</td>
                  <td className="py-3 text-sm font-medium">{t.subject}</td>
                  <td className="py-3 text-sm capitalize">{t.category.replace("_", " ")}</td>
                  <td className="py-3">
                    {t.priority === "high" && <Badge variant="destructive">Yüksek</Badge>}
                    {t.priority === "medium" && <Badge variant="warning">Orta</Badge>}
                    {t.priority === "low" && <Badge variant="secondary">Düşük</Badge>}
                  </td>
                  <td className="py-3">
                    {t.status === "open" && <Badge variant="destructive">Açık</Badge>}
                    {t.status === "in_progress" && <Badge variant="warning">İşlemde</Badge>}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{timeAgo(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
