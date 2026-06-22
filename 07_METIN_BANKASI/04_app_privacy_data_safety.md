# 🔒 App Privacy & Data Safety — Cevap Anahtarı

> Hem Apple App Store (App Privacy) hem Google Play (Data Safety) için **tüm soruların cevapları** burada. Bu cevaplar `privacy_policy.md` ile **kelime kelime tutarlı** olmalıdır.

---

## 📱 APPLE APP PRIVACY (App Store Connect)

### Step 1 — "Do you or any third-party partners collect data from this app?"
**Answer**: ☑️ **Yes, we collect data from this app**

---

### Step 2 — Data Types Collected

#### 1. CONTACT INFO

##### Email Address
- ☑️ **Collected**
- **Linked to user**: Yes
- **Used for tracking**: No
- **Purpose**:
  - ☑️ App Functionality
  - ☑️ Account Management

#### 2. USER CONTENT

##### Photos or Videos
- ☑️ **Collected**
- **Linked to user**: Yes
- **Used for tracking**: No
- **Purpose**:
  - ☑️ App Functionality (ingredient recognition from fridge photos)
- **Note**: Photos are processed but not stored after analysis. We delete fridge scan images within 24 hours.

##### Customer Support
- ☑️ **Collected**
- **Linked to user**: Yes
- **Used for tracking**: No
- **Purpose**:
  - ☑️ App Functionality (support requests)

#### 3. IDENTIFIERS

##### User ID
- ☑️ **Collected**
- **Linked to user**: Yes
- **Used for tracking**: No
- **Purpose**:
  - ☑️ App Functionality
  - ☑️ Analytics

##### Device ID
- ☑️ **Collected** (only for crash diagnostics)
- **Linked to user**: No
- **Used for tracking**: No
- **Purpose**:
  - ☑️ Analytics (crash reporting)

#### 4. USAGE DATA

##### Product Interaction
- ☑️ **Collected**
- **Linked to user**: Yes
- **Used for tracking**: No
- **Purpose**:
  - ☑️ Analytics
  - ☑️ Product Personalization (recipe recommendations)

#### 5. DIAGNOSTICS

##### Crash Data
- ☑️ **Collected**
- **Linked to user**: No (anonymized)
- **Used for tracking**: No
- **Purpose**:
  - ☑️ App Functionality
  - ☑️ Analytics

##### Performance Data
- ☑️ **Collected**
- **Linked to user**: No
- **Used for tracking**: No
- **Purpose**:
  - ☑️ App Functionality
  - ☑️ Analytics

---

### Step 3 — Data NOT Collected

The following data types are **NOT** collected:

