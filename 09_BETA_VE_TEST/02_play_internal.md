# 🧪 Google Play — Internal Testing Rehberi

> Google Play'in TestFlight muadili. **3 farklı test track'i** var: Internal → Closed → Open. Sırasıyla kullan.

---

## 📋 TEST TRACK'LERİ

| Track | Test Sayısı | Onay Süresi | Kim Görür? |
|-------|-------------|-------------|------------|
| **Internal Testing** | Maks 100 | ~1 saat | Sadece davet edilenler |
| **Closed Testing** | Sınırsız | ~3 gün | Sadece davet edilen email listesi |
| **Open Testing** | Sınırsız | ~7 gün | Play Store'da listelenir, herkes katılabilir |
| **Production** | Sınırsız | 2-7 gün | Tam yayın |

---

## 1️⃣ INTERNAL TESTING TRACK

### 1.1 — Build yükle
```bash
eas build --profile production --platform android
# AAB dosyası üretilir
```

### 1.2 — Play Console → Testing → Internal testing → "Create new release"

- **App Bundle yükle**: AAB dosyasını sürükle-bırak
- **Release name**: `1.0.0-internal-1`
- **Release notes** (TR):
  ```
  Internal test sürümü 1
  • Tüm temel akışlar test edilebilir
  • Premium IAP sandbox modunda
  • Bilinen sorunlar: yok
  ```

### 1.3 — "Testers" sekmesi
- **Create email list** → "Internal QA"
- Tester e-postalarını ekle (maks 100)
- **Opt-in URL**'i kopyala — testers bu linkten katılır

### 1.4 — "Save" → "Review release" → "Start rollout"

> Internal track'te onay süreci ~1 saat, bazen anlık.

---

## 2️⃣ CLOSED TESTING TRACK

> Internal'da hata yoksa Closed'a geç. Sınırsız test kullanıcısı.

### 2.1 — Testing → Closed testing → "Create new release"
- Aynı AAB veya yeni build
- Tester listesi: daha geniş — beta tester'lar, dış kullanıcılar

### 2.2 — Promotion: Internal'dan Closed'a
Internal track'te yayında olan release'i sağ üst "Promote" → "Closed testing"

---

## 3️⃣ OPEN TESTING TRACK

> En geniş test. Play Store'da uygulaman "Early Access" rozetiyle görünür.

### Avantajları
- Play Store ranking sinyali (Google önemli kullanıcı eğilimini gözler)
- Geniş feedback havuzu
- Production'a geçmeden önce son test

### Setup
- Aynı süreç, sadece track olarak Open Testing seç
- Play Store sayfasında **"Join the beta"** butonu görünür

---

## 4️⃣ TESTERS — DETAYLI

### License Testing (IAP Test İçin)
Play Console → Setup → License testing:
- Tester e-postalarını ekle (max 400)
- Bu kullanıcılar IAP'leri **gerçek para harcamadan** test eder
- Cart'a `LICENSED_TEST_PURCHASED` simülasyonu otomatik

### Test Instructions Email
Davetli tester'lara şu mesajı gönder:
```
Merhaba!

Pratik Tarifler uygulamasının beta sürümünü test etmek için seni davet ediyoruz! 🍳

📥 NASIL KATILIRSIN:
1. Şu linke tıkla: [OPT-IN URL]
2. "Become a tester" butonuna bas
3. Play Store'dan uygulamayı yükle (normal Play Store gibi)

🧪 TEST ETMENİ İSTEDİĞİMİZ:
✓ Buzdolabı tarama (Mod 1) — kamera izni
✓ Tarif arama ve filtreleme (Mod 3)
✓ Tarif detayı + Pişirme Modu
✓ Favori ekle/çıkar
✓ Dil değiştir (TR/EN)
✓ Premium satın alma (sahte ödeme, gerçek para gitmez)

📝 GERİ BİLDİRİM:
Play Store sayfasında "Send feedback" butonu var.
Veya: destek@pratiktarifler.app

Teşekkürler! 🙏
```

---

## 5️⃣ STAGED ROLLOUT — PRODUCTION'A GEÇİŞ

Test bittikten sonra Production'a aşamalı geç:

```
Day 0: 10% rollout → 24 saat izle
Day 1: Crash-free rate ≥ %99 ise → 25%
Day 2: → 50%
Day 4: → 100%
```

Eğer kritik sorun çıkarsa: **"Halt rollout"** ile durdur, hotfix yayınla, tekrar başla.

---

## 6️⃣ TEST METRİKLERİ TAKİP

Play Console → Statistics:
- **Daily active users (DAU)** — günlük aktif test eden
- **Crashes** — Android Vitals → crash rate
- **ANRs** (App Not Responding) — kritik metrik

Firebase Analytics ile cross-check:
- D1, D7, D30 retention
- Funnel: install → first scan → first recipe view → premium upgrade

---

## ⚠️ YAYGIN HATALAR

### "Bundle was uploaded but is not yet active"
- ~10-30 dakika işleme süresi normal
- 1 saatten fazla bekliyorsa Play Console destek

### "Tester can't find the app"
- Tester yanlış Google hesabıyla giriş yapmış olabilir
- Opt-in URL'i mutlaka açmış olmalı (sadece davetiye yeterli değil)

### "IAP purchase fails"
- License testing listesine eklendi mi?
- AAB internal track'te aktif mi?

---

## ✅ PLAY TESTING TAMAM KONTROL LİSTESİ

- [ ] Internal track'te en az 5 tester aktif test etti
- [ ] Closed track'te 20+ tester
- [ ] (Opsiyonel) Open track açıldı, 50+ kullanıcı
- [ ] Crash-free rate ≥ %99
- [ ] IAP testleri başarılı (aylık + yıllık)
- [ ] 2 hafta test süresi tamamlandı
- [ ] Kritik bug'lar yok

➡️ Hepsi tamamsa → **Production submit**.

---

*Yardım: destek@pratiktarifler.app*
