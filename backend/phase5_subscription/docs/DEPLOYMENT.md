# 🚀 Faz 5 — Deployment Rehberi

> **Subscription sistemini canlıya almak için adım adım.**  
> Bu rehbere göre yapılırsa **2-3 günde production-ready** olur.

---

## 📋 GENEL AKIŞ

```
1. App Store Connect / Play Console'da product'lar yarat (1 saat)
2. RevenueCat hesabı + entitlement + offering setup (30 dk)
3. Stripe hesabı + product'lar + webhook (30 dk)
4. Cloud Functions deploy (10 dk)
5. Mobile app entegre (kod hazır)
6. Test (sandbox + real device) (2-4 saat)
7. Apple/Google review submission (1-2 hafta bekleme)
```

---

## 1️⃣ APP STORE CONNECT KURULUMU

### Product oluştur (App Store Connect → Apps → Pratik Tarifler → In-App Purchases)

#### a) Aylık Abonelik
- **Reference Name:** Premium Monthly
- **Product ID:** `com.pratiktarifler.premium.monthly`
- **Type:** Auto-Renewable Subscription
- **Subscription Group:** "Pratik Tarifler Premium"
- **Duration:** 1 Month
- **Price:** Türkiye ₺59.99 / US $4.99 / EU €4.99
- **Localizations:** TR + EN (en az 2)
- **Review Notes:**
  ```
  This is a monthly auto-renewing subscription that unlocks:
  - Unlimited pantry scans
  - Unlimited favorites
  - 502 premium recipes
  - PDF shopping list export
  ```

#### b) Yıllık Abonelik (Free Trial ile)
- **Product ID:** `com.pratiktarifler.premium.yearly`
- **Duration:** 1 Year
- **Introductory Offer:** Free Trial 7 days (first-time only)
- **Price:** Türkiye ₺499 / US $39.99 / EU €39.99

#### c) Lifetime
- **Product ID:** `com.pratiktarifler.premium.lifetime`
- **Type:** Non-Consumable
- **Price:** Türkiye ₺1499 / US $99 / EU €99

### App-Specific Shared Secret
- App Store Connect → My Apps → Pratik Tarifler → App Information → App-Specific Shared Secret
- **Generate** ve kopyala — RevenueCat'e koyacağız

---

## 2️⃣ GOOGLE PLAY CONSOLE KURULUMU

### Subscription oluştur

#### a) `premium_monthly`
- **Subscription ID:** `premium_monthly`
- **Name:** Pratik Tarifler Premium - Aylık
- **Base Plan ID:** `monthly`
- **Billing Period:** P1M (1 ay)
- **Price:** Türkiye ₺59.99

#### b) `premium_yearly`
- **Subscription ID:** `premium_yearly`
- **Base Plan ID:** `yearly`
- **Billing Period:** P1Y
- **Free Trial:** 7 days
- **Price:** Türkiye ₺499

#### c) `premium_lifetime` (In-app product, NOT subscription)
- **Product ID:** `premium_lifetime`
- **Type:** Managed product
- **Price:** ₺1499

### Service Account Key (RevenueCat için)
- Google Play Console → Setup → API Access
- Create new service account → download JSON
- Bu JSON'u RevenueCat'e yükleyeceğiz

---

## 3️⃣ REVENUECAT KURULUMU

### Step 1: Proje Yarat
1. https://app.revenuecat.com → New Project
2. Project Name: "Pratik Tarifler"
3. App ekle: iOS + Android (2 ayrı)

### Step 2: Apple Setup
- iOS App → App Store Server-to-Server credentials
- App-Specific Shared Secret yapıştır
- App Store Connect API → Generate key JSON yapıştır

### Step 3: Google Setup
- Android App → Service Account Credentials
- Service Account JSON yapıştır

### Step 4: Entitlements
- Entitlements → New: `premium`
- Bu entitlement'a 3 product'ı bağla:
  - `com.pratiktarifler.premium.monthly` (iOS)
  - `com.pratiktarifler.premium.yearly` (iOS)
  - `com.pratiktarifler.premium.lifetime` (iOS)
  - `premium_monthly:monthly` (Android)
  - `premium_yearly:yearly` (Android)
  - `premium_lifetime` (Android)

