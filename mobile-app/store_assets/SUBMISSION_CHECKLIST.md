# Store Submission Checklist

## ✅ Before You Submit

### Code & Configuration
- [ ] `app.config.ts` — Replace `REPLACE_WITH_YOUR_EAS_PROJECT_ID` (2 places)
- [ ] `app.config.ts` — Update `owner` field to your EAS account
- [ ] `eas.json` — Update `submit.production.ios.appleId` / `ascAppId` / `appleTeamId`
- [ ] `eas.json` — Place `play-service-account.json` in project root
- [ ] `.env` — All Firebase + Google Sign-In values set
- [ ] `functions/.env` (or Firebase Secrets) — `APPLE_SHARED_SECRET`, `ANDROID_PACKAGE_NAME`
- [ ] Run `npm run typecheck` and `npm test` — must pass
- [ ] Update `version` in `app.config.ts` (semver)

### Firebase
- [ ] Project created and on Blaze plan
- [ ] Authentication providers enabled: Email/Password, Google, Apple, Anonymous
- [ ] Firestore deployed: `firebase deploy --only firestore`
- [ ] Storage rules deployed: `firebase deploy --only storage`
- [ ] Functions deployed: `firebase deploy --only functions`
- [ ] Database seeded: `npm run seed`
- [ ] Domain verified for Apple Sign-In: `pratiktarifler.app` (Apple Developer → Identifiers → Services IDs)

### Apple App Store
- [ ] App Store Connect record created
- [ ] App Information complete (category: Food & Drink)
- [ ] Pricing & Availability set
- [ ] App Privacy questionnaire completed (see STORE_LISTING_COPY.md)
- [ ] Subscription products created:
  - `app.pratiktarifler.premium.monthly`
  - `app.pratiktarifler.premium.yearly`
- [ ] Subscription group named "Pratik Tarifler Premium"
- [ ] Shared Secret generated → set in Cloud Functions via:
  `firebase functions:secrets:set APPLE_SHARED_SECRET`
- [ ] App Store Server Notifications V2 URL configured
- [ ] Test users created in App Store Connect (Sandbox testers)
- [ ] Apple Sign-In capability enabled in app
- [ ] Screenshots uploaded (6.7", 6.5", 5.5", 12.9" iPad)
- [ ] App Preview videos (optional)
- [ ] App icon 1024×1024 (`store_assets/ios/app_icon_1024.png`)
- [ ] Reviewer account credentials in review notes
- [ ] Export compliance: `ITSAppUsesNonExemptEncryption = false` (already in `app.config.ts`)

### Google Play
- [ ] Play Console app created
- [ ] Store listing complete (Title, Short Description, Full Description)
- [ ] Feature graphic 1024×500 (`store_assets/android/feature_graphic_1024x500.png`)
- [ ] App icon 512×512 (resize from `assets/icon.png`)
- [ ] Screenshots phone + 7" tablet + 10" tablet
- [ ] Content rating completed
- [ ] Target audience: 13+
- [ ] Data safety section filled (matches Apple Privacy answers)
- [ ] Subscription products created:
  - `premium_monthly`
  - `premium_yearly`
- [ ] Service account created with Pub/Sub Admin role → JSON downloaded
- [ ] Real-time developer notifications topic configured
- [ ] Internal testing track with at least one tester
- [ ] App signing by Google Play enabled (default)
- [ ] Privacy policy URL valid and accessible
- [ ] Subscription cancellation method clearly described

## 🚀 Build & Submit

```bash
# 1. Bump version
# Edit app.config.ts: version = "1.0.1", buildNumber/versionCode bumped via EAS

# 2. Build
eas build --platform ios --profile production
eas build --platform android --profile production

# 3. Submit
eas submit --platform ios --latest
eas submit --platform android --latest
```

## 🐛 Common Rejections

### Apple
1. **Sign in with Apple required** — Already implemented; ensure test account works.
2. **3.1.1 Acceptable Business Models** — Show what's free vs Premium clearly on the paywall.
3. **5.1.1 Privacy** — Account deletion required; we use `purgeUserData` cloud function.
4. **2.1 App Completeness** — Test in airplane mode (offline first works for non-search).
5. **Misleading subscriptions** — Subtitle and screenshots must show actual app features.

### Google
1. **Data safety mismatch** — Make sure declared collection matches actual Firestore writes.
2. **Subscription cancellation instructions** — Include in app and listing.
3. **Personally identifiable info in logs** — Ensure no email/UID in `console.log`.

## 📝 Post-Launch
- [ ] Set up Firebase Performance Monitoring
- [ ] Set up Crashlytics or Sentry
- [ ] App Store Server Notifications V2 endpoint live
- [ ] Test purchase flow end-to-end (sandbox account)
- [ ] Test account deletion flow
- [ ] Test all 13 locales render correctly (especially RTL)
- [ ] Configure phased release on Play (rollout %)
- [ ] Monitor App Store Connect reviews / Play Console feedback
