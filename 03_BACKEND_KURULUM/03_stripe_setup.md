# 💳 Stripe — Web Ödeme Kurulumu

> Mobil uygulamada IAP zorunlu (Apple/Google kuralı). Ama web tarafında abonelik satışı yapmak istersen Stripe gerekli — sadece web için.

**Bu rehber opsiyonel** — sadece web sitenizde abonelik satışı olacaksa kurulum yapın.

---

## 1️⃣ STRIPE HESABI

→ [stripe.com](https://stripe.com/) — kayıt ol → Türkiye için Stripe Atlas veya iyzico alternatifi gerekebilir.

> **Not**: Stripe Türkiye'de doğrudan TL kabul etmiyor. Alternatif: **iyzico** (yerli) veya **PayTR**.

---

## 2️⃣ PRODUCTS OLUŞTUR

Stripe Dashboard → Products → "+ Add product":

### Product 1 — Premium Monthly
- **Name**: Pratik Tarifler Premium Monthly
- **Pricing**: 49 TRY (veya $1.49 USD eşdeğeri)
- **Billing**: Recurring, monthly
- **Free trial**: 7 days

### Product 2 — Premium Yearly
- **Name**: Pratik Tarifler Premium Yearly
- **Pricing**: 399 TRY
- **Billing**: Recurring, yearly
- **Free trial**: 7 days

Price ID'leri kopyala (örn. `price_1xxxxx`).

---

## 3️⃣ API KEYS

Stripe Dashboard → Developers → API keys:
- **Publishable key**: `pk_live_xxx` → web frontend'de
- **Secret key**: `sk_live_xxx` → Cloud Functions secret'ı

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
```

---

## 4️⃣ WEBHOOK

Stripe → Developers → Webhooks → "+ Add endpoint":

| Alan | Değer |
|------|-------|
| **URL** | `https://europe-west3-pratik-tarifler.cloudfunctions.net/stripeWebhook` |
| **Events** | `customer.subscription.*`, `invoice.*`, `checkout.session.completed` |

Signing secret'ı al → Cloud Functions'a set et:
```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase deploy --only functions:stripeWebhook
```

---

## 5️⃣ CHECKOUT SESSION

Web frontend'de kullanım:
```js
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{ price: 'price_xxxxx', quantity: 1 }],
  success_url: 'https://pratiktarifler.app/success',
  cancel_url: 'https://pratiktarifler.app/pricing',
  subscription_data: { trial_period_days: 7 }
});
```

---

## 6️⃣ TEST MODE

Stripe → "Test mode" toggle aç:
- Test card: `4242 4242 4242 4242` — herhangi bir CVC + gelecek tarih
- 3D Secure test: `4000 0027 6000 3184`
- Decline test: `4000 0000 0000 0002`

---

## ⚠️ TÜRKİYE NOTU

Stripe yerine **iyzico** kullanmayı düşün:
- Yerli, Türkçe destek
- TL doğrudan kabul
- Setup: [iyzico.com/dev](https://iyzico.com/dev)

Cloud Function entegrasyonu için: `functions/src/iyzicoWebhook.ts` (önceden hazır)

---

*Yardım: destek@pratiktarifler.app*