- ❌ Contact Info: Name, Phone Number, Physical Address
- ❌ Health & Fitness data
- ❌ Financial Info (RevenueCat handles payments — we don't see card details)
- ❌ Location (any kind)
- ❌ Sensitive Info
- ❌ Contacts
- ❌ User Content: Audio Data, Gameplay Content, Other User Content
- ❌ Browsing History
- ❌ Search History
- ❌ Purchases (transaction details handled by Apple/Google)
- ❌ Other Data

---

### Privacy Policy URL
```
https://pratiktarifler.app/privacy
```

---

## 🤖 GOOGLE PLAY DATA SAFETY

Play Console → Policy → App content → Data safety section.

### Section 1 — Data Collection and Security

#### Q1: Does your app collect or share any of the required user data types?
**Answer**: ☑️ **Yes**

#### Q2: Is all of the user data collected by your app encrypted in transit?
**Answer**: ☑️ **Yes** (All API calls use HTTPS/TLS)

#### Q3: Do you provide a way for users to request that their data be deleted?
**Answer**: ☑️ **Yes** (KVKK/GDPR compliant — user can delete account from Profile)

#### Q4: Is your app independently validated against a global security standard?
**Answer**: ☐ No (uncheck — we're not ISO certified)

---

### Section 2 — Data Types

#### 📇 PERSONAL INFO

##### Email Address
- **Collected**: ✅ Yes
- **Shared**: ❌ No
- **Processed ephemerally**: ❌ No
- **Required or Optional**: Required (for account creation)
- **Purposes**:
  - ☑️ Account management
  - ☑️ Communications
- **User can delete**: ✅ Yes

##### User IDs
- **Collected**: ✅ Yes
- **Shared**: ❌ No
- **Processed ephemerally**: ❌ No
- **Required or Optional**: Required
- **Purposes**:
  - ☑️ Account management
  - ☑️ App functionality
  - ☑️ Analytics

#### 📷 PHOTOS AND VIDEOS

##### Photos
- **Collected**: ✅ Yes
- **Shared**: ❌ No
- **Processed ephemerally**: ✅ Yes (deleted after 24h analysis)
- **Required or Optional**: Optional (only when using fridge scan)
- **Purposes**:
  - ☑️ App functionality (ingredient recognition)

#### 📊 APP ACTIVITY

##### App Interactions
- **Collected**: ✅ Yes
- **Shared**: ❌ No
- **Processed ephemerally**: ❌ No
- **Required or Optional**: Required
- **Purposes**:
  - ☑️ Analytics
  - ☑️ App functionality

##### In-app Search History
- **Collected**: ❌ No

#### 📊 APP INFO AND PERFORMANCE

##### Crash Logs
- **Collected**: ✅ Yes
- **Shared**: ❌ No (Sentry/Firebase Crashlytics handle internally)
- **Processed ephemerally**: ❌ No
- **Required or Optional**: Required
- **Purposes**:
  - ☑️ App functionality (debugging)

##### Diagnostics
- **Collected**: ✅ Yes
- **Shared**: ❌ No
- **Required or Optional**: Required
- **Purposes**:
  - ☑️ App functionality
  - ☑️ Analytics

##### Other App Performance Data
- **Collected**: ✅ Yes (performance metrics)
- **Shared**: ❌ No
- **Required or Optional**: Required
- **Purposes**:
  - ☑️ App functionality

---

### Section 3 — Data NOT Collected

These are explicitly **NOT** collected and should be left unchecked:

- ❌ **Personal info**: Name, Phone, Address, Race, Politics, Religion, Sexual orientation, Other
- ❌ **Financial info** (RevenueCat/Google Play handles all payment data)
- ❌ **Health and fitness**
- ❌ **Messages**: Emails, SMS, Other in-app messages
- ❌ **Audio files** (microphone is used only for live voice commands, never recorded)
- ❌ **Files and docs**
- ❌ **Calendar**
- ❌ **Contacts**
- ❌ **Location**: Approximate, Precise
- ❌ **Web browsing**
- ❌ **Device or other IDs** for tracking

---

## 🌐 PERMISSIONS — TR + EN Açıklamaları

### iOS — Info.plist Strings (`app.config.ts`)

#### NSCameraUsageDescription
- **TR**: "Pratik Tarifler, buzdolabınızdaki malzemeleri tanımak için kameranızı kullanır."
- **EN**: "Pratik Tarifler uses your camera to recognize ingredients in your refrigerator."

#### NSPhotoLibraryUsageDescription
- **TR**: "Pratik Tarifler, mevcut bir fotoğraftan malzeme taraması yapmak için galerinize erişebilir."
- **EN**: "Pratik Tarifler may access your photo library to scan ingredients from an existing photo."

#### NSMicrophoneUsageDescription
- **TR**: "Pratik Tarifler, pişirme modunda 'sonraki adım' gibi sesli komutları anlamak için mikrofonunuzu kullanır."
- **EN**: "Pratik Tarifler uses your microphone for hands-free voice commands during cooking mode."

#### NSSpeechRecognitionUsageDescription
- **TR**: "Pratik Tarifler, pişirme sırasında sesli komutları işlemek için konuşma tanıma teknolojisini kullanır."
- **EN**: "Pratik Tarifler uses speech recognition to process voice commands like 'next' or 'previous' while you cook."

### Android — AndroidManifest.xml (Expo otomatik)

| Permission | Reason |
|------------|--------|
| `CAMERA` | Buzdolabı tarama |
| `READ_EXTERNAL_STORAGE` | Galeri seçimi |
| `RECORD_AUDIO` | Pişirme modu sesli komut |
| `INTERNET` | API çağrıları (otomatik) |
| `WAKE_LOCK` | Pişirme modunda ekran açık (otomatik) |

---

## 📝 KVKK & GDPR UYUM NOTLARI

### KVKK (Türkiye)
- **Aydınlatma Metni**: Privacy Policy içinde mevcut (Madde 7)
- **Açık Rıza**: Uygulamada ilk açılışta sorulur (e-posta + foto + analitik)
- **Veri Silme Hakkı**: Profile → "Hesabımı Sil" → 30 gün içinde tüm veri temizlenir
- **Veri Sorumlusu**: [Şirket Adı], [Adres]
- **VERBİS Kaydı**: 50.000+ kullanıcıya ulaşılınca zorunlu, başvuru yapılmalı

### GDPR (Avrupa)
- **Legal Basis**: Consent (Article 6.1.a) + Contract (Article 6.1.b)
- **Data Protection Officer (DPO)**: Belirli bir kullanıcı sayısı geçilince zorunlu
- **Data Portability**: Kullanıcı verisini JSON olarak indirebilir (Profile → Export Data)
- **Cookie Banner**: Sadece web sitesinde gerekli (uygulamada cookie yok)

---

## ⚠️ ASLA YAPMA

Bu maddeler **otomatik reject** sebebidir:

- ❌ Topladığın veriyi App Privacy / Data Safety'de **beyan etmeme**
- ❌ Privacy Policy'de yazmadığın bir veri toplama
- ❌ "Used for tracking: Yes" yanlışlıkla işaretleme (tracking yapmıyoruz!)
- ❌ Photos'u "Linked to user: No" işaretleme (kullanıcıyla bağlı çünkü kullanıcı çekiyor)
- ❌ Privacy Policy URL'ini canlıya almama
- ❌ Permission açıklamasını boş bırakma ya da çok kısa yazma

---

*Soru: destek@pratiktarifler.app*
