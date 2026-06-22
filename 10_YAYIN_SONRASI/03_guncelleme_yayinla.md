# 🔄 Güncelleme Yayınlama Rehberi

> 1.0.0'dan sonra yeni sürüm nasıl yayınlanır? Bug fix mi, feature release mi, breaking change mi?

---

## 📐 SEMVER (Semantic Versioning)

`MAJOR.MINOR.PATCH` formatı:

| Sürüm | Anlam | Örnek |
|-------|-------|-------|
| **PATCH** (1.0.0 → 1.0.1) | Bug fix, küçük düzeltme | Sayaç hatası |
| **MINOR** (1.0.1 → 1.1.0) | Yeni özellik, geriye uyumlu | Dark mode |
| **MAJOR** (1.1.0 → 2.0.0) | Breaking change | Yeni mimari, eski cihaz desteği kalkıyor |

---

## 🔄 GENEL GÜNCELLEME AKIŞI

```
1. Branch oluştur (feature/bugfix)
2. Kod yaz, test et
3. PR aç, review al, merge
4. app.config.ts → version artır
5. EAS Build
6. TestFlight + Internal Testing
7. Beta testi (1 hafta önerilen)
8. Production submit
9. Onay sonrası yayınla
```

---

## 1️⃣ KOD GÜNCELLEMESİ

### Branch Strateji
```bash
# Bug fix
git checkout -b fix/sayac-hatasi
# ... değişiklik
git commit -m "fix: pişirme modunda sayaç bitince titreşim çalmıyordu"

# Feature
git checkout -b feature/dark-mode
git commit -m "feat: karanlık mod desteği eklendi"

# Major
git checkout -b major/v2-redesign
```

### Version Numarasını Güncelle

`app.config.ts`:
```typescript
version: "1.0.1",  // PATCH için
// veya
version: "1.1.0",  // MINOR için
```

> iOS `buildNumber` ve Android `versionCode` EAS'ın `autoIncrement` ile otomatik artar.

---

## 2️⃣ KAPSAMLI TEST

### Patch sürümler
- Düzeltilen bug'ı doğrulayan unit test ekle
- Manuel test: sadece düzeltme yapılan alan
- 24 saat TestFlight/Internal Testing

### Minor sürümler
- Tüm core flows test edilmeli (`09_BETA_VE_TEST/03_test_senaryolari.md`)
- 1 hafta beta testi (TestFlight Public Link + Play Open Testing)

### Major sürümler
- Yeni cihazlarda + eski cihazlarda test
- Eski veri ile uyumluluk testi
- 2-3 hafta açık beta

---

## 3️⃣ "WHAT'S NEW" METİNLERİ

Her sürüm için **HER İKİ STORE'da** güncelleme notları:

### Patch (1.0.1)
```
🐛 Hata düzeltmeleri ve performans iyileştirmeleri

• Bazı cihazlarda çökme sorunu giderildi
• Pişirme modunda sayaç hatası düzeltildi
• Görseller daha hızlı yükleniyor

Geri bildirim: destek@pratiktarifler.app
```

### Minor (1.1.0)
```
🎉 Yeni özellikler

• Karanlık mod desteği — Profil > Görünüm
• Sesli pişirme komutları: "sonraki", "tekrar"
• 200+ yeni dünya mutfağı tarifi
• Performans iyileştirmeleri

Detaylar: pratiktarifler.app/blog/v1-1
```

### Major (2.0.0)
```
🚀 Yepyeni Pratik Tarifler!

✨ Tamamen yenilenmiş arayüz
🤖 Daha akıllı AI: %40 daha doğru tanıma
📸 Birden fazla foto ile tarama
👥 Aile hesabı (4 kişiye kadar)
🎯 Kişiselleştirilmiş öneriler

[Diğer kritik notlar]

Detaylar: pratiktarifler.app/v2
```

> Metin bankası: `../07_METIN_BANKASI/01_app_store_tr.md` → "Future Version Templates"

---

## 4️⃣ BUILD VE SUBMIT

### Adım Adım
```bash
# 1. Final kontrolleri
npm run typecheck && npm run lint && npm test

# 2. iOS build + TestFlight auto-submit
eas build --profile production --platform ios --auto-submit

# 3. Android build
eas build --profile production --platform android

# 4. Android AAB'yi Play Console'a yükle (manuel veya CLI)
eas submit --platform android --latest
```

### Production'a Submit
- iOS: TestFlight'tan App Store'a "Submit for Review"
- Android: Internal/Open Testing → Production track "Promote"

---

## 5️⃣ ROLLOUT STRATEJİSİ

### iOS
- "Manually release this version" seç
- Onaylandıktan sonra **manuel** release
- Saat: 11:00 (Avrupa) — peak indirme saati değil, yangın varsa müdahale şansı

### Android
| Sürüm Türü | İlk Rollout |
|------------|-------------|
| Patch (kritik bug fix) | %50 → 24h → %100 |
| Patch (normal) | %20 → %50 → %100 (5 gün) |
| Minor | %10 → %25 → %50 → %100 (1 hafta) |
| Major | %5 → %10 → %25 → %50 → %100 (2 hafta) |

---

## 6️⃣ ROLLBACK PROTOKOLU

Kötü güncelleme yayınlandıysa:

### Android (kolay)
1. Play Console → Production → "Halt rollout"
2. Önceki sürüm aktif kalır
3. Hotfix yayınla, yeniden başla

### iOS (zor)
- Apple "rollback" desteklemez
- Çözüm: **Hızlıca 1.0.2** sürümü yayınla (1.0.0'da geri dönüş yapan kodla)
- Expedited Review iste (Apple Developer destek formu)

### Önleyici
- **Feature flags** kullan (Firebase Remote Config)
- Yeni özelliği kapatabilir hâlde tut → sorun çıkarsa server'dan kapat

---

## 7️⃣ SÜRÜM TARİHÇESİ

Public bir CHANGELOG tut: `pratiktarifler.app/changelog`

```markdown
# Pratik Tarifler — Sürüm Notları

## v1.1.0 — 15 Temmuz 2026
### Eklendi
- Karanlık mod desteği
- Sesli komut: "sonraki", "tekrar"
- 200+ yeni tarif

### Düzeltildi
- Sayaç titreşim sorunu

## v1.0.1 — 25 Haziran 2026
### Düzeltildi
- iOS 17.4'te çökme
- Türkçe çevirilerde küçük hatalar

## v1.0.0 — 12 Haziran 2026
🎉 İlk yayın!
```

---

## ⚠️ YAYGIN HATALAR

### "Build numarası aynı kalıyor"
- `eas.json` → production profile'da `autoIncrement: true` mu?
- Manuel build için: `app.config.ts` → `buildNumber` ve `versionCode` artır

### "Eski sürüm hâlâ kullanıcılarda"
- iOS: Otomatik update kapalı olan kullanıcı var
- Çözüm: in-app banner "Yeni sürüm var, güncelle"
- Force update için: Remote Config flag, eski versiyon engellenir

### "Production rollback gerekti ama yapamıyorum"
- Önceki AAB'yi Play Console'da arşivden geri yayınlayabilirsin (Android)
- iOS'ta sadece ileri sürüm — eski sürümü tekrar yükleyip yeni build number ile gönder

---

*Yardım: destek@pratiktarifler.app*
