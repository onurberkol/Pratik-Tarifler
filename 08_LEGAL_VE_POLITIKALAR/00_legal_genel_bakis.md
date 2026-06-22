# ⚖️ Yasal Politikalar — Genel Bakış

> Bu klasör, Pratik Tarifler'in **yasal zorunluluğu olan** dokümanlarını içerir. App Store ve Google Play submission için **şart**.

---

## 📋 KLASÖRDEKİ DOSYALAR

| Dosya | Açıklama | Yayın Yeri |
|-------|----------|------------|
| `01_privacy_policy_tr.md` | Gizlilik Politikası (TR) | https://pratiktarifler.app/privacy |
| `02_terms_of_service_tr.md` | Hizmet Şartları (TR) | https://pratiktarifler.app/terms |

---

## 🌐 NEREDE YAYINLANACAK?

### Şart olan public URL'ler
1. **Privacy Policy URL** — App Store + Play Store + uygulama içi
2. **Terms of Service URL** — Premium ekranı + uygulama içi

### Önerilen barındırma
- **Statik HTML olarak** sitenize ekleyin (basit Markdown → HTML dönüşüm)
- **Mobil uyumlu** olmalı
- **HTTPS** zorunlu
- **404 olmamalı** — submit anında erişilebilir olmalı

### Hızlı çözüm
- GitHub Pages (ücretsiz)
- Vercel / Netlify (ücretsiz)
- WordPress sayfası

### Sayfa şablonu (HTML)
```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gizlilik Politikası — Pratik Tarifler</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 720px; 
           margin: 40px auto; padding: 20px; line-height: 1.6; color: #22180F; }
    h1, h2 { color: #E14328; }
    a { color: #3E8E5A; }
  </style>
</head>
<body>
  <!-- privacy_policy.md içeriğini HTML'e dönüştür ve buraya yapıştır -->
</body>
</html>
```

---

## ✅ YASAL UYUMLULUK KONTROL LİSTESİ

### KVKK (Türkiye)
- [ ] Privacy Policy Türkçe yayınlandı
- [ ] Aydınlatma metni mevcut (Privacy Policy içinde)
- [ ] Veri sorumlusu kimliği belirtildi
- [ ] Kişisel veri kategorileri açıklandı
- [ ] İşleme amaçları sayıldı
- [ ] Veri sahibi hakları listelendi
- [ ] Açık rıza mekanizması uygulamada var (onboarding)
- [ ] Veri silme talebi mekanizması (Profil → Hesabımı Sil)
- [ ] VERBİS kaydı (50K+ kullanıcıda zorunlu — başlangıçta gerek yok)

### GDPR (Avrupa Birliği)
- [ ] Legal basis belirtildi (Consent + Contract)
- [ ] Data Protection Officer (DPO) iletişim bilgisi (gerekirse)
- [ ] Cross-border data transfer beyan edildi
- [ ] Veri taşınabilirliği hakkı (Export Data özelliği)
- [ ] 72 saat içinde veri ihlali bildirim taahhüdü

### COPPA (ABD — 13 yaş altı)
- [ ] App Store Connect → Age Rating → 4+ (içerik uygun)
- [ ] Play Console → Target Audience → 13+ seçildi
- [ ] 13 yaş altı kullanıcıdan ebeveyn onayı (mekanizma uygulamada yok, çünkü 13+ hedefliyoruz)

### Apple/Google Politikaları
- [ ] App Privacy formu doldurulmuş ve `privacy_policy.md` ile **birebir uyumlu**
- [ ] Subscription terms uygulamada açık şekilde gösterilir

---

## 🔄 GÜNCELLEME ZORUNLULUĞU

Privacy Policy ve ToS şu durumlarda güncellenmelidir:

1. Yeni veri toplama (yeni feature) → güncelle + kullanıcıyı bilgilendir
2. 3. parti servis değişimi (örn. RevenueCat eklenmesi) → güncelle
3. Şirket adı/adres değişikliği → güncelle
4. Yasal değişiklik (KVKK güncellemesi, vs.) → güncelle

> **Major güncelleme**: uygulamada in-app modal göster, kabul ettir, e-posta gönder.

---

## ⚠️ GERÇEK ŞİRKET BİLGİLERİYLE DOLDUR

Mevcut Privacy Policy ve ToS şablonlardır. Submit öncesi şunları **kendi şirket bilgilerinle güncelle**:

- [ ] Şirket adı / şahıs şirketi adı
- [ ] Vergi numarası / TC kimlik no
- [ ] Şirket adresi
- [ ] İletişim e-postası
- [ ] Yetkili kişi adı

---

## 🆘 HUKUKİ DESTEK

KVKK ve GDPR uyumu için **mutlaka bir avukatla danış**. Bu şablonlar başlangıç noktasıdır, hukuki bağlayıcılığı için yerel hukuk firması incelemeli.

Önerilen firmalar (Türkiye):
- KVKK uzmanı hukuk büroları
- SaaS / mobile app deneyimi olanlar
- Lisans ücreti: ~5.000-15.000 TL (tek seferlik inceleme)

---

*Yardım: destek@pratiktarifler.app*
