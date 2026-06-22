# 📊 İzleme ve Metrikler — Operasyon Kılavuzu

> Uygulamanın sağlığını ve büyümesini gerçek zamanlı izle.

---

## 🎛️ İZLEME KONTROL PANELLERİ

### 1. Firebase Console
URL: https://console.firebase.google.com/project/pratik-tarifler

**Günde 1 kez bak**:
- Analytics → Real-time → şu an aktif kullanıcı sayısı
- Crashlytics → Issues → yeni crash'ler
- Performance → P50/P95 trace duration

**Haftada 1 kez bak**:
- Firestore → Usage → okuma/yazma maliyet trendi
- Functions → Logs → hata oranı
- Storage → Usage → toplam depolama

### 2. App Store Connect
URL: https://appstoreconnect.apple.com

**Günde 1 kez**:
- App Analytics → Overview → impressions, downloads, conversion
- Sales and Trends → günlük gelir
- Ratings and Reviews → yeni yorumlar

### 3. Google Play Console
URL: https://play.google.com/console

**Günde 1 kez**:
- Statistics → Installs, Ratings
- Android Vitals → Crash rate, ANR rate
- User feedback → Reviews

### 4. RevenueCat Dashboard
URL: https://app.revenuecat.com

**Günde 1 kez**:
- Overview → MRR, Active Subscriptions
- Charts → trial conversion funnel
- Customers → yeni abone, churn

### 5. Sentry
URL: https://sentry.io

**Günde 1 kez**:
- Issues → unresolved errors
- Performance → slow transactions
- Releases → her sürümün sağlığı

---

## 🚨 ALERT KURALLARI

### Slack/Discord webhook'a otomatik bildirim

#### Kritik (P0)
- Crash-free rate < %99 (anlık alert)
- Sentry'de aynı hata 1 saatte > 100 kez
- Firebase Functions error rate > %5
- API endpoint p95 > 5 saniye

#### Yüksek (P1)
- Yeni 1 yıldız yorum
- Premium dönüşüm < %2 (haftalık)
- DAU haftalık % azalış > %20

#### Orta (P2)
- Yeni güncel review (4-5 yıldız) — teşekkür için
- Aylık MRR raporu (her ayın 1'i)

### Setup
- **Firebase Alerting**: Console → Settings → Alerts
- **Sentry Alerts**: Project → Alerts → Create Rule
- **PagerDuty** (opsiyonel): kritik P0 için on-call

---

## 📈 HAFTALIK STANDUP METRİKLERİ

Her Pazartesi sabahı şunları kontrol et:

```
📅 [Hafta X — Tarih Aralığı]

📥 ACQUISITION
- Yeni indirme (iOS + Android): __ (geçen hafta __, % değişim)
- App Store impressions: __
- Play Store impressions: __
- Conversion rate: __ %

⚡ ACTIVATION
- D1 retention: __ %
- D7 retention: __ %
- Active users (DAU): __

💰 MONETIZATION
- Yeni Premium aboneler: __
- Aktif abone toplamı: __
- MRR: __ ₺
- Trial-to-paid: __ %
- Churn rate: __ %

🏥 HEALTH
- Crash-free rate: __ %
- Sentry yeni issue: __
- Avg session duration: __ dk

⭐ FEEDBACK
- Ortalama puan: __ ⭐
- Yeni yorum: __ adet
- Yanıt verilen yorum: __ adet

🎯 SONRAKİ HAFTA
- Top 3 öncelik
- Risk faktörleri
```

---

## 🔍 KULLANICI DAVRANIŞ ANALİZİ

### Önemli funnel'lar

#### Funnel 1: İlk Kullanım
```
İndir → Aç → Onboarding tamamla → Hesap oluştur → Ana sayfa
[100%]   [80%]    [65%]              [40%]          [38%]
```
> %80'in altına düşerse onboarding'i kısalt!

#### Funnel 2: Premium Dönüşüm
```
Profil aç → Premium kartı gör → Plan seç → Deneme başlat → 7 gün sonra ödeme
[100%]      [60%]              [15%]      [12%]           [4%]
```
> Trial-to-paid %4'ün üstüne çıksın!

#### Funnel 3: Aktif Pişirme
```
Tarif aç → Pişirmeye başla → Adımlar bitir → Tarif tamamla → Yorum yap
[100%]    [25%]             [18%]           [12%]          [1.5%]
```

### Custom Event'ler (Firebase Analytics)
- `recipe_view`
- `recipe_favorited`
- `fridge_scan_started`
- `fridge_scan_completed`
- `premium_screen_viewed`
- `subscription_started`
- `cooking_mode_completed`
- `language_changed`
- `share_recipe`

---

## 📉 COHORT ANALİZİ

Aylık cohort analizi yap:

| Kayıt Ayı | Kullanıcı | D7 | D30 | D90 |
|-----------|-----------|-----|------|------|
| Haziran | 10.000 | 35% | 15% | 5% |
| Temmuz | 12.000 | 38% | 17% | 6% |
| Ağustos | ... | ... | ... | ... |

> Yeni cohort'lar **eski cohort'lara göre daha iyi** olmalı. Aksi takdirde regression var demektir.

---

## 💸 MALİYET TAKİBİ

### Aylık Backend Maliyeti (10K aktif kullanıcıda)
| Servis | Maliyet | Notlar |
|--------|---------|--------|
| Firebase Firestore | $15 | Reads dominant |
| Firebase Functions | $10 | Image processing pahalı |
| Firebase Storage | $5 | CDN dahil |
| Firebase Auth | $0 | Free tier yetiyor |
| Sentry | $0 (Developer plan) | 5K event/ay |
| RevenueCat | $0 | $2.5K MRR'a kadar |
| Cloud Vision API | $20 | Buzdolabı taraması |
| **TOPLAM** | **~$50/ay** | |

### Maliyet/kullanıcı
- 10K kullanıcı → $0.005/kullanıcı
- Premium'a dönen kullanıcı: $0.10/ay kazanç vs $0.005 maliyet = **20x margin**

---

*Yardım: destek@pratiktarifler.app*
