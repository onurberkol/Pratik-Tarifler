# 📅 6 Haftalık Çalışma Planı

> Geliştiricinin günlük/haftalık ne yapması gerektiği.

---

## 🟢 HAFTA 1 — Onboarding

| Gün | Görev | Süre | Çıktı |
|-----|-------|------|-------|
| 1 | `HANDOFF_REHBERI.md` + `01_proje_ozeti.md` oku | 2h | Genel resim |
| 1 | `02_mimari_diyagram.md` oku | 1h | Teknik anlayış |
| 2 | `02_GELISTIRICI_REHBERLERI/01_yerel_kurulum.md` | 4h | Çalışan dev env |
| 2-3 | Kod yapısını gez (`02_kod_yapisi.md`) | 4h | Kod hakimiyeti |
| 4 | Tüm 17 ekranı simulator'de çalıştır | 3h | UI tanışıklığı |
| 5 | Test scriptlerini çalıştır, hataları çöz | 2h | Stable build |

**Hafta sonu**: Bir 10 dakikalık tour video çek (dev ortamında uygulama nasıl çalışıyor).

---

## 🟡 HAFTA 2 — Backend Kurulum

| Gün | Görev | Süre |
|-----|-------|------|
| 1 | Firebase projesi oluştur (`03_BACKEND/01_firebase_setup.md`) | 3h |
| 1 | Authentication providers etkinleştir | 1h |
| 2 | Firestore + Storage + Functions deploy | 3h |
| 2 | 2500 tarifi seed et | 1h |
| 3 | RevenueCat hesap + product setup (`03_BACKEND/02_revenuecat_setup.md`) | 4h |
| 4 | Sentry kur (`03_BACKEND/04_sentry_setup.md`) | 1h |
| 4 | (Opsiyonel) Stripe web (`03_BACKEND/03_stripe_setup.md`) | 2h |
| 5 | Backend uçtan uca test (login → recipe → IAP sandbox) | 4h |

**Hafta sonu**: Backend infra tam çalışır halde.

---

## 🟠 HAFTA 3 — Store Hesapları ve Materyaller

| Gün | Görev | Süre |
|-----|-------|------|
| 1 | Apple Developer Program kayıt ($99) | 1h |
| 1 | Google Play Developer kayıt ($25) | 1h |
| 2 | App Store Connect uygulama kaydı (`04_APP_STORE/01_apple_rehberi.md`) | 2h |
| 2 | Play Console uygulama kaydı (`05_GOOGLE_PLAY/01_google_rehberi.md`) | 2h |
| 3 | App Privacy + Data Safety doldur (`07_METIN/04_privacy_data_safety.md`) | 3h |
| 4 | Subscription products oluştur (her iki store) | 2h |
| 5 | Tüm metinleri yükle (`07_METIN/01-03`) | 2h |
| 5 | Screenshot ve görselleri yükle (`06_STORE_ASSETS/`) | 4h |

**Hafta sonu**: Submit edilmeye hazır boş kabuk.

---

## 🔵 HAFTA 4 — Beta Test

| Gün | Görev | Süre |
|-----|-------|------|
| 1 | EAS production build (iOS + Android) | 2h |
| 2 | TestFlight Internal grubu, Play Internal track (`09_BETA/01-02`) | 3h |
| 2 | İlk 10 iç tester davet et | 1h |
| 3 | Test senaryolarını çalıştır (`09_BETA/03_test_senaryolari.md`) | 6h |
| 4 | Bug fix sprint | 6h |
| 5 | External Testing açılış, 50+ tester davet | 2h |

**Hafta sonu**: 50+ beta tester aktif kullanıyor.

---

## 🟣 HAFTA 5 — Production Submit

| Gün | Görev | Süre |
|-----|-------|------|
| 1 | Son round bug fix | 6h |
| 2 | Final üretim build | 2h |
| 3 | App Store submit (`04_APP_STORE/01`) — Apple review başlar | 1h |
| 3 | Google Play submit (`05_GOOGLE_PLAY/01`) — Google review başlar | 1h |
| 4-5 | Review bekleniyor — bu sürede pazarlama materyalleri hazırla | — |

**Hafta sonu**: Onay e-postası → Hafta 6 yayına geçiş.

---

## 🟢 HAFTA 6 — Lansman ve İlk Hafta

| Gün | Görev |
|-----|-------|
| 1 (Lansman Günü) | iOS manuel release + Android %10 rollout (`10_YAYIN_SONRASI/01`) |
| 1 | Sosyal medya, basın bültenleri |
| 2-3 | Crash monitoring, hızlı yorum yanıtları |
| 4-5 | İlk metrik analizi (`10_YAYIN_SONRASI/02`) |
| 6-7 | Hafta sonu: ASO optimizasyonu, sürüm 1.0.1 planı |

---

## 📊 BAŞARI KRİTERLERİ

### Hafta 1 sonunda
- [ ] Yerel ortamda uygulama çalışıyor
- [ ] Kod tabanında confident hissediyorsun

### Hafta 2 sonunda
- [ ] Backend tam çalışır halde
- [ ] Sandbox IAP başarılı

### Hafta 3 sonunda
- [ ] Her iki store'da uygulama kaydı tamam
- [ ] Tüm metin ve görseller yüklendi

### Hafta 4 sonunda
- [ ] 50+ beta tester aktif
- [ ] Crash-free ≥ %99
- [ ] Kritik bug yok

### Hafta 5 sonunda
- [ ] Apple ve Google review bekliyor

### Hafta 6 sonunda
- [ ] CANLIDA! 🎉
- [ ] 1.000+ ilk gün indirme hedefi

---

*Plan esnek. Gecikme olursa endişelenme, kalite hızdan önemli.*
