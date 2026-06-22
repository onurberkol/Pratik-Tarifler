# 🧪 BETA TESTING PROGRAMI — Pratik Tarifler

> Lansman'dan **3 hafta önce** başlayan, **2 hafta süren** beta program.  
> Hedef: 100 aktif beta tester, 50+ bug raporu, ürün %95 sağlam hale getirilsin.

---

## 🎯 BETA HEDEFLERİ

### Bulgu Hedefleri
- 🐛 50+ bug raporu
- 💡 30+ özellik talebi
- 🎨 20+ UX iyileştirme önerisi
- 📊 D7 retention %30+
- ⭐ Average satisfaction 4.0+/5

### Validation Hedefleri
- [ ] 3 mod akışı net mi? (kullanıcı kafası karışmıyor mu?)
- [ ] Vision API doğruluğu yeterli mi? (>%70 accuracy)
- [ ] Premium upgrade dönüşüm oranı sağlam mı? (>%5)
- [ ] Crash-free rate %99+
- [ ] App Store ratings sağlamasını yapan kalite seviyesi

---

## 👥 BETA AŞAMALARI

### 🟠 AŞAMA 1: ALPHA (Closed, sadece ekip)
**Süre:** 1 hafta  
**Kapasite:** 5-10 kişi (ekip + yakın çevre)

**Aktiviteler:**
- TestFlight Internal Testing
- Play Console Internal Testing
- Build aldıkça günde 1-2 kez test
- Slack/WhatsApp grubunda anında feedback
- Critical bug → 24 saat içinde fix

**Çıkış kriteri:**
- ✅ Sıfır kritik crash
- ✅ Tüm 3 mod end-to-end çalışıyor
- ✅ Subscription flow test edildi (sandbox)
- ✅ 13 dilden 3'ü manuel kontrol edildi

### 🟡 AŞAMA 2: CLOSED BETA (Davetli)
**Süre:** 2 hafta  
**Kapasite:** 50-100 kişi

**Tester Profili:**
- 30 kişi mutfak meraklısı (hedef persona 1)
- 20 kişi pratik aramayan (hedef persona 2)
- 20 kişi tech-savvy (early adopter)
- 30 kişi karma demografik

**Davetiye Kanalları:**
1. **Email waitlist** → en sadık 50 kişi
2. **Sosyal medya** → "Beta tester ol" Instagram story
3. **Slack/Discord grupları** → tech community
4. **Üniversite klüpleri** → gastronomi + bilgisayar müh.
5. **Beta listeleri**: BetaList, Product Hunt Ship

**Onboarding:**
- TestFlight invite linki
- Welcome email (beta groups, ne yapılacak, nasıl bildir)
- Slack/Discord grubu (beta-testers kanalı)
- Bonus: Bedava 6 ay Premium kullanım için

**Çıkış kriteri:**
- ✅ Crash-free rate %99+
- ✅ Top 10 bug fix edildi
- ✅ Top 5 UX feedback uygulandı
- ✅ Subscription gerçek ödemeyle test edildi

### 🟢 AŞAMA 3: OPEN BETA (İsteğe bağlı)
**Süre:** 1 hafta  
**Kapasite:** Sınırsız (Play Console)

**Aktiviteler:**
- Play Console "Open testing" track
- Apple TestFlight public link
- Mass feedback → hızlı iterate

> **Not**: Open beta opsiyonel. Eğer closed beta'da yeterli veri toplandıysa atla.

---

## 📋 BETA TESTER BRİEFİNG

### Hoşgeldin Email (Template)

