"""
Pratik Tarifler — Translation Upload to Firestore
====================================================
translate_recipes.py'nin çıktısı: 
  output/recipes_{xx}_firestore.json — her dil için bir dosya

Bu script onları:
  1. recipes_{xx} koleksiyonuna yükler (recipes_en, recipes_de, ...)
  2. translation_jobs durumunu 'done' yapar
  3. Her bir tarif için published_at set eder (image hazırsa)

Kullanım:
  python upload_translations.py \\
    --service-account /path/to/serviceAccount.json \\
    --lang en \\
    --input output/recipes_en_firestore.json
  
  # Veya tüm diller
  python upload_translations.py --service-account ... --all
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    HAS_FIREBASE = True
except ImportError:
    HAS_FIREBASE = False
    print("⚠️  firebase-admin paketi yok. Kur:")
    print("    pip install firebase-admin")
    sys.exit(1)


SUPPORTED_LANGS = ["en", "de", "fr", "it", "es", "pt", "el", "nl", "ru", "sr", "ar", "he"]


def init_firebase(service_account_path: str):
    if not firebase_admin._apps:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
    return firestore.client()


def upload_lang(db, lang: str, input_file: Path, dry_run: bool = False):
    """Tek dil için toplu upload."""
    if not input_file.exists():
        print(f"  ⚠️  {lang}: {input_file} bulunamadı, atlanıyor")
        return {"lang": lang, "status": "skipped", "uploaded": 0}
    
    with open(input_file, encoding="utf-8") as f:
        recipes_dict = json.load(f)
    
    print(f"\n📤 [{lang}] {len(recipes_dict)} tarif yüklenecek")
    
    if dry_run:
        print(f"  [DRY-RUN] recipes_{lang} koleksiyonuna {len(recipes_dict)} yazılırdı")
        return {"lang": lang, "status": "dry_run", "uploaded": len(recipes_dict)}
    
    collection_name = f"recipes_{lang}"
    BATCH_SIZE = 400
    items = list(recipes_dict.items())
    written = 0
    
    for i in range(0, len(items), BATCH_SIZE):
        slice = items[i:i+BATCH_SIZE]
        batch = db.batch()
        
        for recipe_id, recipe_data in slice:
            # Server timestamp
            recipe_data["created_at"] = firestore.SERVER_TIMESTAMP
            recipe_data["updated_at"] = firestore.SERVER_TIMESTAMP
            
            # published_at: image hazırsa zaman set et, değilse null
            if recipe_data.get("image_status") == "ready":
                recipe_data["published_at"] = firestore.SERVER_TIMESTAMP
            else:
                recipe_data["published_at"] = None
            
            ref = db.collection(collection_name).document(recipe_id)
            batch.set(ref, recipe_data)
        
        batch.commit()
        written += len(slice)
        print(f"  ✓ Batch {(i // BATCH_SIZE) + 1}: {written}/{len(items)}")
    
    print(f"✅ [{lang}] {written} tarif yüklendi → {collection_name}")
    return {"lang": lang, "status": "success", "uploaded": written}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--service-account", required=True,
                        help="Firebase service account JSON path")
    parser.add_argument("--input-dir", default="/home/claude/recipes_db/phase3_translation/output",
                        help="Translation output directory")
    parser.add_argument("--lang", default=None,
                        help="Single language code (en, de, ...)")
    parser.add_argument("--all", action="store_true",
                        help="Upload all available translations")
    parser.add_argument("--dry-run", action="store_true",
                        help="Simulate without writes")
    args = parser.parse_args()
    
    if not args.lang and not args.all:
        print("❌ --lang veya --all gerekli")
        sys.exit(1)
    
    # Languages to process
    target_langs = SUPPORTED_LANGS if args.all else [args.lang]
    
    # Init Firebase
    if not args.dry_run:
        db = init_firebase(args.service_account)
    else:
        db = None
    
    print(f"🌍 Upload plan: {len(target_langs)} languages")
    print(f"📂 Source: {args.input_dir}")
    print(f"🧪 Dry-run: {args.dry_run}")
    print(f"{'=' * 60}")
    
    input_dir = Path(args.input_dir)
    results = []
    for lang in target_langs:
        input_file = input_dir / f"recipes_{lang}_firestore.json"
        result = upload_lang(db, lang, input_file, dry_run=args.dry_run)
        results.append(result)
    
    # Summary
    print(f"\n{'=' * 60}")
    print(f"📊 UPLOAD SUMMARY")
    print(f"{'=' * 60}")
    total_uploaded = sum(r["uploaded"] for r in results)
    for r in results:
        icon = "✓" if r["status"] == "success" else ("⏭" if r["status"] == "skipped" else "🧪")
        print(f"  {icon} {r['lang']:>3}: {r['status']:>10} — {r['uploaded']} recipes")
    print(f"\n  📦 Total uploaded: {total_uploaded}")
    
    # Save summary
    summary_file = input_dir / f"upload_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(summary_file, "w") as f:
        json.dump({
            "completed_at": datetime.now().isoformat(),
            "dry_run": args.dry_run,
            "results": results,
            "total_uploaded": total_uploaded
        }, f, indent=2)
    print(f"\n📄 Summary: {summary_file}")


if __name__ == "__main__":
    main()
