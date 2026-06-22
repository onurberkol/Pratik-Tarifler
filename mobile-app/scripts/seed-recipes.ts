/**
 * Seed Firestore with recipe + ingredient data.
 * Run via: npx ts-node scripts/seed-recipes.ts
 *
 * Requires:
 *   - service-account.json in project root (Firebase Admin key)
 *   - FIREBASE_PROJECT_ID env var
 */
import * as fs from "fs";
import * as path from "path";
import * as admin from "firebase-admin";

const SERVICE_ACCOUNT_PATH = path.join(__dirname, "..", "service-account.json");

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("✗ Missing service-account.json in project root.");
  console.error("  Download it from Firebase Console → Project Settings → Service Accounts.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(SERVICE_ACCOUNT_PATH),
});

const db = admin.firestore();

async function seedIngredients() {
  const dictPath = path.join(__dirname, "..", "data", "ingredients.json");
  const dict = JSON.parse(fs.readFileSync(dictPath, "utf-8")) as Record<string, unknown>;

  console.log(`→ Seeding ${Object.keys(dict).length} ingredients...`);
  const batch = db.batch();
  for (const [token, data] of Object.entries(dict)) {
    batch.set(db.doc(`ingredients/${token}`), data, { merge: true });
  }
  await batch.commit();
  console.log("✓ Ingredients seeded.");
}

async function seedRecipes() {
  const recipesDir = path.join(__dirname, "..", "data", "recipes");
  const langs = fs.readdirSync(recipesDir);

  let total = 0;
  for (const lang of langs) {
    const langDir = path.join(recipesDir, lang);
    if (!fs.statSync(langDir).isDirectory()) continue;
    const files = fs.readdirSync(langDir).filter((f) => f.endsWith(".json"));
    console.log(`→ Seeding ${files.length} recipes from ${lang}/...`);
    const batch = db.batch();
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(langDir, file), "utf-8"));
      batch.set(
        db.doc(`recipes/${data.id}`),
        {
          ...data,
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      total++;
    }
    await batch.commit();
  }
  console.log(`✓ ${total} recipes seeded.`);
}

async function main() {
  try {
    await seedIngredients();
    await seedRecipes();
    console.log("✓ Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("✗ Seeding failed:", err);
    process.exit(1);
  }
}

main();