```
Konu: 🎉 Pratik Tarifler Beta'sına Hoşgeldin!

Merhaba [İsim],

Pratik Tarifler Beta programına katıldığın için teşekkürler! 🦁

⏰ NE ZAMAN: Beta, 2 hafta sürecek. [TARİH] - [TARİH]

📲 NASIL KATILACAĞIN:

iOS:
1. iPhone'unda TestFlight'ı App Store'dan indir (zaten yoksa)
2. Bu davetiye linkine tıkla: [TESTFLIGHT LINK]
3. Pratik Tarifler'i indir, kullanmaya başla

Android:
1. Bu linke tıkla: [PLAY CONSOLE BETA LINK]
2. "Become a tester" tıkla
3. Play Store'dan indir (beta etiketiyle gelecek)

🎯 NE YAPMANI İSTİYORUZ:

✅ Uygulamayı 2 hafta boyunca normal kullan
✅ 3 modu da dene (Buzdolabı / 1-2 Ek / Sınırsız Keşif)
✅ En az 5 tarif denemeye çalış
✅ Bulduğun bug'ları ve önerileri bize bildir

🐛 NASIL BİLDİRECEKSİN:

A) Slack grubunda: [SLACK INVITE]
B) Email: beta@pratiktarifler.app
C) In-app: Ayarlar → Geri Bildirim

📞 SORU/SORUN için: WhatsApp [NUMARA]

🎁 ÖDÜLÜN:

- Beta tamamlandığında **6 ay ücretsiz Premium**
- Top 10 tester için ekstra **çekiliş**: AirPods Pro 🎧
- İlk 3 detaylı feedback verene **özel kıyafetli mucut hediye**

🔒 GİZLİLİK:

Beta ürünü kimseyle paylaşma. Henüz public lansman değil!

Teşekkürler ve iyi tarifler dileriz!
Pratik Tarifler Ekibi
```

---

## 🐛 BUG REPORTING SİSTEMİ

### In-App Feedback Mekanizması

`/screens/FeedbackScreen.tsx` ekranı:
- Screenshot otomatik ekli (current screen)
- Cihaz bilgisi otomatik ekli
- Kategori dropdown: Bug | Suggestion | Other
- Açıklama text area
- Email (otomatik dolu)
- Submit → Firestore `feedback` koleksiyonu + Slack notification

### Severity Sınıflandırması

| Severity | Tanım | Yanıt Süresi |
|----------|-------|--------------|
| 🔴 **P0 — Critical** | Crash, veri kaybı, ödeme bozuk | 4 saat |
| 🟠 **P1 — High** | Major feature çalışmıyor | 24 saat |
| 🟡 **P2 — Medium** | Minor feature, UX kötü | 3 gün |
| 🟢 **P3 — Low** | Cosmetic, nice-to-have | Backlog |

### Bug Workflow

```
Feedback gelir → Slack #beta-bugs kanalı
   ↓
Triage (severity belirle)
   ↓
GitHub Issue oluştur
   ↓
P0/P1: Hemen branch aç, fix yaz, test, deploy hot fix
P2/P3: Sprint backlog'a ekle
   ↓
Fix deploy → testerlara duyur: "Şu bug fix edildi, tekrar dener misin?"
```

---

## 📊 BETA METRİKLERİ

### Günlük Takip Edilecekler

**TestFlight + Play Console raporlarından:**
- DAU (daily active users)
- Crash count
- Average session length
- Top crashed screens
- Subscription flow drop-off

**Firebase Analytics'ten:**
- Funnels: signup → first recipe view → favorite
- Mod kullanım oranı (Mod 1 vs 2 vs 3)
- Pantry scan success rate
- Feature adoption (cook mode, shopping list)

**Slack/Email feedback'ten:**
- Total feedback count
- By category (bug/suggestion/other)
- By severity
- By user (tekrarlayan vs unique)

### Haftalık Beta Review

