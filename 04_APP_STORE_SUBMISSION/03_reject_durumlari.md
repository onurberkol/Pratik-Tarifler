# 🚫 App Store Reject Durumları — Çözüm Rehberi

> Apple uygulamayı reddederse panik yapma! En yaygın reject sebepleri ve çözümleri.

---

## 🎯 İLK YANITINI APPLE'A NASIL VER

Apple Resolution Center mesajı geldiğinde:

1. **Hemen yanıt verme** — önce reject mesajını dikkatlice oku
2. **Hangi guideline ihlal edildi** — mesajda numara var (örn. 2.1, 4.0)
3. **Apple Developer Guidelines'a bak** — [developer.apple.com/app-store/review/guidelines](https://developer.apple.com/app-store/review/guidelines/)
4. **Yanıt yaz** — kısa, profesyonel, çözüm odaklı

### Örnek yanıt şablonu (İngilizce — Apple'a)
```
Hello App Review Team,

Thank you for your feedback regarding Guideline X.X.

[Sorunu nasıl anladığını açıkla]
[Nasıl çözdüğünü açıkla — bir sonraki build'de mi, açıklama yeterli mi?]
[Demo hesabı, sample data veya gerekli bilgileri tekrar belirt]

We have addressed this in build [X.X.X (build N)]. Please review.

Best regards,
[İsim]
support@pratiktarifler.app
```

---

## 📋 EN YAYGIN REJECT SEBEPLERİ

### 1️⃣ Guideline 2.1 — App Completeness

#### Sebep: "Demo account doesn't work"
**Çözüm**:
- Firebase Auth'ta `apple.reviewer@pratiktarifler.app` hesabının varlığını doğrula
- Premium aktif et: `grantPremiumToUser({email: "apple.reviewer@..."})`
- Şifreyi tekrar test et — yazım hatası var mı?
- App Review Information'da şifreyi tekrar gir

#### Sebep: "App crashes on launch"
**Çözüm**:
- Sentry/Crashlytics'te crash raporlarını incele
- iOS Simulator'de aynı versiyonu test et
- Apple'ın test ettiği iOS sürümünde test et (genelde en güncel)

---

### 2️⃣ Guideline 2.3.7 — Accurate Metadata

#### Sebep: "Screenshots don't match the actual app"
**Çözüm**:
- Screenshot'lardaki tüm özellikler uygulamada var olmalı
- "Coming soon" veya placeholder yazılar olmamalı
- Gerçek ekran görüntüleri kullan, mockup değil
- Promosyon metnindeki tüm özellikler test edilebilir olmalı

---

### 3️⃣ Guideline 3.1.1 — In-App Purchase

#### Sebep: "Subscription terms not disclosed"
**Çözüm**:
Premium ekranında ŞU bilgilerin tamamı olmalı:
- Abonelik süresi (aylık/yıllık)
- Fiyat
- Otomatik yenileme bilgisi
- İptal etme yolu
- Privacy Policy + Terms linkleri

Örnek metin:
```
Pratik Tarifler Premium aboneliği:
• Aylık: 49 ₺ — her ay otomatik yenilenir
• Yıllık: 399 ₺ — her yıl otomatik yenilenir
• 7 gün ücretsiz deneme — istediğin zaman iptal edebilirsin
• Ödeme Apple ID hesabına yapılır
• Yenileme dönemin bitiminden 24 saat önce gerçekleşir
• İptal: iOS Ayarlar > Apple ID > Abonelikler

Gizlilik Politikası | Hizmet Şartları
```

---

### 4️⃣ Guideline 4.0 — Design

#### Sebep: "App is a thin web view"
**Çözüm**:
- Native UI kullanıldığını göster
- WebView varsa minimum kullanıldığından emin ol

#### Sebep: "Spam — similar apps from same developer"
**Çözüm**:
- Pratik Tarifler için sorun olmamalı (unique kategori)

---

