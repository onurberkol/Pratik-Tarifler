/**
 * Pratik Tarifler — Firebase Initial Seed
 * ========================================
 * 2500 tarifi recipes_tr koleksiyonuna batch upload eder.
 * Image jobs koleksiyonunu kurar.
 * app_config/global'i yazar.
 * 
 * Kullanım:
 *   1. Firebase Console'dan service account JSON indir
 *      → /firebase/serviceAccount.json olarak kaydet
 *   
 *   2. npm install firebase-admin
 *   
 *   3. node seed.js [--env dev|prod] [--collection recipes_tr]
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ========= ARGS =========
const argv = require('minimist')(process.argv.slice(2));
const ENV = argv.env || 'dev';
const TARGET_COLLECTION = argv.collection || 'recipes_tr';
const DRY_RUN = argv.dryRun || false;

// ========= INIT =========
const serviceAccount = require('./serviceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`
});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

console.log(`🔥 Firebase Seed — ENV: ${ENV}, Target: ${TARGET_COLLECTION}, DryRun: ${DRY_RUN}\n`);

// ========= STEP 1: RECIPES =========
async function seedRecipes() {
  console.log('📚 STEP 1/4: Uploading 2500 recipes...');
  
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'recipes_db_FULL_tr_v2.json'), 'utf-8')
  );
  const recipes = data.recipes;
  
  // Firestore batch limit: 500 writes/batch
  const BATCH_SIZE = 400;
  let written = 0;
  
  for (let i = 0; i < recipes.length; i += BATCH_SIZE) {
    const slice = recipes.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    
    for (const recipe of slice) {
      // Search keywords üret (TR + ingredient'lar)
      const search_keywords = generateSearchKeywords(recipe);
      
      const doc = {
        ...recipe,
        favorite_count: 0,
        view_count: 0,
        search_keywords,
        published_at: null,  // image hazır olunca set edilecek
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      };
      
      const ref = db.collection(TARGET_COLLECTION).doc(recipe.id);
      batch.set(ref, doc);
    }
    
    if (!DRY_RUN) {
      await batch.commit();
    }
    written += slice.length;
    console.log(`  ✓ Batch ${Math.ceil(written / BATCH_SIZE)}: ${written}/${recipes.length}`);
  }
  
  console.log(`✅ Recipes: ${written} written\n`);
}

function generateSearchKeywords(recipe) {
  const keywords = new Set();
  
  // Title kelimeleri (Türkçe küçük harfli)
  recipe.title.toLowerCase().split(/\s+/).forEach(w => {
    if (w.length > 2) keywords.add(w);
  });
  
  // Ingredient tokens
  (recipe.primary_ingredients || []).forEach(t => keywords.add(t));
  
  // Cuisine
  if (recipe.cuisine) keywords.add(recipe.cuisine);
  
  // Diet tags
  (recipe.diet_tags || []).forEach(t => keywords.add(t));
  
  // Meal type
  (recipe.meal_type || []).forEach(t => keywords.add(t));
  
  return [...keywords];
}

// ========= STEP 2: IMAGE JOBS =========
async function seedImageJobs() {
  console.log('🖼️ STEP 2/4: Uploading 2500 image jobs...');
  
  const jobsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'image_jobs.json'), 'utf-8')
  );
  const jobs = jobsData.jobs;
  
  const BATCH_SIZE = 400;
  let written = 0;
  
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const slice = jobs.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    
    for (const job of slice) {
      const doc = {
        ...job,
        cost_usd: 0,
        admin_notes: null,
        completed_at: null,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      };
      
      const ref = db.collection('image_jobs').doc(job.job_id);
      batch.set(ref, doc);
    }
    
    if (!DRY_RUN) {
      await batch.commit();
    }
    written += slice.length;
    console.log(`  ✓ Batch ${Math.ceil(written / BATCH_SIZE)}: ${written}/${jobs.length}`);
  }
  
  console.log(`✅ Image jobs: ${written} written\n`);
}

// ========= STEP 3: APP CONFIG =========
async function seedAppConfig() {
  console.log('⚙️ STEP 3/4: Writing app_config/global...');
  
  const config = {
    min_app_version: { ios: '1.0.0', android: '1.0.0' },
    force_update: false,
    maintenance_mode: false,
    
    features: {
      mod_1_camera_scan: true,
      mod_1_manual_list: true,
      mod_2_supply_mode: true,
      mod_3_unlimited: true,
      ai_recipe_suggestions: false,  // henüz yok
    },
    
    limits: {
      free_daily_recipes: 10,
      free_favorites: 20,
      free_pantry_scans_daily: 3,
      premium_daily_recipes: -1,
      premium_favorites: -1,
      premium_pantry_scans_daily: -1,
    },
    
    ai: {
      image_recognition_provider: 'google_vision',
      recipe_suggestion_model: 'gpt-4',
    },
    
    supported_languages: [
      'tr', 'en', 'de', 'fr', 'it', 'es', 'pt', 'el', 'nl', 'ru', 'sr', 'ar', 'he'
    ],
    default_language: 'tr',
    
    updated_at: FieldValue.serverTimestamp(),
  };
  
  if (!DRY_RUN) {
    await db.collection('app_config').doc('global').set(config);
  }
  console.log(`✅ App config written\n`);
}

// ========= STEP 4: ADMIN USER =========
async function setupAdminUser(email) {
  console.log(`👤 STEP 4/4: Setting admin claim for ${email}...`);
  
  if (DRY_RUN) {
    console.log(`  (skipped, dry run)\n`);
    return;
  }
  
  const auth = admin.auth();
  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Admin claim set for: ${email} (${user.uid})\n`);
  } catch (e) {
    console.log(`⚠️ User ${email} not found. Create user first, then run again.\n`);
  }
}

// ========= MAIN =========
(async () => {
  try {
    await seedRecipes();
    await seedImageJobs();
    await seedAppConfig();
    
    if (argv.adminEmail) {
      await setupAdminUser(argv.adminEmail);
    } else {
      console.log('💡 To set admin user, pass --adminEmail your@email.com');
    }
    
    console.log('🎉 SEED COMPLETE!');
    console.log(`Total Firestore writes: ~5000`);
    console.log(`Estimated cost: $0.01`);
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
  process.exit(0);
})();
