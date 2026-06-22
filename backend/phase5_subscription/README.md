# 💰 Faz 5 — Subscription Sistemi

> Pratik Tarifler için **freemium + monetization** — production-ready.

---

## 📦 PAKET İÇERİĞİ

```
phase5_subscription/
├── docs/
│   ├── ARCHITECTURE.md          ⭐ Mimari + plan yapısı + KPI
│   └── DEPLOYMENT.md            ⭐ Adım adım canlıya alma
│
├── revenuecat/
│   ├── index.ts                 RevenueCat SDK wrapper (iOS+Android)
│   └── premiumGating.ts         Feature gate sistemi
│
├── stripe/                      (Stripe-specific — sadece web için)
│
├── screens/
│   └── SubscriptionScreen.tsx   Production paywall UI
│
└── cloud_functions/
    ├── revenuecatWebhook.ts     RevenueCat webhook handler
    └── stripeWebhook.ts         Stripe webhook + checkout
```

---

## 🎯 NE YAPIYOR?

### 3 Platform Tek Sistem
- **iOS:** Apple In-App Purchase (App Store)
- **Android:** Google Play Billing  
- **Web:** Stripe Checkout

Hepsini RevenueCat birleştiriyor + tek source of truth Firestore.

### 3 Plan
| Plan | Fiyat (TR) | Özellikler |
|------|-----------|-----------|
| Aylık | ₺59.99/ay | Tüm premium |
| Yıllık | ₺499/yıl | **7 gün ücretsiz trial** + %30 indirim |
| Lifetime | ₺1499 tek | Ömür boyu |

### 7 Premium Özellik
1. Sınırsız buzdolabı taraması (free: 3/gün)
2. Sınırsız favori (free: 20)
3. 502 premium tarife erişim
4. PDF alışveriş listesi export
5. Sınırsız offline indir (free: 10)
6. Reklamsız
7. Aile paylaşımı (5 kişi)

---

## 🚀 KULLANIM

### 1. Kurulum (App.tsx)
```typescript
import * as RevenueCat from './services/revenuecat';

useEffect(() => {
  RevenueCat.init();
}, []);

// Login olduktan sonra
RevenueCat.identify(user.uid);
```

### 2. Premium Kontrolü
```typescript
import { useSubscriptionStatus } from './services/revenuecat';
import { useFeatureAccess } from './services/revenuecat/premiumGating';

function MyComponent() {
  const { isPremium } = useSubscriptionStatus();
  const { canUse, requiresUpgrade } = useFeatureAccess('shopping_list_export');
  
  if (requiresUpgrade) return <PaywallBanner />;
  if (canUse) return <ShoppingListExportButton />;
}
```

### 3. Daily Quota
```typescript
import { useDailyScanQuota } from './services/revenuecat/premiumGating';

function PantryScanButton() {
  const { canScan, remaining, limit } = useDailyScanQuota();
  
  if (!canScan) {
    return <Text>Günlük {limit} scan kullandın. Premium = sınırsız.</Text>;
  }
  
  return <Text>{remaining}/{limit} scan kaldı</Text>;
}
```

### 4. Paywall Aç
```typescript
navigation.navigate('Subscription'); 
// SubscriptionScreen otomatik 3 plan + restore + legal göstrir
```

---

## 🔒 GÜVENLIK MİMARİSİ

**KURAL:** Client'ın "ben premiumum" iddiasına ASLA güvenme.

### Cloud Function check pattern:
```typescript
import { requirePremium } from './premiumGating';

export const exportShoppingList = onCall(async (request) => {
  await requirePremium(request.auth.uid); // ← throws if not premium
  // ... export logic
});
```

### Source of truth:
```
users/{userId}/subscription/current
├── tier: 'premium' | 'free'
├── status: 'active' | 'cancelled' | 'expired' | 'billing_issue'
├── expires_at: Timestamp
├── source: 'apple' | 'google' | 'stripe'
└── stripe_subscription_id / rc_user_id
```

Webhook'lar bu doc'u sürekli güncel tutar — client sadece okur.

---

## 📊 BUSINESS METRİKLER

### Tahmini Gelir (TR market)
```
1000 aktif kullanıcı
× %10 trial başlatma = 100 trial
× %35 trial→paid CVR = 35 abone
× ₺499/yıl ortalama = ₺17,465/yıl
× %70 (App Store komisyonu sonrası) = ₺12,225 net/yıl

→ Ayda ₺1,019 net per 1000 user
→ 10K user'da ₺10K/ay net = ₺120K/yıl
→ 100K user'da ₺100K/ay net = ₺1.2M/yıl 🦁
```

### KPI Hedefleri (İlk 6 ay)
- Trial conversion: %35+
- Monthly churn: <%8
- ARPU: ₺55+/ay
- LTV: ₺600+

---

## ✅ HAZIR OLAN ŞEYLER

- ✅ RevenueCat client SDK wrapper (iOS+Android tek API)
- ✅ Subscription state Firestore sync
- ✅ Webhook handlers (RC + Stripe)
- ✅ Customer portal (Stripe billing management)
- ✅ Free trial logic (7 gün, yıllık plana özel)
- ✅ Production paywall UI (3 plan + restore + legal)
- ✅ Feature gating sistemi (7 feature)
- ✅ Daily quota tracking (pantry scans)
- ✅ Win-back campaign (30 gün sonra %40 indirim)
- ✅ Trial ending push (3 gün önce uyarı)
- ✅ Cross-platform sync (iOS→Android→Web aynı abonelik)
- ✅ Analytics events (10 önemli event)

## ⏳ EXTRA YAPILACAKLAR (opsiyonel)

- [ ] Promo code sistemi (referral)
- [ ] Family sharing UI (iOS Family Sharing entegrasyon)
- [ ] A/B test paywall variants
- [ ] Dynamic pricing (ülkeye göre fiyat ayarı RC üzerinden)
- [ ] Subscription pause (premium beta feature)

---

## 🎯 SONUÇ

Bu paket ile:
1. ✅ Mobile app premium satabilir
2. ✅ Web app premium satabilir  
3. ✅ Webhook'lar otomatik sync ediyor
4. ✅ Receipt validation backend'de yapılıyor
5. ✅ Free trial + win-back kampanyaları çalışıyor
6. ✅ App Store / Play Store policy'lerine uygun

**Sadece:**
- App Store Connect / Play Console'da product create (1 saat)
- RevenueCat hesabı setup (30 dk)
- Stripe hesabı setup (30 dk — sadece web istenirse)
- Cloud Functions deploy (10 dk)

Detaylar: `docs/DEPLOYMENT.md`

🦁🔥
