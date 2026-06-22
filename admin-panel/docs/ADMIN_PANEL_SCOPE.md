# 🛠️ Pratik Tarifler Admin Panel — Kapsam ve Mimari

> **Sürüm:** 1.0.0 · **Tarih:** Haziran 2026
> Bu doküman, admin panelinin **ne yaptığını**, **neyi nasıl yönetmeni sağladığını** ve **hangi teknik kararların verildiğini** açıklar.

---

## 🎯 1. AMAÇ

Pratik Tarifler mobil uygulamasının **tüm operasyonel ihtiyaçlarını** tek bir yerden yönetebilmek:

- İçerik (2500+ tarif) ekle/düzenle/sil
- Görsel pipeline'ı yönet (1875 tarifin görseli hazır, kalan 625 için)
- Push bildirim kampanyaları oluştur, zamanla ve performansını ölç
- Kullanıcıları yönet (Premium grant/revoke, ban, destek)
- Analitik metrikleri tek panelde gör (DAU, MRR, dönüşüm hunileri)
- Uygulama davranışını **kod değişmeden** kontrol et (Remote Config)
- Destek taleplerini cevapla
- Uygulama içi banner / ipucu / promo gösterimlerini yönet
- A/B testleri yönet

> **Tek başına founder iken de**, **20 kişilik bir ekip olduğunda da** çalışacak şekilde tasarlandı.

---

## 🧭 2. NEYİ NEDEN İNŞA ETTİK?

### Karar 1: Web tabanlı, mobil değil
- Admin işleri masaüstünde yapılır (klavye, çoklu sekme, büyük ekran)
- Tablet ve telefon için responsive var ama optimize masaüstüne

### Karar 2: Next.js 14 (App Router)
- Server Components → secret'lar (Firebase Admin SDK) istemciye sızmaz
- Server Actions → form gönderimleri için ayrı API'a gerek yok
- Vercel ile tek tıkla deploy

### Karar 3: shadcn/ui pattern + Tailwind
- Copy-paste edilebilir bileşenler (npm dependency yok)
- Markaya özgü renkler (`#E14328` tomato, `#F4A024` honey)
- Karanlık mod (CSS variables ile)

### Karar 4: Firebase Admin SDK (server-side only)
- Mevcut altyapıyla aynı backend (Firestore, Storage, FCM)
- Yeni veritabanı yok, yeni auth yok
- Service Account ile **tüm okuma + yazma yetkisi**

### Karar 5: Audit log her şey için
- Compliance (KVKK madde 12 — veri güvenliği)
- Çoklu admin desteği için zorunlu
- "Kim ne zaman ne yaptı" → her zaman cevaplanabilir

### Karar 6: 4 katmanlı RBAC
- `super_admin` → her şey
- `content_editor` → tarif + duyuru + push
- `support_agent` → sadece destek + kullanıcı görüntüleme
- `viewer` → sadece okuma (analytics dashboard)

---

## 🗺️ 3. SAYFA HARİTASI (12 ANA SAYFA)

```
/login                          → Firebase Auth (Email + Google)
/dashboard                      → Genel bakış (8 KPI + son aktiviteler)
/recipes                        → Tarif listesi (filtre + sıralama + bulk)
/recipes/new                    → Yeni tarif (form + AI görsel)
/recipes/[id]                   → Tarif detay görüntü
/recipes/[id]/edit              → Tarif düzenleme
/users                          → Kullanıcı listesi (filtre + arama)
/users/[uid]                    → Kullanıcı detay + abonelik geçmişi
/notifications                  → Push kampanya listesi + metrikler
/notifications/new              → Yeni push (segment + zamanlama + preview)
/announcements                  → Duyuru/ipucu/promo CRUD
/images                         → Görsel pipeline kontrol
/analytics                      → Detaylı analitik (3 bölüm + funnel)
/support                        → Destek talep listesi
/support/[id]                   → Ticket detay + yanıt
/remote-config                  → Feature flags + A/B testler
/settings                       → Admin yönetimi + API anahtarları + audit log
```