Her Pazartesi:
- 📊 Metric dashboard güncellemesi
- 🐛 Top 10 bug listesi
- 💡 Top 10 suggestion listesi
- 🎯 Sprint planning (önümüzdeki hafta hangi fix'ler)
- 📣 Tester'lara progress update email

---

## 🎮 GAMIFICATION (engagement için)

### Beta Bayraklı Görevler

| Görev | Ödül |
|-------|------|
| İlk tarif keşfet | 🏅 "Explorer" badge |
| 5 farklı tarif dene | 🏅 "Foodie" badge |
| Buzdolabı fotoğrafı çek | 🏅 "AI Pioneer" badge |
| 3 mod'u da dene | 🏅 "Triple Threat" badge |
| 10 bug raporla | 🏅 "Bug Hunter" badge |
| 30 gün boyunca aktif | 🏅 "Loyal Tester" + AirPods çekiliş hakkı |

### Beta Leaderboard
Slack'te haftalık:
- En çok feedback veren 5
- En çok bug bulan 3
- En aktif kullanıcı 5

> Ödüller: Amazon hediye kartı, ekstra Premium ay, Pratik Tarifler t-shirt

---

## 📱 TESTFLIGHT KURULUMU (iOS)

### Adım adım

```bash
# 1. Build hazırla
cd ios && fastlane release_beta

# 2. Auto-upload to TestFlight (fastlane Snapfile ile)
fastlane pilot upload \
  --ipa "PratikTarifler.ipa" \
  --skip_waiting_for_build_processing false
```

### Manuel adımlar (App Store Connect)
1. **My Apps** → Pratik Tarifler → **TestFlight**
2. **Internal Testing** group oluştur (max 100 user, App Store Connect üyeleri)
3. **External Testing** group oluştur (max 10.000 user, public link)
4. Build seç → Add to group
5. Test bilgileri:
   - **What to Test**: "Bu sürümde 3 mod akışını tamamen test et, lütfen pantry scan özelliğini de dene"
   - **App Description**: kısa açıklama
   - **Feedback Email**: beta@pratiktarifler.app
6. **Public Link** oluştur → email ile paylaş

### Apple Beta Review
External testing builds Apple tarafından **basit review**'dan geçer (1-3 gün). Internal hemen.

---

## 🤖 PLAY CONSOLE KURULUMU (Android)

### Internal Testing (hemen, no review)
1. Play Console → Pratik Tarifler → **Release** → **Internal testing**
2. **Tester list** oluştur (email adresleri)
3. Bundle (.aab) upload
4. Release notes ekle
5. **Save** → emails'e otomatik link gönderilir

### Closed Testing (1-2 saat review)
1. **Closed testing** → Create release
2. Test tracks: alpha, beta
3. Bundle upload
4. **Countries**: Türkiye + diğer
5. Tester list: max 100 (alpha), 10000 (beta)
6. **Open URL**: opt-in link
7. Review → live

### Open Testing
- Herkese açık
- "Become a tester" → Play Store'da görünür
- Genelde lansman'dan 1 hafta önce

---

## 📞 TESTER COMMUNICATION KANAL

### Slack/Discord Sunucusu

**Kanallar:**
- `#duyurular` — sadece ekip yazar (yeni build, fix duyuruları)
- `#bugs` — bug raporları
- `#suggestions` — özellik talepleri
- `#general` — sohbet, soru-cevap
- `#testimonials` — pozitif feedback'lar (lansman için içerik)

**Kurallar:**
- İlk gün etiket kuralları paylaş
- Yapıcı feedback teşvik et
- Olumsuz feedback'leri savunmaya geçmeden teşekkür et
- "Bunu nasıl düzelttim?" şeffaf paylaş

### Email Cadence

| Hafta | Email |
|-------|-------|
| 0 | Welcome + onboarding |
| 1 (sonu) | Progress update + ne fix ettik |
| 2 (orta) | Hatırlatma + survey link |
| 2 (sonu) | Beta tamamlandı + ödül kodu + lansman daveti |

---

## 📝 BETA EXIT SURVEY

```
1. Genel olarak Pratik Tarifler'i nasıl puanlarsın? (1-5)
2. En çok hangi modu kullandın? (Mod 1/2/3)
3. AI fotoğraf tanıma doğruluğu sence nasıl? (1-5)
4. Premium'a geçmek ister misin? (Evet/Hayır/Belki)
   - Hayır ise: Neden?
5. En sevdiğin özellik?
6. En sinir bozucu / kötü yön?
7. Bir özellik eksik olsa o ne olur?
8. Pratik Tarifler'i arkadaşına önerir misin? (NPS 0-10)
9. Genel yorumun?
```

**NPS hedefi**: >40 (mükemmel: >70)

---

## 🆘 BETA AŞAMASI BAŞARISIZ SENARYOSU

### Eğer < 30 aktif tester
- Daha agresif outreach: BetaList, Product Hunt Ship, founder ağı
- Bonus artır: 6 ay → 1 yıl Premium

### Eğer crash rate > %5
- Beta'yı 1 hafta uzat
- Closed group 50 → 20'ye düşür
- P0/P1 bug'ları sıfırla

### Eğer NPS < 20
- Ürün hazır değil — lansman ertele
- Top 3 şikayeti adresle (genelde: UX confusing, slow, missing feature)
- 2 hafta sonra 50 yeni tester'la tekrar dene

---

🦁 **BETA'NIN AMACI**: Lansman'da "uy ne kötü uygulamaymış" değil "uy bu uygulama mükemmel!" dedirtmek. Beta'da kötü olmak NORMAL. Lansman'da kötü olmak SON.

📊 İyi bir beta = sonraki 100K download'un temeli.
