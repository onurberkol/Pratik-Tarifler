# 🚀 FAZ 6 — LAUNCH & MARKETING PAKETİ

> Pratik Tarifler / Pratik Tarifler'in **App Store / Play Store yayını** + **launch marketing** için **production-ready** dökümanlar.  
> Bu klasörü baştan sona git, hiçbir adımı atlama.

---

## 📦 PAKET İÇERİĞİ

```
phase6_launch/
│
├── 📱 app_store/                  Apple App Store yayını
│   ├── metadata_tr.md             Türkçe app listing (4000 char + screenshots + IAP)
│   └── metadata_en.md             English app listing
│
├── 🤖 play_store/                 Google Play Store yayını
│   └── metadata.md                TR + EN combined (Data Safety dahil)
│
├── 📊 aso/                        App Store Optimization
│   └── keyword_research.md        TR + EN keyword analizi + rakip analizi
│
├── 📸 screenshots/                Screenshot tasarım rehberi
│   └── SCREENSHOT_GUIDE.md        Boyutlar, sırası, mesajlar, üretim yöntemi
│
├── 📣 marketing/                  Lansman marketing planı
│   └── LAUNCH_PLAN.md             4 hafta öncesi → 30 gün sonrası
│
├── 🧪 beta/                       Beta test programı
│   └── BETA_PROGRAM.md            TestFlight + Play Console setup
│
├── ⚖️ legal/                      Hukuki dokümanlar
│   ├── privacy_policy.md          KVKK + GDPR uyumlu (TR + EN)
│   └── terms_of_service.md        Subscription disclosure dahil (TR + EN)
│
└── ✅ checklists/                 Launch checklist
    └── LAUNCH_CHECKLIST.md        100+ maddelik kapsamlı kontrol listesi
```

---

## 🎯 KULLANIM WORKFLOW (önerilen sıra)

### Aşama 1: 4 HAFTA ÖNCE (Hazırlık)

1. **`legal/`** → Avukatla incele, pratiktarifler.app'e koy
2. **`checklists/LAUNCH_CHECKLIST.md`** → Tüm "Pre-Development" bölümünü tamamla
3. **`screenshots/SCREENSHOT_GUIDE.md`** → Tasarım üretimine başla
4. **`aso/keyword_research.md`** → Keyword'leri stratejine entegre et

### Aşama 2: 3 HAFTA ÖNCE (Build & Beta)

1. **`beta/BETA_PROGRAM.md`** → Alpha aşamasını başlat (ekip)
2. **`checklists/`** → "Development" + "Backend" bölümlerini tamamla
3. **`marketing/LAUNCH_PLAN.md`** → "Hafta -3" görevlerini yap (sosyal medya, pre-registration)

### Aşama 3: 2 HAFTA ÖNCE (Closed Beta)

1. **`beta/`** → 50-100 tester'a TestFlight + Play Console invite gönder
2. **`marketing/`** → Influencer outreach, press release hazırla
3. **`app_store/` + `play_store/`** → Metadata'yı App Store Connect + Play Console'a yükle
4. **`screenshots/`** → Tasarımları upload et

### Aşama 4: 1 HAFTA ÖNCE (Final Push)

1. **`checklists/LAUNCH_CHECKLIST.md`** → Sıkı kontrol — her madde ✅ olmalı
2. **Apple ve Google'a submit**
3. **`marketing/`** → Email teaser, press pitch, influencer brief
4. **`beta/`** → Final feedback değerlendir

### 🚀 Aşama 5: LAUNCH DAY

1. **`marketing/LAUNCH_PLAN.md`** → "Saat saat" planı takip et
2. **`checklists/LAUNCH_CHECKLIST.md`** → "Post-Launch Monitoring" bölümü
3. Crash/feedback'lere anlık yanıt
4. Hot fix gerekirse hemen deploy

### 📊 Aşama 6: 30 GÜN SONRASI (Growth)

1. **`marketing/LAUNCH_PLAN.md`** → "Hafta 2-4: Growth" görevleri
2. **`aso/keyword_research.md`** → Keywords iterate et
3. **`checklists/`** → "Başarı Kriterleri" değerlendir

---

## 📋 LANSMAN ÖZETİ

### Hedef Pazarlar (Phase 1)
- 🇹🇷 Türkiye (ana pazar, Türkçe listing)
- 🇺🇸/🇬🇧/🇨🇦/🇦🇺 İngilizce konuşan dünya (English listing)

### Fiyatlandırma
| Plan | TR | US/EU |
|------|------|-------|
| Free | 0 ₺ | $0 |
| Monthly Premium | 49 ₺ | $4.99 |
| Yearly Premium | 399 ₺ (%32 indirim) | $39.99 |
| Lifetime | 999 ₺ | $99.99 |

> Tüm planlarda **7 gün ücretsiz deneme** var (Apple + Google trial mechanism).

### Hedef Metrikler (İlk 30 Gün)

