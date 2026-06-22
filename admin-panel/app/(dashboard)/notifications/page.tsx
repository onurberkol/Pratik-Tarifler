import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Clock, Send, Users, TrendingUp, MoreVertical } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

async function getCampaigns() {
  return {
    total: 47,
    scheduled: 3,
    sent_30d: 12,
    sample: [
      { id: "c001", title: "🍳 Yeni hafta, yeni tarifler!", segment: "all", status: "sent",
        recipients: 24580, delivered: 22341, opened: 8932, sent_at: Date.now() - 86400000 * 2 },
      { id: "c002", title: "⭐ %50 indirimle Yıllık Premium", segment: "free", status: "sent",
        recipients: 23638, delivered: 21204, opened: 4221, sent_at: Date.now() - 86400000 * 7 },
      { id: "c003", title: "🌸 İlkbahar tarifleri eklendi!", segment: "all", status: "scheduled",
        recipients: 24580, delivered: 0, opened: 0, scheduled_at: Date.now() + 86400000 * 2 },
      { id: "c004", title: "Premium'a hoş geldin Ayşe!", segment: "custom", status: "draft",
        recipients: 1, delivered: 0, opened: 0 },
    ],
  };
}

export default async function NotificationsPage() {
  const data = await getCampaigns();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Push Bildirimler</h1>
          <p className="text-muted-foreground">Kampanyaları oluştur, zamanla ve performansı takip et</p>
        </div>
        <Button asChild>
          <Link href="/notifications/new">
            <Plus className="mr-2 h-4 w-4" />Yeni Bildirim
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Kampanya</p>
                <p className="mt-1 text-3xl font-bold">{data.total}</p>
              </div>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zamanlandı</p>
                <p className="mt-1 text-3xl font-bold text-honey">{data.scheduled}</p>
              </div>
              <Clock className="h-5 w-5 text-honey" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gönderildi (30 gün)</p>
                <p className="mt-1 text-3xl font-bold text-basil">{data.sent_30d}</p>
              </div>
              <Send className="h-5 w-5 text-basil" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Kampanyalar</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="pb-3">Kampanya</th>
                <th className="pb-3">Segment</th>
                <th className="pb-3">Durum</th>
                <th className="pb-3">Alıcı / İletilen</th>
                <th className="pb-3">Açılış</th>
                <th className="pb-3">Tarih</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.sample.map((c) => {
                const openRate = c.delivered > 0 ? ((c.opened / c.delivered) * 100).toFixed(1) : "—";
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-secondary/30">
                    <td className="py-3">
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">#{c.id}</div>
                    </td>
                    <td className="py-3 text-sm capitalize">{c.segment}</td>
                    <td className="py-3">
                      {c.status === "sent" && <Badge variant="success">Gönderildi</Badge>}
                      {c.status === "scheduled" && <Badge variant="warning">Zamanlı</Badge>}
                      {c.status === "draft" && <Badge variant="secondary">Taslak</Badge>}
                    </td>
                    <td className="py-3 text-sm">
                      <div>{c.recipients.toLocaleString("tr-TR")} / {c.delivered.toLocaleString("tr-TR")}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.recipients > 0 ? ((c.delivered / c.recipients) * 100).toFixed(1) : 0}% iletildi
                      </div>
                    </td>
                    <td className="py-3 text-sm">
                      {c.opened > 0 ? (
                        <>
                          <div>{c.opened.toLocaleString("tr-TR")}</div>
                          <div className="text-xs text-muted-foreground">%{openRate}</div>
                        </>
                      ) : "—"}
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {c.sent_at ? formatDateTime(c.sent_at) : c.scheduled_at ? `→ ${formatDateTime(c.scheduled_at)}` : "—"}
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
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
