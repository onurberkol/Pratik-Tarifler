# 🐛 Sentry — Crash Reporting Kurulumu

> Sentry, üretimde çöken kullanıcıları, hangi satırda ne oldu detayıyla görmeni sağlar. Firebase Crashlytics'e ek olarak (ya da yerine) kullanılır.

**Tahmini süre:** 30 dakika.

---

## 1️⃣ SENTRY HESABI

→ [sentry.io](https://sentry.io/) — Developer plan ücretsiz (5K event/ay), Team plan $26/ay

### Proje oluştur
- **Platform**: React Native
- **Project name**: pratik-tarifler

---

## 2️⃣ DSN AL

Proje oluşturulunca Sentry sana **DSN** verir:
```
https://[publicKey]@[host]/[projectId]
```

`.env` dosyasına ekle:
```env
EXPO_PUBLIC_SENTRY_DSN=https://xxxxxxx@o12345.ingest.sentry.io/67890
```

---

## 3️⃣ SDK ZATEN KURULU

`package.json`'da `@sentry/react-native` var. Initialize kodu `src/App.tsx`'te:

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: false,  // dev'de göndermesin
  debug: __DEV__,
  tracesSampleRate: 0.2,  // %20 transaction
  beforeSend(event) {
    // PII (kişisel veri) temizle
    if (event.user) delete event.user.email;
    return event;
  }
});
```

---

## 4️⃣ SOURCE MAPS UPLOAD

Üretimde stack trace'in okunabilir olması için source map yüklemen lazım.

### iOS build'de otomatik
`ios/sentry.properties` oluştur (template `.example` olarak var):
```properties
defaults.org=pratik-tarifler
defaults.project=pratik-tarifler
auth.token=YOUR_SENTRY_AUTH_TOKEN
```

Auth token: Sentry → Settings → Account → API → Auth Tokens

### Android
`android/sentry.properties` aynı yapı.

### EAS Build'de
`eas.json`'a env eklenmiş:
```json
"production": {
  "env": {
    "SENTRY_AUTH_TOKEN": "$SENTRY_AUTH_TOKEN"
  }
}
```

EAS secret'ına set et:
```bash
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value xxx
```

---

## 5️⃣ TEST

```typescript
// Bir butona bağla
Sentry.captureException(new Error('Test error'));
// veya
throw new Error('Real crash test');
```

Sentry dashboard'da event'i görmeli (~1 dakika gecikme).

---

## 6️⃣ ALERT KURALLARI

Sentry → Project → Alerts → "+ Create Alert":

### Kritik Alert 1: Çökme oranı
- **When**: > 1% of sessions crash in 1 hour
- **Action**: Slack notification + Email

### Kritik Alert 2: Yeni hata
- **When**: New unique error appears
- **Action**: Email to dev team

### Kritik Alert 3: Performance
- **When**: P75 transaction > 3s
- **Action**: Slack

---

## 7️⃣ FIREBASE CRASHLYTICS İLE BİRLİKTE

İkisini paralel çalıştırabilirsin:
- **Crashlytics**: Hızlı genel bakış, Firebase Analytics ile birleşik
- **Sentry**: Detaylı stack trace, breadcrumbs, performance

Pratik Tarifler'de **ikisini de** kullanmanı öneriyoruz — biri ücretsiz, diğeri ücretsiz tier'da yeterli.

---

*Yardım: destek@pratiktarifler.app*