### Step 5: Offerings
- Offerings → Create: "default"
- Packages ekle:
  - `$rc_monthly` → iOS Monthly + Android Monthly
  - `$rc_annual` → iOS Yearly + Android Yearly
  - `lifetime` → custom package → iOS Lifetime + Android Lifetime
- Set as **current** offering

### Step 6: Webhook
- Project Settings → Integrations → Webhooks → Add
- URL: `https://us-central1-{firebase-project}.cloudfunctions.net/revenuecatWebhook`
- Authorization Header:
  ```
  Authorization: Bearer YOUR_SECRET_HERE
  ```
- Bu secret'i Firebase'e ekle:
  ```bash
  firebase functions:secrets:set REVENUECAT_WEBHOOK_SECRET
  # paste secret when prompted
  ```

### Step 7: API Keys
- API Keys sayfasından **iOS** ve **Android** key'lerini kopyala:
  ```
  EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
  EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxx
  ```

---

## 4️⃣ STRIPE KURULUMU (Web için)

### Step 1: Stripe hesabı
- https://stripe.com → Türkiye için aktivasyon
- Test mode'da başla

### Step 2: Products
Stripe Dashboard → Products → 3 product yarat:

#### Premium Monthly
- Name: Pratik Tarifler Premium - Monthly
- Price: ₺59.99 TRY recurring (monthly)
- Tax: VAT (KDV %18) inclusive
- **Price ID kopyala:** `price_xxx`

#### Premium Yearly
- Name: Pratik Tarifler Premium - Yearly
- Price: ₺499 TRY recurring (yearly)
- Free Trial: 7 days
- **Price ID kopyala**

#### Premium Lifetime
- Name: Pratik Tarifler Premium - Lifetime
- Price: ₺1499 TRY one-time
- **Price ID kopyala**

### Step 3: Webhook
- Dashboard → Developers → Webhooks → Add endpoint
- URL: `https://us-central1-{firebase-project}.cloudfunctions.net/stripeWebhook`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.trial_will_end`
- **Signing Secret kopyala:** `whsec_xxx`

### Step 4: Firebase secrets
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
# sk_live_... veya sk_test_...

firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# whsec_...

firebase functions:config:set \
  stripe.price_monthly="price_xxx" \
  stripe.price_yearly="price_yyy" \
  stripe.price_lifetime="price_zzz"
```

---

## 5️⃣ CLOUD FUNCTIONS DEPLOY

```bash
# Dosyaları functions/src/ altına kopyala
cp phase5_subscription/cloud_functions/*.ts functions/src/

# package.json'a Stripe ekle
cd functions
npm install stripe

# Index'e export ekle (functions/src/index.ts):
cat >> src/index.ts << 'EOF'

// Faz 5 — Subscription
export { revenuecatWebhook, sendWinbackOffers } from './revenuecatWebhook';
export { 
  createStripeCheckout, 
  createCustomerPortal, 
  stripeWebhook 
} from './stripeWebhook';
EOF

# Build & deploy
npm run build
firebase deploy --only functions
```

### Webhook URL'lerini test et
```bash
# RevenueCat webhook test
curl -X POST https://us-central1-{project}.cloudfunctions.net/revenuecatWebhook \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"event":{"type":"TEST"}}'

# Stripe webhook test (Stripe CLI ile)
stripe listen --forward-to https://us-central1-{project}.cloudfunctions.net/stripeWebhook
```

---

## 6️⃣ MOBILE APP ENTEGRE

### Install dependencies
```bash
npm install react-native-purchases
cd ios && pod install && cd ..
```

### App.tsx'e ekle
```typescript
import * as RevenueCat from './services/revenuecat';

useEffect(() => {
  RevenueCat.init();
}, []);
```

### Auth state listener
```typescript
useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (user) {
      await RevenueCat.identify(user.uid);
    } else {
      await RevenueCat.signOut();
    }
  });
  return unsub;
}, []);
```

