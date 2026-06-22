# 🧪 Google Play Internal Testing — Hızlı Referans

> Detaylı rehber: `../09_BETA_VE_TEST/02_play_internal.md`

---

## ⚡ HIZLI KOMUTLAR

```bash
# Production AAB build
eas build --profile production --platform android

# Play Store'a submit
eas submit --platform android --latest
```

---

## 🔗 ÖNEMLİ LİNKLER

- Play Console: https://play.google.com/console
- Internal Testing track: Console → Testing → Internal testing
- Play Developer Console policies: https://play.google.com/about/developer-content-policy/

---

## 📱 TESTER OLARAK NASIL KATILIRSIN

1. Tester olarak davet edildikten sonra **Opt-in URL** gelir
2. Linke tıkla → "Become a tester" → "Accept"
3. Play Store uygulamasını aç → arama → Pratik Tarifler
4. Normal yükleme gibi yükle

> Tester olduğunu Play Store'da "(Beta)" rozeti gösterir.

---

## 🔢 TRACK GEÇİŞLERİ

```
Internal Testing  → Closed Testing → Open Testing → Production
   (100 max)         (sınırsız)       (Play'de listeli)   (full)
```

Promotion için: Release sayfasında sağ üstte **"Promote release"** butonu.

---

## 📊 ANDROID VITALS

Play Console → Android vitals → kritik metrikler:
- **User-perceived crash rate** — hedef < %1.09 ("Bad behavior threshold")
- **User-perceived ANR rate** — hedef < %0.47

> Bu eşiklerin üstüne çıkarsa Play Store search ranking düşer!

---

*Detaylar: `../09_BETA_VE_TEST/02_play_internal.md`*