| Metrik | Conservative | Stretch |
|--------|--------------|---------|
| Downloads | 10.000 | 25.000 |
| D7 Retention | %20 | %30 |
| Premium Subscribers | 250 | 750 |
| MRR | $1.250 | $3.500 |
| Average Rating | 4.0+ | 4.5+ |
| Crash-free Rate | %99 | %99.5 |

### Bütçe Tahmini

| Kalem | Bütçe |
|-------|-------|
| Apple Developer | $99/yıl |
| Google Play Developer | $25 (tek seferlik) |
| Firebase (10K MAU) | ~$25/ay |
| RevenueCat | Free (10K MTR'a kadar) |
| Domain + email | ~$20/yıl |
| Hukuk danışmanı | $300-1500 (tek seferlik) |
| **Paid ads (Ay 1)** | $1.500 |
| **Influencer (Ay 1)** | $300-500 |
| **Press kit + materials** | $200-500 |
| **TOPLAM (Ay 1)** | **~$2.500-3.500** |

---

## 🔥 KRİTİK BAŞARI FAKTÖRLERİ

### 1. Screenshot Quality (en yüksek leverage)
Conversion rate'i 2-3x değiştiriyor. `screenshots/SCREENSHOT_GUIDE.md` bu yüzden detaylı.

### 2. ASO Keyword Strategy
TR'de `buzdolabı tarif`, `akıllı tarif`, `yapay zeka tarif` — düşük rekabet boş niş. Bu kelimelerin title/subtitle/keywords'te olması ZORUNLU.

### 3. Beta Quality
Lansman'da kötü olmamak için beta'da çok kötü olmak gerek. 100 tester ile 2 hafta.

### 4. Launch Day Coordination
Saat saat plan vardı — bu disiplinli yürürse Product Hunt + press + sosyal medya momentum yakalar.

### 5. Post-Launch Iteration
İlk hafta her gün metric review + hızlı iterate. Statik kalmak ölüm.

---

## 🆘 EMERGENCY PROTOKOL

### Eğer Apple/Google REJECT ederse

**En sık reject sebepleri:**
1. **Subscription disclosure eksik**: subscription screen'de auto-renewal yazısı, restore button (Apple Guideline 3.1.2)
2. **Crashes on review**: cihaz spesifik crash — test edilen tüm cihazlarda crash-free olmalı
3. **Privacy policy eksik veya eksik bilgi**: KVKK/GDPR detayları
4. **Misleading metadata**: screenshot'lardaki özellik gerçekte yoksa
5. **Sign-in with Apple eksik** (Apple): 3rd party login varsa Apple Sign-In de olmalı

**Yapılacaklar:**
1. Reject mesajını detaylıca oku
2. **24 saat içinde fix** + appeal et
3. Apple Resolution Center'da net teknik açıklama yap
4. Geçmeyecekse: build değiştirip resubmit (1-3 gün gecikme)

### Eğer Critical Bug Production'da

1. **Phased release pause** (Apple) / **Rollout halt** (Google)
2. **Status page güncelle**: status.pratiktarifler.app
3. **In-app banner**: "Bir sorun var, yeni sürüm yolda"
4. **Email blast**: support'a yazanların hepsine durum
5. **Hot fix branch** → 24 saatte yeni build
6. **Expedited review** request Apple'a

---

## 🎯 PROJE GENEL DURUMU

```
✅ Faz 2: 2500 TR tarif veritabanı           (TAM)
✅ Faz 3.1: Firebase backend                  (TAM)
🟡 Faz 3.2: Image pipeline                    (HAZIR — API key bekliyor — D)
🟡 Faz 3.3: Translation pipeline              (HAZIR — API key bekliyor — D)
✅ Faz 4: 3 Modlu UX                          (TAM — 66 dosya)
✅ Faz 5: Subscription                        (TAM — 12 dosya)
✅ Faz 6: Launch & Marketing                  (TAM — Bu paket)
⏳ Faz 7: Post-launch optimization            (Sonraki)
```

---

## 🦁 SONUÇ

Bu paket ile elinde:
- ✅ Apple App Store yayın için **tüm metadata + IAP setup**
- ✅ Google Play Store yayın için **tüm metadata + Data Safety**
- ✅ ASO keyword stratejisi (TR + EN, niş analizi dahil)
- ✅ Screenshot tasarım rehberi (8 ekran, conversion odaklı)
- ✅ Beta test programı (TestFlight + Play Console)
- ✅ 4 + 4 hafta marketing planı (saat saat launch day)
- ✅ Privacy Policy + Terms of Service (KVKK + GDPR uyumlu)
- ✅ 100+ maddelik launch checklist

**Eksiklik:** Sadece **gerçek launch tarihi belirleyip uygulamak**.

Bu paketle 1 hafta hazırlık + 1 ay TestFlight beta + lansman.  
**Toplam time-to-market: 6 hafta** (gerçekçi).

🦁🔥 **GİT, FETHET KOÇERO!** 🚀
