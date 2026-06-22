"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Clock, Eye, Users, Bell } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";

export default function NewNotificationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notifications"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold">Yeni Bildirim</h1>
            <p className="text-muted-foreground">Push kampanyası oluştur</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Eye className="mr-2 h-4 w-4" />Test Gönder</Button>
          <Button variant="outline"><Clock className="mr-2 h-4 w-4" />Zamanla</Button>
          <Button><Send className="mr-2 h-4 w-4" />Şimdi Gönder</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>İçerik</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Başlık (TR) *</label>
                <Input placeholder="🍳 Bugün ne pişirsem?" className="mt-1" maxLength={50} />
                <p className="mt-1 text-xs text-muted-foreground">Maks 50 karakter (telefon ekranında kesilir)</p>
              </div>
              <div>
                <label className="text-sm font-medium">Mesaj (TR) *</label>
                <textarea className="mt-1 min-h-[80px] w-full rounded-md border bg-background p-2 text-sm"
                  placeholder="Buzdolabını çek, AI sana hızlı bir akşam yemeği önersin!" maxLength={150} />
                <p className="mt-1 text-xs text-muted-foreground">Maks 150 karakter</p>
              </div>
              <details className="rounded-lg border p-3">
                <summary className="cursor-pointer font-medium">+ Diğer Dillere Çeviri</summary>
                <div className="mt-3 space-y-3">
                  {LANGUAGES.filter((l) => l.code !== "tr").slice(0, 3).map((l) => (
                    <div key={l.code} className="grid grid-cols-2 gap-2">
                      <Input placeholder={`Başlık (${l.label})`} />
                      <Input placeholder={`Mesaj (${l.label})`} />
                    </div>
                  ))}
                  <Button variant="outline" size="sm">+ 9 dil daha</Button>
                  <Button variant="outline" size="sm">🤖 Otomatik çevir</Button>
                </div>
              </details>
              <div>
                <label className="text-sm font-medium">Görsel (opsiyonel)</label>
                <Input type="url" placeholder="https://..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Deep Link (opsiyonel)</label>
                <Input placeholder="pratiktarifler://recipe/tr-mercimek-corbasi" className="mt-1" />
                <p className="mt-1 text-xs text-muted-foreground">Tıklanınca yönlendirilecek sayfa</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hedef Kitle</CardTitle>
              <CardDescription>Kimlere gönderilsin?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "all", label: "Tüm kullanıcılar", count: 24580 },
                { id: "premium", label: "Sadece Premium aboneler", count: 942 },
                { id: "free", label: "Sadece ücretsiz kullanıcılar", count: 23638 },
                { id: "language", label: "Dile göre", count: null },
                { id: "country", label: "Ülkeye göre", count: null },
                { id: "custom", label: "Özel sorgu (Firestore where)", count: null },
              ].map((s) => (
                <label key={s.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-secondary/30 cursor-pointer">
                  <input type="radio" name="segment" defaultChecked={s.id === "all"} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{s.label}</div>
                    {s.count !== null && <div className="text-xs text-muted-foreground">~{s.count.toLocaleString("tr-TR")} kullanıcı</div>}
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Önizleme</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-gradient-to-b from-gray-100 to-gray-50 p-3 dark:from-gray-900 dark:to-gray-800">
                <div className="rounded-xl bg-white/95 p-3 shadow-md backdrop-blur dark:bg-gray-700/95">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tomato">
                      <Bell className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Pratik Tarifler</span>
                        <span className="text-xs text-muted-foreground">şimdi</span>
                      </div>
                      <p className="mt-0.5 text-sm font-medium">🍳 Bugün ne pişirsem?</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Buzdolabını çek, AI sana hızlı bir akşam yemeği önersin!</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">iOS / Android cihaz önizlemesi.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tahmini Etki</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Tahmini alıcı</span><span className="font-medium">24.580</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Beklenen iletim</span><span className="font-medium">~%91</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Geçmiş açılış oranı</span><span className="font-medium">%18-25</span></div>
              <div className="border-t pt-3 flex justify-between"><span className="text-muted-foreground">Tahmini tıklama</span><span className="font-medium">~4.500</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
