# 🚀 Firebase Deployment Guide

> **Adım adım çalıştırılabilir** — bu döküman ile sıfırdan Firebase backend'i ayağa kalkar.

---

## ✅ ÖN KOŞULLAR

```bash
# Node 20+
node --version

# Firebase CLI
npm install -g firebase-tools

# Login
firebase login
```

---

## 📁 KLASÖR YAPISI

```
pratik-tarifler-firebase/
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── seed.js
├── recipes_db_FULL_tr_v2.json
├── image_jobs.json
├── serviceAccount.json          # ⚠️ GIT'E EKLEME
└── functions/
    ├── package.json
    ├── tsconfig.json
    └── src/
        └── index.ts
```

---

## 🎯 ADIM ADIM DEPLOY

### 1. Firebase Projesi Kur
```bash
# Console'da yeni proje: "pratik-tarifler-prod"
# Sonra:
firebase use --add  # projeyi seç
firebase init       # firestore, functions, storage, hosting seç
```

### 2. Service Account İndir
- Firebase Console → Project Settings → Service Accounts
- "Generate new private key" → JSON indir
- `serviceAccount.json` olarak kaydet (gitignore'a ekle!)

### 3. Firestore Rules + Indexes Deploy
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

> İndexler oluşturulması 5-15 dakika sürer (büyük koleksiyonlar için).

### 4. Storage Rules Deploy
```bash
firebase deploy --only storage:rules
```

### 5. Cloud Functions Deploy
```bash
cd functions
npm install
npm run build

# Secrets set (bir kez yapılır):
firebase functions:secrets:set UNSPLASH_KEY
firebase functions:secrets:set PEXELS_KEY
firebase functions:secrets:set OPENAI_KEY

firebase deploy --only functions
cd ..
```

### 6. Seed (Initial Data Upload)
```bash
# Dry run önce
node seed.js --dryRun

# Gerçek upload
node seed.js --env prod --adminEmail you@example.com

# Çıktı:
# 📚 STEP 1/4: Uploading 2500 recipes...
#   ✓ Batch 1: 400/2500
#   ✓ Batch 2: 800/2500
#   ...
# ✅ Recipes: 2500 written
# 🖼️ STEP 2/4: Uploading 2500 image jobs...
# ⚙️ STEP 3/4: Writing app_config/global...
# 👤 STEP 4/4: Setting admin claim for you@example.com...
# 🎉 SEED COMPLETE!
```

### 7. Doğrulama
Firebase Console'da kontrol et:
- ✅ Firestore: `recipes_tr` koleksiyonu 2500 doküman
- ✅ Firestore: `image_jobs` koleksiyonu 2500 doküman
- ✅ Firestore: `app_config/global` mevcut
- ✅ Auth: Admin kullanıcının `admin: true` custom claim'i var
- ✅ Functions: 8 fonksiyon deployed

---

## 🧪 LOCAL EMULATOR (TEST İÇİN)

```bash
# Tüm servisler local'de
firebase emulators:start

# Erişim:
# - Auth:      http://localhost:9099
# - Firestore: http://localhost:8080
# - Storage:   http://localhost:9199
# - Functions: http://localhost:5001
# - UI:        http://localhost:4000
```

Seed scripti emülatöre:
```bash
FIRESTORE_EMULATOR_HOST=localhost:8080 node seed.js
```

---

## 🔐 GÜVENLİK CHECKLIST

- [ ] `serviceAccount.json` `.gitignore`'da
- [ ] API keys (Unsplash, OpenAI) Firebase Secrets'ta, kodda değil
- [ ] Firestore Rules deploy edildi (default deny var)
- [ ] Storage Rules deploy edildi (size limits var)
- [ ] Admin user'a custom claim verildi
- [ ] App Check (opsiyonel ama önerilir): https://firebase.google.com/docs/app-check

---

## 📊 MALİYET KONTROLÜ

Firebase Console → Usage and Billing → Budgets:
- Aylık $50 limit set et (development)
- Aylık $200 limit set et (production)
- Email notification on 50%, 80%, 100%

---

## 🎯 SONRAKİ ADIM

✅ Firebase backend hazır
⏭️ **Faz 3.2: Image pipeline çalıştır** (görsel toplama)
⏭️ Faz 3.3: Çeviri pipeline (12 dil)
⏭️ Faz 4: App'te 3 modlu UX
