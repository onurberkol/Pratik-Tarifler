import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Play, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { timeAgo } from "@/lib/utils";

async function getImageData() {
  return {
    total: 2500,
    ready: 1875,
    pending: 597,
    failed: 28,
    cost_estimate: 38.50,
    queue: [
      { id: "j001", recipe_id: "tr-karnabahar-corbasi", title: "Karnabahar Çorbası", status: "queued" as const,
        attempts: 0, updated_at: Date.now() - 300000 },
      { id: "j002", recipe_id: "tr-ezogelin-corbasi", title: "Ezogelin Çorbası", status: "searching" as const,
        attempts: 1, updated_at: Date.now() - 60000 },
      { id: "j003", recipe_id: "it-tiramisu", title: "Tiramisu", status: "generating" as const,
        attempts: 4, updated_at: Date.now() - 30000 },
      { id: "j004", recipe_id: "tr-perde-pilavi", title: "Perde Pilavı", status: "failed" as const,
        attempts: 6, error: "No matching image found, AI generation rejected", updated_at: Date.now() - 600000 },
    ],
    review_queue: [
      { id: "r001", recipe_id: "tr-irmik-helvasi", title: "İrmik Helvası", source: "dalle",
        image_url: "https://placehold.co/200x150", score: 0.85 },
      { id: "r002", recipe_id: "tr-cig-borek", title: "Çiğ Börek", source: "dalle",
        image_url: "https://placehold.co/200x150", score: 0.79 },
    ],
  };
}

export default async function ImagesPage() {
  const data = await getImageData();
  const progress = ((data.ready / data.total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Görsel Pipeline</h1>
          <p className="text-muted-foreground">2500 tarif için görsel üretim ve onay</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" />Yenile</Button>
          <Button><Play className="mr-2 h-4 w-4" />Pipeline'ı Başlat</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">İlerleme</p>
            <p className="mt-1 text-3xl font-bold">%{progress}</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-basil" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{data.ready}/{data.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hazır</p>
                <p className="mt-1 text-3xl font-bold text-basil">{data.ready.toLocaleString("tr-TR")}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-basil" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bekleyen</p>
                <p className="mt-1 text-3xl font-bold text-honey">{data.pending.toLocaleString("tr-TR")}</p>
              </div>
              <Clock className="h-5 w-5 text-honey" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hatalı</p>
                <p className="mt-1 text-3xl font-bold text-destructive">{data.failed}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline Yapılandırması</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Eşzamanlı işlem (paralellik)</label>
              <input type="number" defaultValue={5} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Run başına maks AI çağrısı</label>
              <input type="number" defaultValue={100} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Kaynak öncelik sırası (sürükle-bırak)</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Unsplash", "Pexels", "Pixabay", "DALL·E 3", "Flux Pro"].map((s, i) => (
                <Badge key={s} variant="outline" className="text-base">{i + 1}. {s}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Tahmini maliyet: <span className="font-medium text-foreground">${data.cost_estimate.toFixed(2)}</span>
              {" "}({data.pending} kalan tarif için)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">İş Kuyruğu</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.queue.map((j) => (
                <div key={j.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="font-medium">{j.title}</div>
                    <div className="text-xs text-muted-foreground">{j.recipe_id}</div>
                    {j.status === "failed" && "error" in j && (
                      <div className="mt-1 text-xs text-destructive">{j.error}</div>
                    )}
                  </div>
                  <div className="text-right">
                    {j.status === "queued" && <Badge variant="secondary">Kuyrukta</Badge>}
                    {j.status === "searching" && <Badge variant="warning">🔍 Aranıyor</Badge>}
                    {j.status === "generating" && <Badge variant="warning">🎨 Üretiliyor</Badge>}
                    {j.status === "failed" && <Badge variant="destructive">✗ Hata</Badge>}
                    <div className="mt-1 text-xs text-muted-foreground">{timeAgo(j.updated_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">İnceleme Bekleyen ({data.review_queue.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.review_queue.map((r) => (
                <div key={r.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="h-16 w-16 shrink-0 rounded-md bg-secondary" />
                  <div className="flex-1">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground">{r.source} · skor {r.score}</div>
                    <div className="mt-2 flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs">✓ Onayla</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">↻ Tekrar Üret</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">✗ Reddet</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
