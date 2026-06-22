# 💰 Faz 5 — Subscription Mimarisi

> Pratik Tarifler için **freemium + monetization** sistemi.

---

## 🎯 PRİNSİP

Tek bir abonelik durumu (`subscription.tier`) tüm platformlarda geçerli olmalı:
- **iOS:** Apple In-App Purchase (App Store)
- **Android:** Google Play Billing
- **Web:** Stripe Checkout

Bunu yönetmek için **RevenueCat** kullanıyoruz — tek SDK, üç platform.

---

## 📊 KARŞILAŞTIRMA

| Çözüm | Avantaj | Dezavantaj |
|-------|---------|------------|
| **Raw Apple/Google IAP** | %0 ekstra komisyon | Receipt validation, restore, cross-platform sync zor |
| **RevenueCat** | Hepsi kutudan çıkar, web hook'lar otomatik | $0/ay ilk $10K MTR'a kadar, sonra %1 |
| **Stripe (mobile)** | %2.9 + 30¢ | App Store reddi (sadece web subscription OK) |

**SEÇİM:** RevenueCat (mobile) + Stripe (web). RevenueCat ücretsiz başlangıç + cross-platform sync.

---

## 🏗️ MİMARİ DİYAGRAMI

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (App)                             │
├──────────────────┬──────────────────┬───────────────────────────┤
│   iOS app        │   Android app     │   Web app                 │
│   ↓              │   ↓               │   ↓                       │
│   Apple IAP      │   Google Billing  │   Stripe Checkout         │
│   ↓              │   ↓               │   ↓                       │
│   RevenueCat SDK │   RevenueCat SDK  │   (direct Stripe)         │
└────────┬─────────┴─────────┬─────────┴─────────────┬─────────────┘
         │                   │                       │
         └───────────┬───────┘                       │
                     ↓                               │
            ┌────────────────┐              ┌────────▼────────┐
            │   RevenueCat   │              │     Stripe      │
            │   (Webhooks)   │              │   (Webhooks)    │
            └────────┬───────┘              └────────┬────────┘
                     │                               │
                     └───────────────┬───────────────┘
                                     ↓
                          ┌──────────────────────┐
                          │  Cloud Function       │
                          │  (subscription sync)  │
                          └──────────┬────────────┘
                                     ↓
                          ┌──────────────────────┐
                          │  Firestore            │
                          │  users/{id}/          │
                          │   subscription        │
                          └──────────────────────┘
