import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminDb } from "@/lib/firebase/admin";
import {
  Users, BookOpen, CreditCard, TrendingUp, AlertCircle,
  Activity, DollarSign, Star, Bell,
} from "lucide-react";
import { formatCurrency, formatNumber, timeAgo } from "@/lib/utils";

async function getDashboardData() {
  // Üretimde Firestore'dan çek; şimdilik örnek veriler
  // const recipesSnap = await adminDb.collection("recipes_tr").count().get();
  return {
    totalUsers: 24580,
    newUsers7d: 1342,
    dau: 4821,
    mau: 18432,
    totalRecipes: 2500,
    recipesWithImages: 1875,
    mrr: 38500,
    activeSubscribers: 942,
    trialActive: 187,
    crashFreeRate: 99.7,
    avgRating: 4.6,
    openSupportTickets: 12,
    pendingImageReviews: 28,
    recentActivity: [
      { type: "user", text: "Yeni kullanıcı kaydı: ayse@example.com", time: Date.now() - 60_000 },
      { type: "premium", text: "Yıllık Premium satın alma: 399 ₺", time: Date.now() - 180_000 },
      { type: "recipe", text: "Yeni tarif eklendi: Karnabahar Çorbası", time: Date.now() - 600_000 },
      { type: "support", text: "Yeni destek talebi #4821", time: Date.now() - 1200_000 },
    ],
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const kpis = [
    {
      label: "Toplam Kullanıcı",
      value: formatNumber(data.totalUsers),
      change: `+${formatNumber(data.newUsers7d)} (7 gün)`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Günlük Aktif",
      value: formatNumber(data.dau),
      change: `MAU: ${formatNumber(data.mau)}`,
      icon: Activity,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Aylık Gelir (MRR)",
      value: formatCurrency(data.mrr),
      change: `${data.activeSubscribers} aktif abone`,
      icon: DollarSign,
      color: "text-tomato",
      bg: "bg-tomato/10",
    },
    {
      label: "Toplam Tarif",
      value: formatNumber(data.totalRecipes),
      change: `${data.recipesWithImages} görselli`,
      icon: BookOpen,
      color: "text-honey",
      bg: "bg-honey/10",
    },
    {
      label: "Ortalama Puan",
      value: data.avgRating.toFixed(1),
      change: "⭐ Mağaza puanı",
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Crash-Free",
      value: `${data.crashFreeRate}%`,
      change: "Son 7 gün",
      icon: TrendingUp,
      color: "text-basil",
      bg: "bg-basil/10",
    },
    {
      label: "Deneme Aktif",
      value: data.trialActive.toString(),
      change: "7 gün denemede",
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Aksiyon Gereken",
      value: (data.openSupportTickets + data.pendingImageReviews).toString(),
      change: `${data.openSupportTickets} destek, ${data.pendingImageReviews} görsel`,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Genel Bakış</h1>
        <p className="text-muted-foreground">Pratik Tarifler — sistemin nabzı</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                    <p className="mt-2 text-3xl font-bold">{kpi.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{kpi.change}</p>
                  </div>
                  <div className={`rounded-lg ${kpi.bg} p-2`}>
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Son 30 Gün İndirme Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-md bg-secondary/40 text-sm text-muted-foreground">
              📊 Recharts grafiği — günlük indirme verileri Firestore'dan
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.recentActivity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-tomato" />
                  <div className="flex-1">
                    <p>{a.text}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(a.time)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Yeni Tarif Ekle", icon: BookOpen, href: "/recipes/new" },
            { label: "Push Bildirim Gönder", icon: Bell, href: "/notifications/new" },
            { label: "Görsel Pipeline", icon: Activity, href: "/images" },
            { label: "Destek Talepleri", icon: AlertCircle, href: "/support" },
          ].map((q) => {
            const Icon = q.icon;
            return (
              <a
                key={q.label}
                href={q.href}
                className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center hover:bg-accent/30"
              >
                <Icon className="h-6 w-6 text-tomato" />
                <span className="text-sm font-medium">{q.label}</span>
              </a>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