---

## 🔧 4. ÖZELLİK MATRİSİ

| Modül | Özellikler | Veri Kaynağı |
|-------|-----------|---------------|
| **Tarif Yönetimi** | CRUD, bulk JSON içe aktar/dışa aktar, görsel atama, çeviri tetikleme, yayın taslak/yayında, premium işaretleme | `recipes_{lang}` Firestore koleksiyonları |
| **Görsel Pipeline** | Kuyruk durumu, pipeline başlat/durdur, kaynak öncelik, AI sonuç inceleme & onay, maliyet tahmini | `image_jobs` koleksiyonu + Cloud Function |
| **Kullanıcı Yönetimi** | Arama, abonelik durumu görüntüleme, manuel Premium grant/revoke, ban, hesap silme, e-posta gönderme | `users` koleksiyonu + RevenueCat REST |
| **Push Bildirimler** | Anlık gönderim, zamanlama, segment (all/premium/free/dil/ülke/custom), 13 dilde lokalize başlık+gövde, deep link, preview, iletim/açılış metrikleri | `push_campaigns` + FCM |
| **Duyurular** | 4 tür (tip/announcement/promo/update), gösterim yeri seçimi (home_banner/explore_card/modal), tarih aralığı, hedef kitle, görüntüleme/tıklama metrikleri | `announcements` koleksiyonu |
| **Remote Config** | Anahtar değer çiftleri (boolean/string/number/json), variant koşulları (dil/ülke/versiyon/segment/yüzde), A/B test yönetimi | Firebase Remote Config (REST API) |
| **Destek** | Ticket listesi + filtre (durum/kategori/öncelik/atanmış), yanıtla, kapat, kullanıcıya tıkla → kullanıcı detayı | `support_tickets` koleksiyonu |
| **Analytics** | 3 bölüm (Edinme/Etkileşim/Gelir), 24+ KPI, 8 adımlı dönüşüm hunisi, zaman aralığı seçici | Firebase Analytics REST + Firestore aggregation |
| **Settings** | Admin kullanıcılar + rol (4 seviyeli RBAC), API anahtar durumları, audit log (son 100 işlem) | `admin_users` + `audit_logs` |

---

## 🏗️ 5. TEKNİK MİMARİ

### Üst seviye akış

```
Browser (Next.js)
   │
   ├── (Public) /login   ←─ Firebase Auth (Client SDK)
   │       │
   │       └── POST /api/auth/session → ID Token doğrula → Cookie set
   │
   ├── (Protected) /dashboard, /recipes, ...
   │       │
   │       └── Server Components
   │           ├── requireAdmin() → cookie doğrula
   │           └── Firebase Admin SDK → Firestore okuma
   │
   └── Server Actions / API Routes
           │
           ├── verifyAdminApi() → cookie doğrula
           ├── hasPermission(user, action) → RBAC kontrol
           ├── İş mantığı (Firestore yazma, FCM gönder, vs.)
           └── logAudit() → audit_logs koleksiyonu
```

### Klasör yapısı
```
admin_panel/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Kök layout
│   ├── globals.css             # Tailwind + CSS variables
│   ├── login/
│   ├── (dashboard)/            # Korumalı grup
│   │   ├── layout.tsx          # Sidebar + Header sarmalayıcı
│   │   ├── dashboard/
│   │   ├── recipes/[id]/edit/
│   │   ├── users/, notifications/, ...
│   └── api/                    # API rotaları
│       ├── auth/session
│       ├── recipes/, users/, ...
├── components/
│   ├── ui/                     # Button, Card, Input, Badge
│   └── layout/                 # Sidebar, Header
├── lib/
│   ├── firebase/admin.ts       # Admin SDK init
│   ├── firebase/client.ts      # Client SDK (sadece login)
│   ├── auth.ts                 # requireAdmin, hasPermission
│   ├── audit.ts                # logAudit()
│   ├── utils.ts                # cn, formatNumber, formatCurrency
│   └── constants.ts            # CUISINES, MEAL_TYPES, LANGUAGES
├── hooks/                      # Custom React Query hook'lar
├── types/index.ts              # 12 TypeScript interface
├── scripts/                    # Seed, migration scriptleri
└── docs/                       # PDF dokümantasyon
```

