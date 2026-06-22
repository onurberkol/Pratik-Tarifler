import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, ChefHat } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function AnalyticsPage() {
  const sections = [
    {
      title: "Acquisition (Edinme)",
      icon: Users,
      kpis: [
        { label: "Yeni kullanıcı (bugün)", value: "287" },
        { label: "Yeni kullanıcı (7 gün)", value: "1.342" },
        { label: "Yeni kullanıcı (30 gün)", value: "5.821" },
        { label: "App Store impression", value: "84.5K" },
        { label: "Play Store impression", value: "62.1K" },
        { label: "Conversion rate", value: "%3.8" },
      ],
    },
    {
      title: "Engagement (Etkileşim)",
      icon: ChefHat,
      kpis: [
        { label: "DAU (Daily Active)", value: "4.821" },
        { label: "WAU (Weekly)", value: "12.456" },
        { label: "MAU (Monthly)", value: "18.432" },
        { label: "Stickiness (DAU/MAU)", value: "%26.2" },
        { label: "Ortalama oturum", value: "4dk 32sn" },
        { label: "D7 retention", value: "%38" },
        { label: "D30 retention", value: "%15" },
        { label: "Mod 1 kullanım (haftalık)", value: "8.421" },
      ],
    },
    {
      title: "Monetization (Gelir)",
      icon: DollarSign,
      kpis: [
        { label: "MRR (Aylık tekrarlayan)", value: "₺38.500" },
        { label: "ARR (Yıllık)", value: "₺462.000" },
        { label: "Toplam abone", value: "942" },
        { label: "Yeni abone (30 gün)", value: "187" },
        { label: "Trial → Paid", value: "%34" },
        { label: "Aylık churn", value: "%4.2" },
        { label: "ARPU", value: "₺40,87" },
        { label: "LTV", value: "₺487" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Analitik</h1>
          <p className="text-muted-foreground">Detaylı performans metrikleri</p>
        </div>
        <select className="rounded-md border bg-background px-3 py-2 text-sm">
          <option>Son 7 gün</option><option>Son 30 gün</option><option>Son 90 gün</option><option>Tüm zamanlar</option>
        </select>
      </div>

      {sections.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-tomato" />
                <CardTitle>{s.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {s.kpis.map((k) => (
                  <div key={k.label} className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="mt-1 text-2xl font-bold">{k.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardHeader>
          <CardTitle>Dönüşüm Hunisi (Funnel)</CardTitle>
          <CardDescription>İndirme → Premium yolculuğu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { step: "İndirme", count: 24580, pct: 100 },
              { step: "İlk açılış", count: 22980, pct: 93.5 },
              { step: "Onboarding tamamla", count: 18934, pct: 77.0 },
              { step: "Hesap oluştur", count: 14210, pct: 57.8 },
              { step: "İlk tarif görüntüle", count: 12880, pct: 52.4 },
              { step: "Premium ekranı gör", count: 6240, pct: 25.4 },
              { step: "Deneme başlat", count: 1872, pct: 7.6 },
              { step: "Trial → Paid", count: 942, pct: 3.8 },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="w-40 text-sm">{s.step}</div>
                <div className="flex-1">
                  <div className="h-7 rounded-md bg-tomato/20" style={{ width: `${s.pct}%` }}>
                    <div className="flex h-full items-center px-2 text-xs font-medium">
                      {s.count.toLocaleString("tr-TR")} ({s.pct}%)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
