# ✅ LAUNCH CHECKLIST — Pratik Tarifler

> TestFlight ve internal track'ten production launch'a kadar 100+ maddelik checklist.  
> Yayına 1 hafta kala bu dosyayı baştan sona git, hiçbir madde "❌" olmasın.

---

## 🚧 PRE-DEVELOPMENT (Hazırlık)

### Hesaplar
- [ ] **Apple Developer hesabı** ($99/yıl) — `developer.apple.com`
- [ ] **Google Play Developer hesabı** ($25 tek seferlik) — `play.google.com/console`
- [ ] **Firebase projesi** (prod ortamı)
- [ ] **RevenueCat hesabı** (free tier mevcut)
- [ ] **Stripe hesabı** (web subscription için)
- [ ] **Sentry hesabı** (crash reporting, free tier mevcut)
- [ ] **Mixpanel veya Amplitude** (analytics, free tier)
- [ ] **Domain**: pratiktarifler.app (veya benzeri)
- [ ] **E-mail**: destek@pratiktarifler.app, support@pratiktarifler.app

### Marka & Tasarım
- [ ] App ikonu 1024x1024 (iOS) + 512x512 (Android, alpha yok)
- [ ] App ikonu varyasyonları: light/dark mode (iOS 18+)
- [ ] Feature graphic 1024x500 (Play Store)
- [ ] Splash screen tasarımı (light + dark)
- [ ] Marka kılavuzu: renkler, tipografi, ton

---

## 🛠️ DEVELOPMENT (Tamamlanmış)

### Faz 2 — Veritabanı
- [x] 2500 tarif kürasyonu
- [x] Duplicate temizliği
- [x] Cuisine/category/dietary tag normalization
- [x] Firestore format export

### Faz 3 — Backend
- [x] Firebase project setup
- [x] Firestore schema + security rules
- [x] Composite indexes (13 adet)
- [x] Storage rules + folder yapısı
- [x] Cloud Functions iskelet
- [ ] **Cloud Functions deploy** ← LANSMAN ÖNCESI YAP
- [ ] **Production Firebase project** (dev'den ayrı)

### Faz 4 — UX
- [x] 17 ekran tamamlandı
- [x] 3 mod akışı
- [x] Theme + design system
- [x] i18n 13 dil
- [x] Hooks + state management
- [ ] **Real device test** (iPhone + Android)
- [ ] **Tablet support** test (iPad, Android tablet)
- [ ] **Dark mode** her ekranda test
- [ ] **Accessibility** screen reader test

### Faz 5 — Subscription
- [x] RevenueCat SDK entegrasyonu
- [x] Stripe checkout (web)
- [x] Webhook handlers
- [x] Premium gating
- [x] Free trial logic
- [ ] **Sandbox test purchase** (Apple sandbox account)
- [ ] **Test card** Stripe test mode
- [ ] **Restore purchase** akışı test

---

## 🧪 TESTING & QA

### Unit Tests
- [ ] `npm run test` — tüm geçiyor mu?
- [ ] Coverage > %70
- [ ] Critical paths (3 mod algoritması) %100 coverage

### Integration Tests
- [ ] Firebase emulator ile end-to-end
- [ ] Auth flow (signup → email verify → signin)
- [ ] Recipe flow (browse → favorite → cook mode)
- [ ] Pantry scan flow (photo → vision → results)
- [ ] Subscription flow (trial → paid → cancel)

### Manual Test
- [ ] **iPhone (iOS 17+)** — en az 3 cihaz
- [ ] **iPhone SE** (küçük ekran)
- [ ] **iPad** (tablet layout)
- [ ] **Android (API 26+)** — Samsung, Pixel
- [ ] **Android tablet**

### Real Device Testing
- [ ] Push notifications fiziksel cihazda gelir mi?
- [ ] Camera permission flow
- [ ] Photo upload + Vision API
- [ ] Offline mode (havayolu modu)
- [ ] Background → foreground transition
- [ ] Memory leak (1 saat kullan, RAM kontrol)
- [ ] Battery drain test

### Edge Cases
- [ ] Boş tarif listesi UX
- [ ] No internet UX
- [ ] Vision API failure UX
- [ ] Subscription cancel mid-flow
- [ ] Free trial expiry
- [ ] Çok yavaş 3G simulation

---

## 🌐 BACKEND PRODUCTION

### Firebase
- [ ] **Production project** ayrı (pratik-tarifler-prod)
- [ ] **Firestore Rules** prod için sıkı (test rules KALDIR)
- [ ] **Storage Rules** prod için sıkı
- [ ] **Indexes deploy** prod'a
- [ ] **Backup schedule** aktif (günlük)
- [ ] **Budget alert**: aylık $100'a uyarı

### Cloud Functions
- [ ] Tüm functions prod project'e deploy
- [ ] Logs Sentry'ye yönlendir
- [ ] Cold start optimization (min instances: 1 critical functions için)
- [ ] Rate limiting test

### Secrets
- [ ] STRIPE_SECRET_KEY (prod)
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] REVENUECAT_WEBHOOK_SECRET
- [ ] GOOGLE_VISION_API_KEY (service account)
- [ ] OPENAI_API_KEY (embeddings için)

