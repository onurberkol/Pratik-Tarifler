# Pratik Tarifler — Admin Panel

> İçerik, kullanıcı, abonelik ve bildirim yönetimi için web tabanlı admin paneli.

## 🛠️ Teknolojiler

- **Next.js 14** (App Router, Server Components, Server Actions)
- **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui** (Radix UI tabanlı bileşenler)
- **Firebase Admin SDK** (Firestore, Auth, Storage, FCM)
- **TanStack Query** (server state)
- **TanStack Table** (veri tabloları)
- **Recharts** (grafikler)
- **Zod** + **React Hook Form** (form validasyonu)

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları kur
npm install

# .env dosyasını hazırla
cp .env.example .env
# .env'yi gerçek değerlerle doldur

# Geliştirme sunucusu
npm run dev
# → http://localhost:3000

# Üretim build
npm run build && npm start
```

## 📁 Klasör Yapısı

```
admin_panel/
├── app/                    # Next.js App Router sayfaları
│   ├── (auth)/login        # Giriş ekranı
│   ├── (dashboard)/        # Korumalı admin alanı
│   │   ├── dashboard       # Ana sayfa — KPI özet
│   │   ├── recipes         # Tarif CRUD + bulk işlem
│   │   ├── users           # Kullanıcı yönetimi + Premium grant
│   │   ├── notifications   # Push gönder + zamanla
│   │   ├── images          # Görsel pipeline kontrol
│   │   ├── analytics       # Detaylı metrikler
│   │   ├── support         # Kullanıcı destek talepleri
│   │   ├── announcements   # İpucu / duyuru yönetimi
│   │   ├── remote-config   # Feature flags
│   │   └── settings        # Sistem ayarları
│   └── api/                # API rotaları (server-side)
├── components/             # UI bileşenleri
│   ├── ui/                 # shadcn/ui temel bileşenler
│   ├── layout/             # Sidebar, header, vb.
│   ├── charts/             # Recharts wrapper'lar
│   ├── forms/              # Karmaşık form bileşenleri
│   └── tables/             # Tablo bileşenleri
├── lib/                    # Yardımcı modüller
│   ├── firebase/           # Admin SDK init
│   ├── auth/               # Yetkilendirme middleware
│   ├── utils.ts            # cn() ve diğer helper'lar
│   └── constants.ts        # Sabit değerler
├── hooks/                  # Custom React hook'lar
├── types/                  # TypeScript tip tanımları
└── docs/                   # Geliştirici dokümantasyonu
```

## 🔐 Yetkilendirme

`.env`'deki `ADMIN_EMAILS` listesindeki e-postalar admin'dir. Bu kullanıcılar:
- Firebase Auth ile giriş yapar
- Her sayfa server-side middleware'de doğrulanır
- 30 dakika inaktivite sonrası otomatik çıkış

## ✨ Özellikler

Detaylı dokümantasyon için: `docs/ADMIN_PANEL_OZELLIK_REHBERI.pdf`

- ✅ Tarif CRUD (ekle/düzenle/sil/bulk içe aktar)
- ✅ Görsel pipeline kontrol paneli
- ✅ Kullanıcı yönetimi + Premium grant/revoke
- ✅ Push notification (anlık + zamanlama + segment)
- ✅ Analytics dashboard (DAU, MRR, dönüşüm hunileri)
- ✅ Destek talebi yönetimi
- ✅ Duyuru ve in-app ipucu sistemi
- ✅ Remote Config (feature flags + A/B test)
- ✅ Audit log (kim ne zaman ne yaptı)
- ✅ Multi-admin role-based access (RBAC)

## 🧪 Test

```bash
npm run typecheck   # TS kontrolü
npm run lint        # ESLint
npm test            # Jest birim testler
npm run test:e2e    # Playwright E2E
```

## 🚢 Deploy

Vercel (önerilen):
```bash
vercel deploy --prod
```

veya Firebase Hosting:
```bash
firebase deploy --only hosting
```

---

**Made with 🦁 by Pratik Tarifler ekibi**