### .env'e ekle
```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxx
```

---

## 7️⃣ TEST CHECKLİSTİ

### Sandbox Testing (App Store)
- [ ] App Store Connect → Users → Sandbox Testers → Test user yarat
- [ ] iOS device'ta Settings → App Store → Sandbox Account ile giriş yap
- [ ] App'i çalıştır → Premium → Yıllık seç (7 gün trial)
- [ ] Subscription başlamış mı? Firestore'da `users/{uid}/subscription/current` kontrol et
- [ ] App Store Connect'te subscription görünüyor mu?
- [ ] Trial'ı erken bitir (sandbox 3 dk = 1 ay) → auto-renew oldu mu?
- [ ] Cancel test
- [ ] Restore test

### Google Play Testing
- [ ] Internal testing track'e build yükle
- [ ] License testers ekle (kendi Google hesabın)
- [ ] Sandbox satın al
- [ ] Renew (Google sandbox: 5 dk = 1 ay)

### Stripe Testing
- [ ] Test card: `4242 4242 4242 4242`, any future date, any CVC
- [ ] Trial test, renewal test, cancel test
- [ ] Customer Portal'a yönlenme test

### Webhook Testing
- [ ] RevenueCat dashboard → Webhooks → Send Test
- [ ] Cloud Functions logs'ta gelmiş mi?
- [ ] Firestore'da subscription document güncellendi mi?

### Edge Cases
- [ ] Network kesik iken satın alma → restore çalışıyor mu?
- [ ] Premium iken signout → tier değişiyor mu?
- [ ] Cancel sonrası yeniden satın alma → status doğru mu?
- [ ] Trial bitince free'ye düşüyor mu?
- [ ] Family sharing test (iOS)

---

## 🚨 ÖNEMLİ UYARILAR

### Apple Review
- **Restore Purchases butonu ZORUNLU** (SubscriptionScreen'de mevcut ✓)
- **Terms & Privacy linkleri ZORUNLU** (SubscriptionScreen'de mevcut ✓)
- **Auto-renewal disclosure ZORUNLU** (SubscriptionScreen'de mevcut ✓)
- Free trial varsa "Trial ends, then ₺X/year" açıkça gösterilmeli

### Vergi
- Türkiye için **KDV %18** otomatik App Store/Google Play tarafından kesilir
- Stripe için manuel tax config gerekli (Stripe Tax'ı aç)

### Komisyon
| Platform | Komisyon |
|----------|----------|
| Apple App Store | %30 (ilk yıl), %15 (sonraki yıllar) |
| Google Play | %30 (ilk yıl), %15 (sonraki yıllar) |
| Stripe | %2.9 + 30¢ (Türkiye için ~%4.5 + 1₺) |
| **RevenueCat** | $0 → $10K MTR, sonra %1 |

### Gerçek gelir hesabı (₺499/yıl yıllık plan)
- App Store: ₺499 × %70 (komisyon) = ₺349
- RevenueCat: $0 (ilk $10K MTR)
- KDV zaten Apple kesti
- **Net: ~₺349/yıl per user** 

---

## 📊 ANALİTİK & MONİTORİNG

### Önemli Dashboardlar
1. **RevenueCat Dashboard:** MRR, churn, conversion
2. **Firebase Analytics:** funnel metrikleri
3. **Stripe Dashboard:** web satışları, refund'lar

### Custom Metrics
```typescript
// Cloud Function'da kayıt:
analytics.logEvent('subscription_purchased', {
  product_id, price_currency, price_amount, is_trial
});

// Sonra Firebase Analytics dashboard'da:
- DAU/MAU
- Trial → Paid CVR
- 7-day retention
- LTV
```

---

## 🎯 İLK 30 GÜN HEDEFLERİ

| Metrik | Hedef |
|--------|-------|
| MAU | 5,000 |
| Trial başlatan | 500 (%10) |
| Trial→Paid CVR | 175 (%35) |
| MRR | ₺8,500 |
| Churn (monthly) | <%10 |

İlk 6 ay sonu hedef: **₺50,000 MRR**

🦁🔥