### Image Pipeline (Faz 3.2)
- [ ] 2500 tarifin görseli yüklendi mi? (Storage'da)
- [ ] Blur hash hesaplandı mı?
- [ ] CDN aktif mi (Firebase Hosting üzerinden)?

### Translation Pipeline (Faz 3.3)
- [ ] 12 dile çeviri yapıldı mı?
- [ ] Glossary korunmuş mu (Türk yemek isimleri orijinal)?
- [ ] Spot check (her dilden 5 tarif)

---

## 📱 iOS APP STORE

### App Store Connect Setup
- [ ] **Yeni app oluştur** App Store Connect
- [ ] Bundle ID: `com.yourcompany.pratiktarifler` (Apple Developer'da match)
- [ ] SKU: `pratik-tarifler-001`
- [ ] Birincil dil: Türkçe
- [ ] Sahip bilgileri tam doldurulmuş

### Metadata (TR + EN)
- [ ] App name (30 char)
- [ ] Subtitle (30 char)
- [ ] Keywords (100 char)
- [ ] Promotional text (170 char)
- [ ] Description (4000 char)
- [ ] Support URL canlı
- [ ] Privacy URL canlı
- [ ] Marketing URL canlı

### App Privacy
- [ ] **Privacy Nutrition Label** doldurulmuş
- [ ] Collected data: e-mail, photos (temp), interactions
- [ ] Linked to identity / not linked
- [ ] Used to track user: No

### Screenshots & Media
- [ ] iPhone 6.9" screenshots: min 3 (TR + EN)
- [ ] iPhone 6.5" screenshots: min 3 (eski cihaz fallback)
- [ ] App Preview video (opsiyonel ama önerilen)

### In-App Purchases
- [ ] `premium_monthly` (Auto-Renewable Subscription)
  - Display name (TR + EN)
  - Description
  - Subscription duration: 1 month
  - Free trial: 7 days
  - Price: 49 ₺ / $4.99
- [ ] `premium_yearly` (Auto-Renewable Subscription)
  - Subscription duration: 1 year
  - Free trial: 7 days
  - Price: 399 ₺ / $39.99
- [ ] `premium_lifetime` (Non-Consumable)
  - Price: 999 ₺ / $99.99
- [ ] **Subscription review information**: test account + instructions
- [ ] **Subscription group**: tüm subscriptions aynı grup'ta

### TestFlight
- [ ] Internal testers (kendi ekip)
- [ ] External testers (50-100 beta user)
- [ ] Test notes her build için
- [ ] Beta feedback survey link

### Submit for Review
- [ ] Build uploaded (final)
- [ ] App review information doldurulmuş
- [ ] Demo account credentials (review test için)
- [ ] Notes for reviewer
- [ ] Submit!

---

## 🤖 GOOGLE PLAY STORE

### Play Console Setup
- [ ] **Yeni app** Play Console'da
- [ ] Package name: `com.yourcompany.pratiktarifler`
- [ ] App or game: App
- [ ] Free or paid: Free (with IAP)
- [ ] Declarations: ads (No), content guidelines (Yes), export laws (Yes)

### Store Listing
- [ ] App name (30 char)
- [ ] Short description (80 char)
- [ ] Full description (4000 char)
- [ ] Category: Food & Drink
- [ ] Tags eklendi
- [ ] Contact details: email, website, phone
- [ ] Privacy policy link

### Graphic Assets
- [ ] App icon 512x512
- [ ] Feature graphic 1024x500
- [ ] Phone screenshots min 2 (önerilen 8)
- [ ] Tablet screenshots (opsiyonel)
- [ ] Promo video YouTube link (opsiyonel)

### Content Rating
- [ ] Content rating questionnaire doldurulmuş
- [ ] Beklenen rating: Everyone

### Data Safety
- [ ] Data types collected listelendi
- [ ] Data sharing: hayır
- [ ] Security practices: encryption in transit + at rest
- [ ] Data deletion: in-app + email request

### Pricing & Distribution
- [ ] Countries: Türkiye + tüm desteklenen
- [ ] Pricing: free with IAP
- [ ] Contains ads: No
- [ ] Target audience: 13+

### In-App Products
- [ ] `premium_monthly` (Subscription, monthly)
- [ ] `premium_yearly` (Subscription, yearly)
- [ ] `premium_lifetime` (One-time product)
- [ ] Pricing per country
- [ ] Free trial: 7 days
- [ ] Grace period: 7 days

### Pre-launch Report
- [ ] Internal testing track aktif
- [ ] Closed testing (50 user)
- [ ] Open testing (opsiyonel)
- [ ] Pre-launch report yeşil — kritik issue yok

### Production Release
- [ ] Release notes (TR + EN)
- [ ] Staged rollout: %5 → %10 → %50 → %100
- [ ] Rollout monitoring plan

---

## 📊 ANALYTICS & MONITORING

### Tracking
- [ ] Firebase Analytics aktif
- [ ] Custom events tanımlı (paywall_triggered, subscription_started, etc.)
- [ ] Funnels tanımlı (signup → trial → paid)
- [ ] Conversion goals: subscription_started

### Crash Reporting
- [ ] Sentry SDK entegre
- [ ] Source maps upload otomatik (release sırasında)
- [ ] Alert: crash-free rate < %99
- [ ] On-call rotation (sen + 1 kişi)

### Performance
- [ ] Firebase Performance Monitoring
- [ ] Critical traces: app_start, screen_render, api_call
- [ ] Slow trace alerts (>3s)

---

## ⚖️ LEGAL & COMPLIANCE

### Yasal Belgeler
- [ ] **Privacy Policy** (TR + EN) — pratiktarifler.app/privacy
- [ ] **Terms of Service** (TR + EN) — pratiktarifler.app/terms
- [ ] **Cookie Policy** (eğer web varsa)
- [ ] **Subscription Terms** (auto-renewal disclosure)
- [ ] **EULA** App Store standard (sufficient)

### Uyumluluk
- [ ] **KVKK** (Türkiye) — Veri sahibi hakları, açık rıza
- [ ] **GDPR** (Avrupa) — Right to deletion, data portability
- [ ] **CCPA** (California) — "Do not sell my info" opt-out
- [ ] **COPPA** — children under 13 kullanıcı yok
- [ ] **HIPAA** — gerekli değil (sağlık verisi yok)

### App Tracking Transparency (iOS 14.5+)
- [ ] ATT prompt için gerekçe
- [ ] Privacy Manifest (PrivacyInfo.xcprivacy)
- [ ] Tracking declaration App Store Connect

### Subscription Compliance
- [ ] Auto-renewal disclosure açıkça gösteriliyor (subscription screen)
- [ ] Restore purchases butonu mevcut
- [ ] Cancel instructions (Apple subscriptions, Play subscriptions)

---

## 📣 MARKETING & LAUNCH

### Landing Page
- [ ] pratiktarifler.app canlı
- [ ] Mobile responsive
- [ ] Download buttons (App Store + Play Store badges)
- [ ] Feature overview
- [ ] Screenshots carousel
- [ ] Testimonials (beta'dan)
- [ ] FAQ
- [ ] Email signup (launch notification için)
- [ ] Privacy + Terms linkler

### Social Media
- [ ] **Instagram** @pratiktarifler — bio + ilk 9 post
- [ ] **TikTok** @pratiktarifler — launch teaser video
- [ ] **Twitter/X** @pratiktarifler
- [ ] **YouTube** kanal (recipe video'lar için)
- [ ] **Facebook** sayfa

### Content
- [ ] Launch blog post (kendi sitende)
- [ ] Press release (TR + EN)
- [ ] Product Hunt hazırlığı
- [ ] Reddit submission planı (r/Apps, r/turkey, r/Cooking)
- [ ] Influencer outreach listesi (10 mutfak influencer)

### PR
- [ ] **Tech in Turkey** — pitch
- [ ] **Webrazzi** — kuruluş hikayesi
- [ ] **Donanım Haber** — yapay zeka açısı
- [ ] **TechCrunch** (uzun shot)

### Launch Day
- [ ] Product Hunt'a 00:00 PT'de gönder
- [ ] Social media post 9:00 TR
- [ ] Email to waitlist
- [ ] Press release dağıtımı
- [ ] Yapay zeka grup'larında paylaş

---

## 💰 MONETIZATION

### Subscription Setup
- [ ] RevenueCat dashboard: products + offerings tanımlı
- [ ] App Store Connect: subscriptions onaylı
- [ ] Play Console: subscriptions aktif
- [ ] Stripe: products + prices oluşturuldu
- [ ] Webhook'lar test edildi
- [ ] Free trial logic %100 doğrulandı

### Pricing
- [ ] TR pricing: 49 ₺ / 399 ₺ / 999 ₺
- [ ] US pricing: $4.99 / $39.99 / $99.99
- [ ] EU pricing (€4.99 / €39.99 / €99.99)
- [ ] Country-specific pricing (purchasing power adjusted)

### Promo Codes
- [ ] App Store promo codes: 100 adet hazır
- [ ] Play Store promo codes: 100 adet hazır
- [ ] Stripe coupons: LAUNCH50 (50% off ilk ay)
- [ ] Influencer coupons: özel kodlar

---

## 🆘 POST-LAUNCH MONITORING (İlk 48 saat)

### Saat 0-12
- [ ] Crash rate < %0.5
- [ ] D1 retention canlı dashboard
- [ ] Reviews flag: 1 yıldız varsa hemen yanıt
- [ ] Support email her saat kontrol
- [ ] Server load Firebase'de OK

### Saat 12-48
- [ ] İlk 24 saat metrics raporu
- [ ] Hot fix release planı (gerekirse)
- [ ] Press response (eğer pickup varsa)
- [ ] Social media engagement

### İlk Hafta
- [ ] Daily metrics review
- [ ] Top crash investigation
- [ ] User feedback synthesis
- [ ] Feature request prioritization

---

## 🎯 BAŞARI KRITERLERI

### Hafta 1
- [ ] 1.000 download
- [ ] %99+ crash-free rate
- [ ] 4.0+ ortalama rating
- [ ] 50+ review

### Ay 1
- [ ] 10.000 download
- [ ] %35+ D7 retention
- [ ] 200+ premium subscriber
- [ ] %5+ free-to-paid conversion

### Ay 3
- [ ] 50.000 download
- [ ] 1.000+ premium subscriber
- [ ] MRR > $5,000
- [ ] Featured on App Store (TR)

---

## 🔥 ROLLBACK PLANI

Eğer launch sonrası kritik bug:

1. **Production'dan geri çek** (App Store: phased release pause; Play: rollout %0)
2. **Hot fix branch** aç
3. **24 saatte yeni build**
4. **Expedited review** Apple'a request
5. **Communications**: status page, email, in-app banner

---

🦁 **SONUÇ**: Bu checklist 100+ madde. Lansman'dan 2 hafta önce başla, her gece 10-20 madde tamamla. "Yarın yaparım" deme — Apple/Google reject döngüsüne girersen 1-2 hafta kaybedersin.
