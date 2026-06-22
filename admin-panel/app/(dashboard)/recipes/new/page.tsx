"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CUISINES, MEAL_TYPES, DIFFICULTY, DIET_TAGS, LANGUAGES } from "@/lib/constants";
import { ArrowLeft, Plus, Trash2, Save, Eye, ImageIcon, Sparkles } from "lucide-react";

export default function NewRecipePage() {
  const [ingredients, setIngredients] = useState([{ token: "", amount: "", note: "" }]);
  const [steps, setSteps] = useState([{ order: 1, title: "", body: "", timer_sec: 0 }]);
  const [tips, setTips] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/recipes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold">Yeni Tarif</h1>
            <p className="text-muted-foreground">Tarif bilgilerini gir ve kaydet</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Eye className="mr-2 h-4 w-4" />Önizle</Button>
          <Button><Save className="mr-2 h-4 w-4" />Kaydet</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader><CardTitle>Temel Bilgiler</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Tarif Adı *</label>
                  <Input placeholder="Mercimek Çorbası" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">ID (otomatik)</label>
                  <Input placeholder="tr-mercimek-corbasi" disabled className="mt-1 bg-muted" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Açıklama *</label>
                <textarea
                  className="mt-1 min-h-[80px] w-full rounded-md border bg-background p-2 text-sm"
                  placeholder="Türk mutfağının vazgeçilmez çorbası. Kıvamlı, doyurucu ve harika..."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Mutfak *</label>
                  <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm">
                    {CUISINES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Zorluk *</label>
                  <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm">
                    {DIFFICULTY.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Dil *</label>
                  <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm">
                    {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Toplam Süre (dk)</label>
                  <Input type="number" placeholder="40" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Aktif Süre (dk)</label>
                  <Input type="number" placeholder="15" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Porsiyon</label>
                  <Input type="number" placeholder="4" className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Öğün Tipi (çoklu)</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {MEAL_TYPES.map((m) => (
                    <label key={m.id} className="flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-secondary">
                      <input type="checkbox" className="rounded" />
                      {m.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Diyet Etiketleri</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DIET_TAGS.map((d) => (
                    <label key={d.id} className="flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-secondary">
                      <input type="checkbox" className="rounded" />
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Malzemeler */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Malzemeler</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setIngredients([...ingredients, { token: "", amount: "", note: "" }])}>
                  <Plus className="mr-1 h-4 w-4" />Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {ingredients.map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <Input className="col-span-3" placeholder="Miktar (örn: 1 su bardağı)" />
                  <Input className="col-span-4" placeholder="Token (örn: lentil)" />
                  <Input className="col-span-4" placeholder="Not (kırmızı, ince çekilmiş)" />
                  <Button variant="ghost" size="icon" className="col-span-1" onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Hazırlanış Adımları */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hazırlanış Adımları</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setSteps([...steps, { order: steps.length + 1, title: "", body: "", timer_sec: 0 }])}>
                  <Plus className="mr-1 h-4 w-4" />Adım Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((s, i) => (
                <div key={i} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <Badge>{s.order}. Adım</Badge>
                    <Button variant="ghost" size="icon" onClick={() => setSteps(steps.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Input placeholder="Adım başlığı (örn: Soğan kavur)" />
                  <textarea
                    className="min-h-[60px] w-full rounded-md border bg-background p-2 text-sm"
                    placeholder="Detaylı açıklama..."
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">⏱ Süre (saniye):</span>
                    <Input type="number" className="w-32" placeholder="60" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Püf Noktaları */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Püf Noktaları (opsiyonel)</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setTips([...tips, ""])}>
                  <Plus className="mr-1 h-4 w-4" />Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tips.length === 0 && <p className="text-sm text-muted-foreground">Henüz püf noktası eklenmedi.</p>}
              {tips.map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Püf noktası..." className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => setTips(tips.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Görsel</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed bg-secondary/40">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Görsel yüklenmedi</p>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />AI ile Otomatik Üret
              </Button>
              <Button className="w-full" variant="outline">
                <ImageIcon className="mr-2 h-4 w-4" />Manuel Yükle
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Yayın Ayarları</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Premium içerik</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Editöryal seçim (öne çıkar)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm">Yayında (uygulamada göster)</span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Çeviri Durumu</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Kaydedildikten sonra 12 dile otomatik çeviri başlatılacak.
              </p>
              <Button className="mt-3 w-full" variant="outline" disabled>
                Çevirileri Görüntüle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