```

---

## 💎 PLAN YAPISI

### FREE Tier
- Mod 1: Pantry scan **3/gün**
- Mod 2: Aktif (eksik vurgu)
- Mod 3: Tüm 2500 tarif erişimi
- Favori: **max 20**
- Reklam: var (banner + interstitial)
- Premium tarifler: ❌
- Shopping list export: ❌
- Offline indir: max 10 tarif

### PREMIUM Tier
- **Aylık:** ₺59,99 / $4.99 / €4.99
- **Yıllık:** ₺499 / $39.99 / €39.99 (≈%30 indirim)
- **Lifetime:** ₺1499 / $99 / €99 (tek seferlik)

Özellikler:
- Mod 1: **sınırsız** pantry scan
- Favori: **sınırsız**
- Reklam: **yok**
- Premium tarifler: ✅ (502 özel tarif)
- Shopping list export: ✅ (PDF/email)
- Offline indir: **sınırsız**
- Önceliklendirilmiş customer support
- Aile paylaşımı (max 5 kişi) — yıllık ve lifetime'da

---

## 🔄 FREE TRIAL

- **İlk kez** Premium'a tıklayan kullanıcı için **7 gün ücretsiz** deneme
- Auto-renew başlangıçta açık ama kullanıcı dilerse **iptal edebilir**
- Trial bitiminden 24 saat önce hatırlatma push
- Trial sırasında **tüm Premium özellikler aktif**

---

## 📦 PRODUCT IDs

### Apple (App Store Connect)
```
com.pratiktarifler.premium.monthly       — Auto-Renewable, ₺59.99/ay
com.pratiktarifler.premium.yearly        — Auto-Renewable, ₺499/yıl
com.pratiktarifler.premium.lifetime      — Non-Consumable, ₺1499 tek
```

### Google Play
```
premium_monthly                          — Subscription, ₺59.99/ay
premium_yearly                           — Subscription, ₺499/yıl  
premium_lifetime                         — In-app product, ₺1499 tek
```

### RevenueCat Entitlements
```
premium  — verir: tüm premium özelliklere erişim
```

### Stripe (Web)
```
price_monthly_try  — ₺59.99/ay recurring
price_yearly_try   — ₺499/yıl recurring
price_lifetime_try — ₺1499 one-time
```

---

## 🚨 WEBHOOK FLOW

### RevenueCat → Cloud Function
RevenueCat aboneliği değiştirdiğinde webhook gönderir:
1. `INITIAL_PURCHASE` — yeni abone
2. `RENEWAL` — yenileme başarılı
3. `CANCELLATION` — kullanıcı iptal etti (next renewal yok)
4. `EXPIRATION` — abonelik bitti
5. `BILLING_ISSUE` — ödeme başarısız
6. `PRODUCT_CHANGE` — plan yükselt/düşür
7. `TRANSFER` — başka cihaza aktarıldı

### Stripe → Cloud Function
1. `checkout.session.completed` — yeni abone
2. `invoice.payment_succeeded` — yenileme
3. `customer.subscription.deleted` — iptal
4. `customer.subscription.updated` — plan değişti
5. `invoice.payment_failed` — ödeme başarısız

### Cloud Function → Firestore
```typescript
// users/{userId}/subscription
{
  tier: 'premium' | 'free',
  product_id: 'premium_yearly',
  source: 'apple' | 'google' | 'stripe',
  started_at: Timestamp,
  expires_at: Timestamp,
  auto_renew: boolean,
  status: 'active' | 'cancelled' | 'expired' | 'billing_issue',
  trial: {
    is_active: boolean,
    ends_at: Timestamp
  },
  receipt: {
    original_transaction_id: string,
    latest_receipt: string  // encrypted
  }
}
```

---

## 🔐 GÜVENLIK

1. **Receipt Validation:** Tüm satın almalar server-side doğrulanır (RevenueCat hallediyor).
2. **Webhook Signature:** Her webhook signature ile doğrulanır.
3. **Feature Gating:** Premium özellik kontrolü **Cloud Function** seviyesinde (client trust ZERO).
4. **Restore Purchases:** "Daha önce satın aldım" butonu — userId ile RevenueCat'ten restore.

---

## 📈 ANALYTICS EVENTS

```typescript
'subscription_screen_viewed'      // ekran açıldı
'plan_selected'                   // hangi plana tıkladı
'paywall_dismissed'               // ödemeden çıktı
'trial_started'                   // 7 gün başladı
'trial_converted'                 // trial → paid
'subscription_purchased'          // satın aldı
'subscription_renewed'            // yenilendi
'subscription_cancelled'          // iptal etti
'subscription_expired'            // bitti
'restore_purchases_clicked'       // restore butonuna bastı
'restore_successful'              // restore başarılı
```

---

## 🎯 KPI HEDEFLERİ (İlk 6 ay)

| Metrik | Hedef |
|--------|-------|
| Trial conversion | %35+ |
| Monthly churn | <%8 |
| ARPU (Premium) | ₺55+/ay |
| Paywall→Trial CVR | %12+ |
| Year 1 LTV | ₺600+ |

---

## 💡 DENEYE DEĞER

- **Soft paywall:** İlk 7 gün her özellik açık (no signup wall) → engagement
- **Dynamic pricing:** İlk 24 saat içinde %50 indirim teklifi
- **Win-back:** İptal eden kullanıcıya 30 gün sonra %40 indirim push
- **Friend referral:** Arkadaş davet et → 1 ay free Premium
