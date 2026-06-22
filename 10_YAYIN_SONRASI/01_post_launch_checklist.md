# 🚀 Yayın Sonrası — İlk 30 Gün Kontrol Listesi

> Uygulama App Store ve Play Store'da yayında! Şimdi kritik 30 gün başlıyor.

---

## 📅 GÜN 1 — LANSMAN GÜNÜ

### Sabah (08:00-12:00)
- [ ] iOS production release "Release This Version" tıkla
- [ ] Android production %10 rollout başlat
- [ ] **canlıda olduğunu kendin doğrula**:
  - App Store TR'de "Pratik Tarifler" ara → görünüyor mu?
  - Play Store TR'de aynı kontrol
- [ ] Sosyal medya duyurusu (Twitter, Instagram, LinkedIn)
- [ ] Press release göndermek istediğin yayın organlarına e-posta

### Öğleden Sonra (12:00-18:00)
- [ ] İlk indirmeler gelmeye başlar — **canlı izle**:
  - Firebase Analytics → Real-time users
  - App Store Connect → App Analytics
  - Play Console → Statistics
- [ ] İlk crash raporlarını incele (Sentry + Crashlytics)
- [ ] Kullanıcı yorumlarını oku ve **yanıtla** (özellikle 1-2 yıldız)

### Akşam (18:00-24:00)
- [ ] Push bildirim test et — gerçek kullanıcılarda çalışıyor mu?
- [ ] Premium IAP gerçek satın alma denemesi (kendi hesabınla)
- [ ] Cloud Functions logs'unu kontrol et (`firebase functions:log`)
- [ ] Eğer kritik bug → hotfix planı

---

## 📅 GÜN 2-7 — İLK HAFTA

### Günlük Rutin
- [ ] **Sabah**: Crash-free rate kontrolü (hedef: ≥%99.5)
- [ ] **Öğle**: Yorumlara yanıt (1 saat ayır)
- [ ] **Akşam**: Performans metrikleri (Firebase Performance)

### Haftalık Hedefler
- [ ] 1.000+ indirme
- [ ] 4.0+ ortalama puan
- [ ] D1 retention ≥ %40
- [ ] %3+ free-to-trial conversion

### Android Rollout Aşaması
| Gün | Rollout % | Kontrol |
|-----|-----------|---------|
| Gün 1 | 10% | Crash-free ≥ 99% mi? |
| Gün 3 | 25% | Yorumlar genelde pozitif mi? |
| Gün 5 | 50% | ANR rate düşük mü? |
| Gün 7 | 100% | Her şey stabil → tam yayın |

### Kritik Sorun Durumunda
- iOS: **Hızlı 1.0.1 release** (~24 saat review)
- Android: **Halt rollout**, hotfix, %100'den tekrar başla

---

## 📅 GÜN 8-30 — STABİLİZASYON

### Haftalık Hedefler
- [ ] **Hafta 2**: 5.000+ indirme, ASO optimizasyonu
- [ ] **Hafta 3**: 10.000+ indirme, ilk Premium aboneler dönüşüyor (7 gün denemesi bitiyor)
- [ ] **Hafta 4**: 25.000+ indirme, gelir başlıyor

### ASO Optimizasyonu (Haftalık)
- [ ] App Store Connect → Analytics → "Sources" → Keywords trafik analizi
- [ ] Play Console → Acquisition → Search queries
- [ ] Düşük performanslı keyword'leri değiştir
- [ ] **A/B test** başlat:
  - Apple: Product Page Optimization (PPO)
  - Google: Store Listing Experiments

### Kullanıcı Etkileşimi
- [ ] **Her 1 yıldız yoruma** profesyonel yanıt (24 saat içinde)
- [ ] **Her 5 yıldız yoruma** teşekkür (otomatize edilebilir)
- [ ] App Store Connect → "Customer Reviews" → reply
- [ ] Play Console → "Reviews" → reply

### İçerik Stratejisi
- [ ] **Hafta 2**: Sezonsal tarif paketi push (örn. "Yaz Salatalar" + 50 yeni tarif)
- [ ] **Hafta 3**: Influencer outreach (food blogger'lar)
- [ ] **Hafta 4**: İlk basın röportajı (lokal teknoloji medyası)

---

## 📊 KRİTİK METRİKLER DASHBOARD

Her gün şu metriklere bak:

### Acquisition (İndirme)
- Daily downloads (Apple + Google ayrı)
- Conversion rate (sayfa görüntüleme → indirme)
- Top traffic sources

### Activation (Aktivasyon)
- D0 activation rate (indirenlerin yüzdesi ilk gün uygulamayı açıyor)
- D1 retention (1. gün geri dönen)
- D7 retention (1. hafta geri dönen)
- D30 retention (30 gün sonra hâlâ aktif)

### Engagement
- Average session duration
- Sessions per user
- Most used features (Mod 1, 2, 3 dağılımı)
- Recipe views per session

### Monetization
- Free-to-trial conversion (Premium 7 gün denemesi başlatan)
- Trial-to-paid conversion (deneme sonrası ücretli kalan)
- ARPU (Average Revenue Per User)
- MRR (Monthly Recurring Revenue)

### Health
- Crash-free rate
- ANR rate (Android)
- App load time (P50, P95)
- API success rate (Cloud Functions)

---

## 🆘 ACİL DURUM PROTOKOLU

### Kritik Crash (%5+ kullanıcı etkili)
1. **Sentry'de root cause** bul (~30 dk)
2. **Hotfix branch** aç, fix yaz, test et
3. iOS: `eas build --auto-submit` → expedited review iste
4. Android: AAB upload → %5 rollout → izle → artır

### Kullanıcı Verisi Sorunu
1. **Etkilenen kullanıcıları belirle** (Firestore query)
2. KVKK/GDPR bildirimi (72 saat içinde — etki büyükse)
3. Geri dönüş planı: backup'tan restore
4. Şeffaf iletişim: in-app bildirim + e-posta

### IAP Sorunu (Subscribe oluyor ama Premium aktif değil)
1. RevenueCat dashboard'da kullanıcıyı bul
2. Webhook log'larını kontrol et
3. Manuel grant: Cloud Function `grantPremiumToUser({email})`
4. Kullanıcıya özür + 1 ay ücretsiz bonus

---

## ✅ 30 GÜN SONUNDA HEDEFLER

- [ ] **25.000+ toplam indirme**
- [ ] **4.3+ ortalama puan** (Apple) / **4.2+** (Google)
- [ ] **D30 retention ≥ %15**
- [ ] **%5+ trial-to-paid** dönüşüm
- [ ] **Crash-free ≥ %99.5** sürdürülüyor
- [ ] **İlk MRR**: 5.000₺+
- [ ] **NPS** (Net Promoter Score): 30+

➡️ Hedeflere ulaştıysan → **Sürüm 1.1 planlama** (yeni özellikler)

---

*Yardım: destek@pratiktarifler.app*
