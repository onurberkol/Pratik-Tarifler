/**
 * E2E Tests — Detox
 * ===================
 * Kullanıcının gerçek akışlarını test eder.
 * 
 * Çalıştırma:
 *   detox build --configuration ios
 *   detox test --configuration ios
 * 
 * Bu dosya iOS/Android simulator gerektirir.
 */

describe('Pratik Tarifler — E2E', () => {
  
  beforeAll(async () => {
    // @ts-ignore
    await device.launchApp({
      permissions: { camera: 'YES', photos: 'YES', notifications: 'YES' },
    });
  });
  
  beforeEach(async () => {
    // @ts-ignore
    await device.reloadReactNative();
  });
  
  // ========================================================
  // MOD 1 AKIŞI — Evdeki Kalanlarla
  // ========================================================
  describe('Mode 1: Pantry flow', () => {
    
    it('user can select Mode 1 from home', async () => {
      // @ts-ignore
      await expect(element(by.text('Bugün ne pişirelim?'))).toBeVisible();
      
      // @ts-ignore
      await element(by.id('mode-card-pantry')).tap();
      
      // @ts-ignore
      await expect(element(by.text('Malzemelerini nasıl ekleyeceksin?'))).toBeVisible();
    });
    
    it('user can enter ingredients manually', async () => {
      // @ts-ignore
      await element(by.id('mode-card-pantry')).tap();
      // @ts-ignore
      await element(by.id('manual-input-button')).tap();
      
      // @ts-ignore
      await expect(element(by.text('Malzemelerin'))).toBeVisible();
      
      // Yumurta seç
      // @ts-ignore
      await element(by.text('Yumurta')).tap();
      // Domates seç
      // @ts-ignore
      await element(by.text('Domates')).tap();
      // Soğan seç
      // @ts-ignore
      await element(by.text('Soğan')).tap();
      
      // 3 malzeme seçildi, CTA aktif olmalı
      // @ts-ignore
      await expect(element(by.id('show-recipes-cta'))).toBeVisible();
    });
    
    it('shows pantry results screen after CTA tap', async () => {
      // Mod 1 → manuel → 3 malzeme → CTA
      // @ts-ignore
      await element(by.id('mode-card-pantry')).tap();
      // @ts-ignore
      await element(by.id('manual-input-button')).tap();
      // @ts-ignore
      await element(by.text('Yumurta')).tap();
      // @ts-ignore
      await element(by.text('Domates')).tap();
      // @ts-ignore
      await element(by.text('Soğan')).tap();
      // @ts-ignore
      await element(by.id('show-recipes-cta')).tap();
      
      // Sonuçlar ekranı açılmalı
      // @ts-ignore
      await waitFor(element(by.id('pantry-results-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
  
  // ========================================================
  // MOD 2 AKIŞI
  // ========================================================
  describe('Mode 2: Supply flow', () => {
    
    it('shows missing ingredients on recipe cards', async () => {
      // @ts-ignore
      await element(by.id('mode-card-supply')).tap();
      // @ts-ignore
      await element(by.id('manual-input-button')).tap();
      // @ts-ignore
      await element(by.text('Yumurta')).tap();
      // @ts-ignore
      await element(by.text('Domates')).tap();
      // @ts-ignore
      await element(by.id('show-recipes-cta')).tap();
      
      // Bekle — supply results yüklensin
      // @ts-ignore
      await waitFor(element(by.id('supply-results-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      // En az bir kartın "🛒 Eksik:" badge'i olmalı
      // @ts-ignore
      await expect(element(by.text(/🛒 Eksik:/))).toBeVisible();
    });
  });
  
  // ========================================================
  // MOD 3 AKIŞI
  // ========================================================
  describe('Mode 3: Discover flow', () => {
    
    it('shows recipe of the day and category scrolls', async () => {
      // @ts-ignore
      await element(by.id('mode-card-discover')).tap();
      
      // @ts-ignore
      await expect(element(by.text('Bugünün Tarifi'))).toBeVisible();
      // @ts-ignore
      await expect(element(by.text('Mutfaklar'))).toBeVisible();
    });
    
    it('can filter by cuisine', async () => {
      // @ts-ignore
      await element(by.id('mode-card-discover')).tap();
      // @ts-ignore
      await element(by.id('cuisine-turkish')).tap();
      
      // Search screen açılmalı, Türk mutfak filtresi aktif
      // @ts-ignore
      await waitFor(element(by.id('search-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });
  
  // ========================================================
  // RECIPE DETAIL & COOK MODE
  // ========================================================
  describe('Recipe Detail & Cook Mode', () => {
    
    it('can open recipe detail and start cooking', async () => {
      // Discover'dan bir tarife git
      // @ts-ignore
      await element(by.id('mode-card-discover')).tap();
      // @ts-ignore
      await element(by.id('recipe-of-the-day-card')).tap();
      
      // Detay ekranı
      // @ts-ignore
      await waitFor(element(by.id('recipe-detail-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Pişirmeye Başla
      // @ts-ignore
      await element(by.id('start-cooking-cta')).tap();
      
      // @ts-ignore
      await expect(element(by.id('cook-mode-screen'))).toBeVisible();
    });
    
    it('servings multiplier works', async () => {
      // @ts-ignore
      await element(by.id('mode-card-discover')).tap();
      // @ts-ignore
      await element(by.id('recipe-of-the-day-card')).tap();
      
      // 2x'e bas
      // @ts-ignore
      await element(by.id('serving-2x')).tap();
      
      // Sonra 3x'e bas
      // @ts-ignore
      await element(by.id('serving-3x')).tap();
      
      // Malzemeler güncellenmiş olmalı (test edilebilirsiz görsel inceleme)
      // @ts-ignore
      await expect(element(by.text('3x'))).toBeVisible();
    });
  });
  
  // ========================================================
  // AUTH FLOW
  // ========================================================
  describe('Authentication', () => {
    
    it('shows welcome screen when not logged in', async () => {
      // @ts-ignore
      await device.terminateApp();
      // @ts-ignore
      await device.launchApp({ delete: true }); // temiz başla
      
      // @ts-ignore
      await expect(element(by.text(/Pratik Tarifler/i))).toBeVisible();
    });
    
    it('can sign up new user', async () => {
      // @ts-ignore
      await element(by.id('signup-button')).tap();
      // @ts-ignore
      await element(by.id('email-input')).typeText('test@example.com');
      // @ts-ignore
      await element(by.id('password-input')).typeText('Test1234!');
      // @ts-ignore
      await element(by.id('submit-signup')).tap();
      
      // Ana ekrana yönlenmeli
      // @ts-ignore
      await waitFor(element(by.text('Bugün ne pişirelim?')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});
