import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Lightbulb, Plus, Sparkles, BarChart } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getAnnouncements() {
  return [
    { id: "a001", type: "announcement", title: "🌸 İlkbahar tarifleri eklendi!", audience: "all",
      display_locations: ["home_banner"], published: true, views: 12450, clicks: 1892,
      start_date: Date.now() - 86400000 * 7, end_date: Date.now() + 86400000 * 7 },
    { id: "a002", type: "tip", title: "💡 Pişirme modu nasıl kullanılır?", audience: "all",
      display_locations: ["modal"], published: true, views: 8240, clicks: 4120,
      start_date: Date.now() - 86400000 * 14 },
    { id: "a003", type: "promo", title: "⭐ İlk yıllık %50 indirim!", audience: "free",
      display_locations: ["home_banner", "explore_card"], published: true, views: 18432, clicks: 943,
      start_date: Date.now() - 86400000 * 3, end_date: Date.now() + 86400000 * 4 },
    { id: "a004", type: "update", title: "📱 Sürüm 1.1 — Karanlık mod geldi", audience: "all",
      display_locations: ["modal"], published: false, views: 0, clicks: 0,
      start_date: Date.now() + 86400000 * 7 },
  ];
}

export default async function AnnouncementsPage() {
  const items = await getAnnouncements();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Duyurular & İpuçları</h1>
          <p className="text-muted-foreground">Uygulamada gösterilen banner, ipucu ve duyurular</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Lightbulb className="mr-2 h-4 w-4" />Yeni İpucu</Button>
          <Button><Plus className="mr-2 h-4 w-4" />Yeni Duyuru</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Aktif Duyuru", value: 3, icon: Megaphone, color: "text-tomato" },
          { label: "Aktif İpucu", value: 8, icon: Lightbulb, color: "text-honey" },
          { label: "Aktif Promo", value: 2, icon: Sparkles, color: "text-basil" },
          { label: "Toplam Görüntüleme", value: "127K", icon: BarChart, color: "text-blue-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-3xl font-bold">{s.value}</p>
                  </div>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Tüm İçerikler</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((a) => {
              const ctr = a.views > 0 ? ((a.clicks / a.views) * 100).toFixed(1) : "—";
              return (
                <div key={a.id} className="flex items-start gap-4 rounded-lg border p-4 hover:bg-secondary/30">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tomato/10">
                    {a.type === "tip" && <Lightbulb className="h-5 w-5 text-honey" />}
                    {a.type === "announcement" && <Megaphone className="h-5 w-5 text-tomato" />}
                    {a.type === "promo" && <Sparkles className="h-5 w-5 text-basil" />}
                    {a.type === "update" && <BarChart className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{a.title}</h3>
                      {a.published ? <Badge variant="success">Yayında</Badge> : <Badge variant="secondary">Taslak</Badge>}
                      <Badge variant="outline" className="capitalize">{a.type}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>📍 {a.display_locations.join(", ")}</span>
                      <span>·</span>
                      <span>👥 {a.audience}</span>
                      <span>·</span>
                      <span>{formatDate(a.start_date)} {a.end_date ? `→ ${formatDate(a.end_date)}` : ""}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{a.views.toLocaleString("tr-TR")} görüntüleme</div>
                    <div className="text-xs text-muted-foreground">{a.clicks.toLocaleString("tr-TR")} tıklama · %{ctr} CTR</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
