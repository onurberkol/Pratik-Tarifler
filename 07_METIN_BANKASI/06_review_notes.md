# 📝 Reviewer Notları — Apple ve Google İçin

> App Store Connect ve Play Console'a yazılacak inceleme notları.

---

## 🍎 APPLE — APP REVIEW INFORMATION

### Sign-In Required
☑️ Yes, sign-in required

### Demo Account
```
Username: apple.reviewer@pratiktarifler.app
Password: AppleReview2026!
```

### Contact Information
```
First Name: [Senin adın]
Last Name: [Senin soyadın]
Phone: +90 5XX XXX XXXX
Email: destek@pratiktarifler.app
```

### Notes (Tam metin — İngilizce)
```
Pratik Tarifler is an AI-powered recipe discovery app. The core feature 
is recognizing ingredients from a refrigerator photo and suggesting 
recipes that can be made with available ingredients.

═══════════════════════════════════════════
TEST INSTRUCTIONS
═══════════════════════════════════════════

1. SIGN IN
   Use the provided demo account. It has Premium activated for full 
   feature access.

2. CORE FEATURE — FRIDGE SCAN (Mode 1)
   - Tap "Evdeki Kalanlarla" on the home screen
   - The app will request camera permission — please allow
   - Take a photo (any photo works for testing) OR tap the gallery icon 
     to select from photos
   - AI will detect ingredients in 5-15 seconds
   - You can edit the detected ingredient list
   - Tap "Tarifleri Gör" — matching recipes will appear
   - Open any recipe to see the detail view

3. COOKING MODE
   - In any recipe detail, tap "Pişirmeye Başla"
   - This activates the cooking mode with:
     • Large text
     • Step-by-step instructions
     • Automatic timer
     • Screen stays awake
     • Optional voice commands (mic permission)

4. PREMIUM
   - Demo account already has Premium activated
   - To test purchase flow:
     - Sign out, create new account
     - Go to Profile > Premium
     - Tap "Yıllık Premium'u Dene"
     - Use Sandbox test account (provided separately)

═══════════════════════════════════════════
PERMISSIONS EXPLAINED
═══════════════════════════════════════════

• Camera (NSCameraUsageDescription)
  Used for refrigerator scanning. Photos are processed for ingredient 
  recognition only and deleted from servers within 24 hours.

• Photo Library (NSPhotoLibraryUsageDescription)
  Optional. Users may select an existing photo instead of taking a 
  new one.

• Microphone (NSMicrophoneUsageDescription)
  Used only in cooking mode for hands-free commands like "next step" 
  or "previous step". Voice is processed live, never recorded.

• Speech Recognition (NSSpeechRecognitionUsageDescription)
  Pairs with microphone for processing voice commands. Apple's on-device 
  speech recognition is used.

═══════════════════════════════════════════
APP COMPLIANCE
═══════════════════════════════════════════

• Uses Sign In with Apple (required because we use Google Sign-In)
• In-App Purchases: 2 auto-renewable subscriptions
  - app.pratiktarifler.premium.monthly (49 TRY/month)
  - app.pratiktarifler.premium.yearly (399 TRY/year)
  - Both include 7-day free trial
• Privacy Policy: https://pratiktarifler.app/privacy
• Terms of Service: https://pratiktarifler.app/terms
• Subscription terms displayed on Premium screen as required

═══════════════════════════════════════════
CONTACT
═══════════════════════════════════════════

For any questions during review:
• Email: destek@pratiktarifler.app (responds within 24h)
• Response time: Best effort within 4 business hours

Thank you for reviewing Pratik Tarifler!
```

---

## 🤖 GOOGLE — APP CONTENT NOTES

### App Access (Restricted Functionality)
```
This app has restricted (premium) functionality available via subscription.

Demo account for reviewers (premium activated):

Email: google.reviewer@pratiktarifler.app
Password: GoogleReview2026!

═══════════════════════════════════════════
HOW TO TEST FULL FUNCTIONALITY
═══════════════════════════════════════════

1. Sign in with the demo account on the login screen
2. The account has Premium activated, so all features are unlocked
3. Test the core feature: Home > "Evdeki Kalanlarla" > 
   allow camera permission > take a photo or use sample image
4. AI will detect ingredients; matching recipes appear
5. Open any recipe and try "Pişirmeye Başla" for cooking mode
6. Premium-only features:
   - Unlimited fridge scans (free: 3/day)
   - Unlimited favorites (free: 20)
   - 500+ premium exclusive recipes
   - Shopping list export

═══════════════════════════════════════════
SUBSCRIPTION TESTING
═══════════════════════════════════════════

To test the purchase flow with the test account:
1. Sign out and create a new free account
2. Go to Profile > "Premium'a Geç"
3. Select Monthly or Yearly plan
4. Google Play test purchase flow will appear
5. License testing account is enabled — no real charge

═══════════════════════════════════════════
PERMISSIONS
═══════════════════════════════════════════

• Camera: Refrigerator scanning (core feature)
• Storage: Save selected photos temporarily
• Microphone: Voice commands in cooking mode only
• Internet: API calls (Firebase, recipes database)

═══════════════════════════════════════════
CONTACT
═══════════════════════════════════════════

destek@pratiktarifler.app
```

---

## 🔐 ÖNEMLİ NOT — DEMO HESAP KURULUMU

Bu rehberi gönderdiğin reviewer'lar **gerçek demo hesabı bulamazsa** uygulama reject olur. Mutlaka:

1. **Firebase Authentication**'da hesapları oluştur:
   ```
   apple.reviewer@pratiktarifler.app — AppleReview2026!
   google.reviewer@pratiktarifler.app — GoogleReview2026!
   ```

2. **Premium aktif et**:
   ```bash
   # Cloud Functions Shell
   firebase functions:shell
   > grantPremiumToUser({email: "apple.reviewer@pratiktarifler.app"})
   > grantPremiumToUser({email: "google.reviewer@pratiktarifler.app"})
   ```

3. **Test et** — yerel cihazda demo hesapla giriş yap, Premium aktif mi kontrol et.

---

*Yardım: destek@pratiktarifler.app*
