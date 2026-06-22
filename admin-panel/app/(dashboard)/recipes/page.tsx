import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CUISINES, DIFFICULTY } from "@/lib/constants";
import {
  Plus, Search, Filter, Upload, Download, MoreVertical,
  Eye, Edit, Trash2, Image as ImageIcon, Star,
} from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";

async function getRecipes() {
  // Üretim: adminDb.collection("recipes_tr").orderBy("created_at", "desc").limit(50).get()
  return {
    total: 2500,
    sample: [
      { id: "tr-mercimek-corbasi", title: "Mercimek Çorbası", cuisine: "turkish", difficulty: "easy",
        total_time_min: 40, is_premium: false, image_status: "ready", rating_avg: 4.9, published: true },
      { id: "tr-menemen", title: "Menemen", cuisine: "turkish", difficulty: "easy",
        total_time_min: 15, is_premium: false, image_status: "ready", rating_avg: 4.7, published: true },
      { id: "it-pasta-carbonara", title: "Spaghetti alla Carbonara", cuisine: "italian", difficulty: "medium",
        total_time_min: 30, is_premium: true, image_status: "pending", rating_avg: 4.8, published: true },
      { id: "tr-su-boregi", title: "Su Böreği", cuisine: "turkish", difficulty: "hard",
        total_time_min: 90, is_premium: true, image_status: "ready", rating_avg: 4.9, published: true },
      { id: "tr-baklava", title: "Baklava", cuisine: "turkish", difficulty: "hard",
        total_time_min: 120, is_premium: true, image_status: "failed", rating_avg: 5.0, published: false },
    ],
  };
}

export default async function RecipesPage() {
  const { total, sample } = await getRecipes();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Tarifler</h1>
          <p className="text-muted-foreground">{total.toLocaleString("tr-TR")} tarif</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> JSON İçe Aktar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Dışa Aktar
          </Button>
          <Button asChild>
            <Link href="/recipes/new">
              <Plus className="mr-2 h-4 w-4" /> Yeni Tarif
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[280px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Tarif adı veya ID ile ara..." className="pl-10" />
            </div>
            <select className="rounded-md border bg-background px-3 text-sm">
              <option value="">Tüm mutfaklar</option>
              {CUISINES.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
            <select className="rounded-md border bg-background px-3 text-sm">
              <option value="">Tüm zorluklar</option>
              {DIFFICULTY.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            <select className="rounded-md border bg-background px-3 text-sm">
              <option value="">Tüm görseller</option>
              <option value="ready">Hazır</option>
              <option value="pending">Bekliyor</option>
              <option value="failed">Hatalı</option>
            </select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Daha Fazla Filtre
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Tarif Listesi</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>5 / {total.toLocaleString("tr-TR")}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="pb-3"><input type="checkbox" /></th>
                  <th className="pb-3">Tarif</th>
                  <th className="pb-3">Mutfak</th>
                  <th className="pb-3">Zorluk</th>
                  <th className="pb-3">Süre</th>
                  <th className="pb-3">Tier</th>
                  <th className="pb-3">Görsel</th>
                  <th className="pb-3">Puan</th>
                  <th className="pb-3">Durum</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {sample.map((r) => {
                  const cuisine = CUISINES.find((c) => c.id === r.cuisine);
                  const diff = DIFFICULTY.find((d) => d.id === r.difficulty);
                  return (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-secondary/30">
                      <td className="py-3"><input type="checkbox" /></td>
                      <td className="py-3">
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground">{r.id}</div>
                      </td>
                      <td className="py-3 text-sm">{cuisine?.emoji} {cuisine?.label}</td>
                      <td className={`py-3 text-sm font-medium ${diff?.color}`}>{diff?.label}</td>
                      <td className="py-3 text-sm">{r.total_time_min} dk</td>
                      <td className="py-3">
                        {r.is_premium ? (
                          <Badge variant="warning">⭐ Premium</Badge>
                        ) : (
                          <Badge variant="secondary">Ücretsiz</Badge>
                        )}
                      </td>
                      <td className="py-3">
                        {r.image_status === "ready" && <Badge variant="success">✓ Hazır</Badge>}
                        {r.image_status === "pending" && <Badge variant="warning">⏳ Bekliyor</Badge>}
                        {r.image_status === "failed" && <Badge variant="destructive">✗ Hata</Badge>}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          {r.rating_avg.toFixed(1)}
                        </div>
                      </td>
                      <td className="py-3">
                        {r.published ? (
                          <Badge variant="success">Yayında</Badge>
                        ) : (
                          <Badge variant="secondary">Taslak</Badge>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/recipes/${r.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/recipes/${r.id}/edit`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
            <span>Sayfa 1 / 50</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>← Önceki</Button>
              <Button variant="outline" size="sm">Sonraki →</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
