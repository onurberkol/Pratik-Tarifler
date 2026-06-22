# 📧 E-posta Şablonları — Firebase Auth (TR)

> Firebase Authentication otomatik e-postaları için Türkçe şablonlar.

---

## 1️⃣ E-POSTA DOĞRULAMA

**Subject**: Pratik Tarifler — E-posta adresini doğrula

```html
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; color: #22180F; background: #FFFBF5; padding: 40px;">
  <table align="center" style="max-width: 480px; background: #FFFFFF; border-radius: 16px; padding: 32px;">
    <tr><td>
      <h1 style="color: #E14328; font-size: 24px; margin: 0 0 16px;">Pratik Tarifler</h1>
      <h2 style="font-size: 18px; margin: 0 0 12px;">E-posta adresini doğrula</h2>
      <p>Merhaba!</p>
      <p>Pratik Tarifler hesabını oluşturduğun için teşekkürler. Devam etmek için aşağıdaki butona tıklayarak e-posta adresini doğrula:</p>
      <a href="%LINK%" style="display: inline-block; background: #E14328; color: #FFF; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 20px 0;">E-posta Adresini Doğrula</a>
      <p style="font-size: 13px; color: #7D6E5C;">Eğer butona tıklayamıyorsan, bu linki tarayıcına kopyala:<br>%LINK%</p>
      <hr style="border: none; border-top: 1px solid #F0E7D8; margin: 24px 0;">
      <p style="font-size: 13px; color: #7D6E5C;">Bu e-postayı yanlışlıkla aldıysan görmezden gelebilirsin.</p>
      <p style="font-size: 13px; color: #7D6E5C;">— Pratik Tarifler ekibi<br>destek@pratiktarifler.app</p>
    </td></tr>
  </table>
</body>
</html>
```

---

## 2️⃣ ŞİFRE SIFIRLAMA

**Subject**: Pratik Tarifler — Şifre sıfırlama isteği

```html
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; color: #22180F; background: #FFFBF5; padding: 40px;">
  <table align="center" style="max-width: 480px; background: #FFFFFF; border-radius: 16px; padding: 32px;">
    <tr><td>
      <h1 style="color: #E14328; font-size: 24px; margin: 0 0 16px;">Pratik Tarifler</h1>
      <h2 style="font-size: 18px; margin: 0 0 12px;">Şifreni sıfırla</h2>
      <p>Pratik Tarifler hesabın için şifre sıfırlama isteği aldık.</p>
      <p>Yeni bir şifre belirlemek için aşağıdaki butona tıkla:</p>
      <a href="%LINK%" style="display: inline-block; background: #E14328; color: #FFF; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 20px 0;">Şifremi Sıfırla</a>
      <p style="font-size: 13px; color: #7D6E5C;">Bu link 1 saat içinde geçersiz olur. Sen istemediysen bu e-postayı görmezden gelebilirsin — hesabın güvende.</p>
      <hr style="border: none; border-top: 1px solid #F0E7D8; margin: 24px 0;">
      <p style="font-size: 13px; color: #7D6E5C;">— Pratik Tarifler ekibi<br>destek@pratiktarifler.app</p>
    </td></tr>
  </table>
</body>
</html>
```

---

## 3️⃣ E-POSTA DEĞİŞTİRME

**Subject**: Pratik Tarifler — E-posta adresi değişikliği

```html
<p>Pratik Tarifler hesabının e-posta adresinin değiştirilmesi istendi.</p>
<p>Bu işlemi onaylamak için aşağıdaki butona tıkla:</p>
<a href="%LINK%">E-posta Değişikliğini Onayla</a>
```

---

## 4️⃣ HOŞ GELDIN E-POSTASI (Custom — Cloud Function)

**Subject**: 🎉 Pratik Tarifler'e hoş geldin!

```
Merhaba [İsim],

Pratik Tarifler ailesine katıldığın için teşekkürler! 🍳

Senin için hazırladıklarımız:
✓ 2500+ özenle seçilmiş tarif
✓ 14 dünya mutfağı
✓ 3 akıllı keşif modu
✓ 13 dilde tarif desteği

💡 İPUCU: Hemen ilk Mod 1 buzdolabı taramanı yap, 
yapay zekanın seni nasıl şaşırttığını gör!

Bir sorun yaşarsan: destek@pratiktarifler.app
Web: https://pratiktarifler.app

— Pratik Tarifler ekibi
```

---

## 5️⃣ HESAP SİLİNDİ E-POSTASI (KVKK Uyumlu)

**Subject**: Pratik Tarifler — Hesabın silindi

```
Merhaba,

Pratik Tarifler hesabının silinmesi onaylandı. Bu işlem geri alınamaz.

Silinen veriler:
✗ Hesap bilgileri (e-posta, kullanıcı adı)
✗ Favori tarifler
✗ Buzdolabı geçmişi
✗ Premium abonelik durumu
✗ Tüm kişisel veriler

⚠️ Önemli: Premium aboneliğin varsa, Apple/Google'dan ayrıca iptal etmelisin:
• iOS: Ayarlar > Apple ID > Abonelikler
• Android: Play Store > Hesap > Abonelikler

Tekrar görüşmek üzere — istediğin zaman yeni hesap açabilirsin.

— Pratik Tarifler ekibi
destek@pratiktarifler.app
```

---

## 6️⃣ FIREBASE CONSOLE'A YÜKLEME

Firebase Console → Authentication → Templates → her şablonu Türkçe'ye çevir:
- Email address verification → 1️⃣ şablonu
- Password reset → 2️⃣ şablonu
- Email address change → 3️⃣ şablonu

İngilizce versiyonları İngilizce dil seçen kullanıcılar için aynı yerde Apple Sign-In'le otomatik gelir.

---

*Diğer diller için: src/locales/{lang}.json'daki "emails" key'ini güncelle*
