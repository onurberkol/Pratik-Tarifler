"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Users, Bell, Image, BarChart3,
  LifeBuoy, Megaphone, Settings, Sliders, ChefHat, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/recipes", label: "Tarifler", icon: BookOpen },
  { href: "/users", label: "Kullanıcılar", icon: Users },
  { href: "/notifications", label: "Bildirimler", icon: Bell },
  { href: "/announcements", label: "Duyurular", icon: Megaphone },
  { href: "/images", label: "Görseller", icon: Image },
  { href: "/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/support", label: "Destek", icon: LifeBuoy },
  { href: "/remote-config", label: "Remote Config", icon: Sliders },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tomato">
          <ChefHat className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-display text-base font-bold leading-none">Pratik Tarifler</div>
          <div className="text-xs text-muted-foreground">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-tomato text-white shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </form>
      </div>
    </aside>
  );
}