### 5️⃣ Guideline 5.1.1 — Privacy

#### Sebep: "Privacy Policy URL not accessible"
**Çözüm**:
- `https://pratiktarifler.app/privacy` linkini bir tarayıcıda aç → çalışıyor mu?
- HTML olmalı, PDF değil
- Mobile responsive olmalı

#### Sebep: "Permission usage not justified"
**Çözüm**:
- Info.plist'teki tüm permission açıklamaları **açık ve detaylı** olmalı
- "Bu uygulama X için Y özelliğini kullanır" formatı
- Geliştirme dilinde de yazılı (TR + EN)

Örnek:
```
NSCameraUsageDescription:
"Pratik Tarifler, buzdolabınızın fotoğrafını çekerek malzemeleri 
otomatik tanımak ve size uygun tarifler önermek için kameranızı 
kullanır. Fotoğraflar yalnızca cihazınızda işlenir ve sunucuya 
yüklendikten sonra 24 saat içinde silinir."
```

---

### 6️⃣ Guideline 5.1.2 — Data Collection

#### Sebep: "App Privacy declarations don't match actual data collection"
**Çözüm**:
- `07_METIN_BANKASI/04_app_privacy_data_safety.md` dosyasını yeniden gözden geçir
- Topladığın **tüm** veriyi App Privacy formunda beyan et
- "Used for tracking" kısmına dikkat (Pratik Tarifler için hep "No")

---

### 7️⃣ Guideline 1.5 — Developer Information

#### Sebep: "Support URL not accessible"
**Çözüm**:
- `https://pratiktarifler.app/support` aktif olmalı
- En azından statik bir destek sayfası
- İletişim e-postası: `destek@pratiktarifler.app`

---

## 🆘 EXPEDITED REVIEW İSTEME

Kritik bug fix için Apple "expedited review" (hızlandırılmış) sağlar.

### Ne zaman istenir?
- Güvenlik açığı
- Çökme yaratan bug
- Yasal zorunluluk

### Nasıl istenir?
- [developer.apple.com/contact/app-store/](https://developer.apple.com/contact/app-store/)
- "App Review" → "Request Expedited Review"
- Sebebi detaylı yaz
- Apple ~12-24 saat içinde dönüş yapar

> Sık istenirse Apple gelecekteki istekleri reddedebilir. Sadece gerçek aciller için.

---

## 📊 REJECT İSTATİSTİKLERİ

Apple'ın paylaştığı verilere göre:
- **%30 first submission** reject olur
- En yaygın sebep: **Crashes & Bugs (%24)**
- İkinci sebep: **Privacy issues (%18)**
- Üçüncü: **Metadata (%14)**

> İlk submit'te reject yememek için: 2 hafta TestFlight + tüm dokümantasyon eksiksiz.

---

## 📅 REJECT SONRASI ZAMAN ÇİZELGESİ

```
Reject mesajı geldi
   ↓ 2-4 saat
[Sebebi incele, çözüm hazırla]
   ↓ 1-3 gün
[Yeni build hazırla + test et]
   ↓ 1 gün
[EAS Submit yeniden]
   ↓ 12-48 saat
Yeni review sonucu
```

Toplam: ~3-7 gün ek süre.

---

## ✅ REJECT-PROOF KONTROL LİSTESİ

Submit öncesi:
- [ ] Demo account çalışıyor, Premium aktif
- [ ] Tüm permission açıklamaları detaylı (TR + EN)
- [ ] Privacy Policy + Terms URL'leri canlıda
- [ ] App Privacy formu **doğru ve eksiksiz**
- [ ] Subscription terms ekranda görünüyor
- [ ] Crash-free rate ≥ %99.5 (TestFlight'tan)
- [ ] Screenshot'lar gerçek app ile aynı
- [ ] Promotional text'teki tüm özellikler test edilebilir
- [ ] Sandbox IAP test edildi

---

*Yardım: destek@pratiktarifler.app*