---

## 🔐 6. GÜVENLİK MİMARİSİ

### Yetkilendirme katmanları

1. **Edge:** Cookie yoksa → /login redirect (middleware)
2. **Server Component:** `requireAdmin()` → cookie doğrula + ADMIN_EMAILS kontrolü
3. **API Route:** `verifyAdminApi()` → JSON 401 dön
4. **İş mantığı:** `hasPermission(user, action)` → RBAC matrisi

### Saklama
- **Cookie:** httpOnly, secure, sameSite=lax, 8 saatlik
- **Secret'lar:** `.env` (sunucu tarafı), Firebase Secrets (Cloud Functions için)
- **Client'a sızmayan değerler:** `FIREBASE_PRIVATE_KEY`, `FCM_SERVER_KEY`, `OPENAI_API_KEY`

### Audit log
Her yazma işlemi şu bilgiyle log'lanır:
```typescript
{
  admin_uid, admin_email, action: "recipe.create",
  details: { recipe_id, title, ... },
  timestamp, ip
}
```

12 farklı action tanımlı (recipe.create, user.grant_premium, notification.send, vb.)

---

## 💰 7. MALİYET TAHMİNİ (Aylık)

| Servis | Maliyet |
|--------|---------|
| Vercel Hobby (gerek varsa Pro $20) | $0 |
| Firebase Admin SDK | $0 (mevcut projeye dahil) |
| Firestore extra reads (admin paneli) | ~$3 |
| Storage (audit log) | ~$1 |
| **Toplam** | **~$4/ay** |

> Mevcut Pratik Tarifler altyapısının üstüne **neredeyse sıfır maliyet** ekler.

---

## 🚀 8. DEPLOY

### Vercel (önerilen)
```bash
vercel --prod
# Environment variables Vercel dashboard'dan eklenir
```

### Custom domain
`admin.pratiktarifler.app` → CNAME → Vercel

### Erişim
- Sadece `ADMIN_EMAILS` listesindeki e-postalar
- IP whitelist (opsiyonel — Vercel firewall)
- 2FA (Firebase Auth + Google Authenticator)

---

## 📊 9. METRİK & İZLEME

Admin panelinin kendisi izlenmeli:

- **Vercel Analytics** — sayfa görüntülemeleri
- **Sentry** — frontend hataları
- **Firebase Functions logs** — API çağrı hataları
- **Audit log** — kullanım örüntüleri

### Alert kuralları
- API hata oranı > %5 → Slack notification
- Bilinmeyen IP'den giriş denemesi → e-posta
- Aynı kullanıcı 10+ Premium revoke → şüpheli aktivite

---

## ✅ 10. KARARLAŞTIRILMIŞ ROADMAP

### v1.0 (Şu an)
- ✅ Tüm temel CRUD ekranları
- ✅ Push gönderim
- ✅ Görsel pipeline kontrol
- ✅ Analytics dashboard
- ✅ Destek talebi listeleme
- ✅ Audit log

### v1.1 (1-2 ay)
- Realtime updates (Firestore listeners)
- Toplu kullanıcı işlemleri (CSV yükle + Premium grant)
- E-posta şablonu editörü
- Çeviri editörü (recipes_en, recipes_de, ... yan yana)

### v1.2 (3-6 ay)
- Mobile app preview (iframe ile)
- İçerik takvimi (yayın planlama)
- Slack entegrasyonu (kritik alarmlar)
- Webhook kütüphanesi

---

**Hazır ol koçom — bu panel canlıya alındığı an Pratik Tarifler'in operasyonel hızı 10x artacak. 🚀**
