import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sliders, Plus, FlaskConical } from "lucide-react";

async function getConfig() {
  return [
    { key: "max_free_scans_per_day", type: "number", value: "3", description: "Ücretsiz kullanıcıların günlük tarama limiti", updated_at: Date.now() - 86400000 * 3 },
    { key: "premium_monthly_price_try", type: "number", value: "49", description: "Aylık Premium fiyatı (TL)", updated_at: Date.now() - 86400000 * 30 },
    { key: "feature_voice_commands", type: "boolean", value: "true", description: "Pişirme modunda sesli komut aktif mi?", updated_at: Date.now() - 86400000 * 7 },
    { key: "feature_dark_mode", type: "boolean", value: "true", description: "Karanlık mod özelliği", updated_at: Date.now() - 86400000 * 14 },
    { key: "ai_model", type: "string", value: "claude-sonnet-4-6", description: "Backend AI modeli (recipe recommendation)", updated_at: Date.now() - 86400000 * 5 },
    { key: "min_app_version", type: "string", value: "1.0.0", description: "Bu sürümün altındakileri zorunlu güncellemeye yönlendir", updated_at: Date.now() - 86400000 * 60 },
    { key: "onboarding_variant", type: "string", value: "B", description: "A/B test — onboarding ekran varyantı", updated_at: Date.now() - 86400000 * 2 },
    { key: "show_premium_badge", type: "boolean", value: "true", description: "Premium kullanıcılarda rozet göster", updated_at: Date.now() - 86400000 * 90 },
  ];
}

export default async function RemoteConfigPage() {
  const items = await getConfig();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Remote Config</h1>
          <p className="text-muted-foreground">Yeniden derleme gerektirmeden uygulama davranışını kontrol et</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><FlaskConical className="mr-2 h-4 w-4" />A/B Test Oluştur</Button>
          <Button><Plus className="mr-2 h-4 w-4" />Yeni Anahtar</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Konfigürasyon Anahtarları</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="pb-3">Anahtar</th>
                <th className="pb-3">Tip</th>
                <th className="pb-3">Değer</th>
                <th className="pb-3">Açıklama</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.key} className="border-b last:border-0 hover:bg-secondary/30">
                  <td className="py-3 font-mono text-sm">{c.key}</td>
                  <td className="py-3"><Badge variant="outline">{c.type}</Badge></td>
                  <td className="py-3 font-mono text-sm">
                    {c.type === "boolean" ? (
                      <Badge variant={c.value === "true" ? "success" : "secondary"}>{c.value}</Badge>
                    ) : c.value}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{c.description}</td>
                  <td className="py-3">
                    <Button variant="outline" size="sm">Düzenle</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Aktif A/B Testleri</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">Onboarding Varyantı (B vs A)</h3>
                  <p className="text-sm text-muted-foreground">3 ekran vs 5 ekran karşılaştırma</p>
                  <div className="mt-2 flex gap-3 text-sm">
                    <span>👥 %50 / %50</span>
                    <span>·</span>
                    <span>📊 8.421 kullanıcı</span>
                    <span>·</span>
                    <span>⏰ 7 gün</span>
                  </div>
                </div>
                <Badge variant="warning">Çalışıyor</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-secondary/40 p-3">
                  <div className="text-xs text-muted-foreground">Varyant A (Kontrol)</div>
                  <div className="mt-1 font-medium">Tamamlama: %72</div>
                </div>
                <div className="rounded-md bg-tomato/10 p-3 ring-1 ring-tomato/30">
                  <div className="text-xs text-muted-foreground">Varyant B (Test) — 🏆 +5.2%</div>
                  <div className="mt-1 font-medium">Tamamlama: %77.2</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
