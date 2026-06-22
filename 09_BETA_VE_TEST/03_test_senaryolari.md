# ✅ Test Senaryoları — Manuel QA Checklist

> Beta süresince ve her release öncesi bu senaryoları **tüm cihazlarda** test et.

---

## 🎯 CİHAZ MATRİSİ

### iOS
- iPhone 15 Pro Max (en yeni)
- iPhone 13 (orta segment)
- iPhone SE 3rd gen (küçük ekran, eski donanım)
- iPad Pro 12.9" (tablet)

### Android
- Pixel 8 (saf Android, en yeni)
- Samsung Galaxy S23 (popüler OEM)
- Xiaomi Redmi Note 12 (orta segment Türkiye'de yaygın)
- 7" tablet (Samsung Tab A)

### Diller
- TR (varsayılan)
- EN
- AR (RTL test için)

---

## 📋 CORE FLOWS (Her cihazda)

### 🟢 Flow 1: İlk Kurulum
- [ ] Uygulama açılıyor, splash screen görünüyor
- [ ] Onboarding 3 ekran döndürülebiliyor
- [ ] "Hesabım Yok, Devam Et" → anonim giriş çalışıyor
- [ ] "E-posta ile Giriş" → kayıt akışı tamam
- [ ] "Google ile Giriş" → OAuth çalışıyor
- [ ] "Apple ile Giriş" → çalışıyor (sadece iOS)

### 🟢 Flow 2: Mod 1 — Buzdolabı Tarama
- [ ] Ana sayfa → "Evdeki Kalanlarla" → kamera açılıyor
- [ ] Kamera izni isteniyor (ilk kez)
- [ ] Fotoğraf çek → "Analiz ediliyor..." ekranı
- [ ] AI 5-15 saniyede malzemeleri listeliyor
- [ ] Malzeme listesini düzenleyebiliyorsun (ekle/çıkar)
- [ ] "Tarifleri Gör" → eşleşen tarifler listeleniyor
- [ ] Tarif kartına dokun → detay açılıyor

### 🟢 Flow 3: Mod 2 — 1-2 Ek Malzeme
- [ ] "1-2 Ek Malzemeyle" modu seçilebiliyor
- [ ] Eksik malzeme sayısı slider'ı çalışıyor (1, 2, 3)
- [ ] Eksik malzemeler tarif kartında işaretli
- [ ] "Alışveriş Listesine Ekle" → tek dokunuş çalışıyor

### 🟢 Flow 4: Mod 3 — Sınırsız Keşfet
- [ ] Tüm tarifler listeleniyor (lazy loading)
- [ ] Filtre paneli açılıyor (mutfak, öğün, diyet, süre)
- [ ] Filtre uygulanınca liste güncelleniyor
- [ ] Arama çubuğu çalışıyor (Türkçe karakterlerle)
- [ ] "Tariflerim" → favoriler görünüyor

### 🟢 Flow 5: Tarif Detayı
- [ ] Görsel yükleniyor (BlurHash → thumb → full)
- [ ] Malzeme listesi okunabilir
- [ ] Porsiyon ayarlama çalışıyor (2→4→6 kişilik)
- [ ] Adım adım hazırlanış görünüyor
- [ ] Püf noktaları varsa görünüyor
- [ ] "Favoriye Ekle" yıldız işareti çalışıyor
- [ ] "Paylaş" sosyal medya share sheet açıyor

### 🟢 Flow 6: Pişirme Modu
- [ ] "Pişirmeye Başla" → tam ekran açılıyor
- [ ] Büyük yazı tipi (24pt+)
- [ ] Ekran açık kalıyor (sleep'e geçmiyor)
- [ ] Adım sayacı çalışıyor (örn. 1 dk geri sayım)
- [ ] Sayaç bitiminde titreşim/ses
- [ ] "Sonraki Adım" / "Önceki" butonları
- [ ] Sesli komut "sonraki" → çalışıyor (mikrofon izinli)
- [ ] Pişirme bitince "Bitir" → tarif tamamlandı dialog

### 🟢 Flow 7: Premium Satın Alma
- [ ] Profil → Premium kartı görünüyor
- [ ] Aylık 49₺ ve Yıllık 399₺ planları görünüyor
- [ ] Yıllık planda "%32 indirim" rozeti
- [ ] "7 gün ücretsiz deneme" yazısı
- [ ] "Yıllık Premium'u Dene" → IAP popup'ı açılıyor
- [ ] Sandbox account ile satın alma akışı çalışıyor
- [ ] Satın alma sonrası Premium aktif (UI güncellenir)
- [ ] Restore Purchases butonu çalışıyor

### 🟢 Flow 8: Dil Değiştirme
- [ ] Profil → Dil → 13 seçenek görünüyor
- [ ] Dil değişince TÜM metinler değişiyor
- [ ] Arapça/İbranice seçilince UI RTL'ye dönüyor
- [ ] Tarif içerikleri seçili dilde geliyor

### 🟢 Flow 9: Çevrimdışı Erişim
- [ ] Wi-Fi kapat → favoriler hâlâ erişilebilir
- [ ] Çevrimdışıyken yeni tarif arama → "İnternet yok" uyarısı
- [ ] Wi-Fi açınca pending senkronizasyon çalışıyor

### 🟢 Flow 10: Push Bildirim
- [ ] İlk açılışta push izni isteniyor
- [ ] Firebase Console'dan test push gönder → cihazda görünüyor
- [ ] Push'a tıklayınca ilgili tarif/sayfa açılıyor (deep link)

---

## 🚨 EDGE CASES

### Network
- [ ] 3G yavaş bağlantı → loading state'ler net
- [ ] Bağlantı kopması → graceful error
- [ ] API timeout → "Tekrar dene" butonu

### Cihaz
- [ ] Düşük pil → uyarı yok, çalışıyor
- [ ] Bellek baskısı (10+ tarif açık) → çökme yok
- [ ] Telefonu yatay çevir → ya destekleniyor ya kilitli
- [ ] Notch / Dynamic Island alanları → içerik kesilmiyor

### Authentication
- [ ] Google Sign-In iptal → uygulamaya dönüyor
- [ ] Yanlış şifre → açık hata mesajı
- [ ] Hesap silme → tüm veri temizleniyor
- [ ] Multi-device → aynı hesapla 2 cihazda eş zamanlı

### IAP
- [ ] Sandbox satın alma başarılı
- [ ] Sandbox iptal → Premium 24 saat içinde kalkıyor
- [ ] Refund senaryosu → premium status güncelleniyor
- [ ] 7 gün deneme bitince otomatik ücretlendirme

---

## 📊 PERFORMANS KRİTERLERİ

| Metrik | Hedef |
|--------|-------|
| Soğuk başlangıç | < 3 saniye |
| Tarif listesi yükleme | < 2 saniye |
| Tarif detayı açılma | < 1 saniye |
| Görsel ilk render | < 500ms (BlurHash) |
| Görsel tam yükleme | < 2 saniye |
| AI buzdolabı analizi | < 15 saniye |
| Crash-free rate | ≥ %99.5 |
| Memory usage (idle) | < 150 MB |

---

## 🐛 BUG RAPORLAMA ŞABLONU

```markdown
**Cihaz**: iPhone 13, iOS 17.2
**Uygulama Sürümü**: 1.0.0 (Build 12)
**Dil**: Türkçe
**Premium**: Hayır

**Yapılan**:
1. Mod 1'e gir
2. Kamera ile foto çek
3. "Tarifleri Gör"e bas

**Beklenen**: Tarif listesi açılmalı
**Olan**: Uygulama çöküyor

**Crash log (Sentry)**: [link]
**Ekran görüntüsü/video**: [link]

**Sıklık**: Her seferinde / Bazen / Bir kez
```

---

*Yardım: destek@pratiktarifler.app*
