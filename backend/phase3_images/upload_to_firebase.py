"""
Firebase Storage Upload + Firestore Update
==============================================
image_pipeline_v2.py'nin çıktısı:
  output/full/{recipe_id}.webp
  output/thumb/{recipe_id}.webp
  output/blur/{recipe_id}.txt

Bu script onları:
  1. Firebase Storage'a yükler:
     gs://bucket/recipes/tr/full/{recipe_id}.webp
     gs://bucket/recipes/tr/thumb/{recipe_id}.webp
  2. Public URL'leri alır
  3. Firestore'da recipes_tr/{recipe_id}.image alanını günceller
  4. image_jobs/{job_id} status'unu 'review' yapar
  5. image_review_queue'ya ekler (admin onayı için)

Kullanım:
  python upload_to_firebase.py \\
    --service-account /path/to/serviceAccount.json \\
    --bucket your-bucket-name \\
    --results /path/to/results.json \\
    --output-dir /path/to/output/
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path

try:
    import firebase_admin
    from firebase_admin import credentials, firestore, storage
    HAS_FIREBASE = True
except ImportError:
    HAS_FIREBASE = False
    print("⚠️  firebase-admin paketi yok. Kur:")
    print("    pip install firebase-admin")
    sys.exit(1)


def init_firebase(service_account_path: str, bucket_name: str):
    if not firebase_admin._apps:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred, {'storageBucket': bucket_name})
    return firestore.client(), storage.bucket()


def upload_file(bucket, local_path: Path, remote_path: str, content_type: str = 'image/webp') -> str:
    """Yerel dosyayı Storage'a yükle, public URL döndür."""
    blob = bucket.blob(remote_path)
    blob.upload_from_filename(str(local_path), content_type=content_type)
    blob.cache_control = 'public, max-age=2592000, immutable'
    blob.patch()
    blob.make_public()
    return blob.public_url


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--service-account', required=True, help='Firebase service account JSON path')
    parser.add_argument('--bucket', required=True, help='Firebase Storage bucket name (e.g., my-app.appspot.com)')
    parser.add_argument('--results', required=True, help='results_*.json from image_pipeline')
    parser.add_argument('--output-dir', required=True, help='output/ directory from image_pipeline')
    parser.add_argument('--lang', default='tr', help='Language code (default: tr)')
    parser.add_argument('--dry-run', action='store_true', help='Simulate without upload')
    parser.add_argument('--limit', type=int, default=None, help='Limit count')
    args = parser.parse_args()
    
    if not args.dry_run:
        print(f"🔥 Initializing Firebase...")
        db, bucket = init_firebase(args.service_account, args.bucket)
    else:
        print(f"🧪 DRY RUN mode")
        db, bucket = None, None
    
    # Pipeline sonuçlarını oku
    with open(args.results, encoding='utf-8') as f:
        results_data = json.load(f)
    
    successful = [r for r in results_data['results'] if r.get('status') == 'success']
    
    if args.limit:
        successful = successful[:args.limit]
    
    print(f"📤 {len(successful)} adet resim yüklenecek (lang: {args.lang})\n")
    
    output_dir = Path(args.output_dir)
    uploaded = []
    failed = []
    
    for i, result in enumerate(successful, 1):
        recipe_id = result['recipe_id']
        title = result['title']
        
        full_path = output_dir / 'full' / f"{recipe_id}.webp"
        thumb_path = output_dir / 'thumb' / f"{recipe_id}.webp"
        blur_path = output_dir / 'blur' / f"{recipe_id}.txt"
        
        if not full_path.exists():
            print(f"  [{i}/{len(successful)}] ✗ Missing: {recipe_id}")
            failed.append({'recipe_id': recipe_id, 'reason': 'file_not_found'})
            continue
        
        try:
            print(f"  [{i}/{len(successful)}] ⏳ {recipe_id} — {title[:40]}")
            
            if args.dry_run:
                url_full = f"https://storage.googleapis.com/MOCK/recipes/{args.lang}/full/{recipe_id}.webp"
                url_thumb = f"https://storage.googleapis.com/MOCK/recipes/{args.lang}/thumb/{recipe_id}.webp"
                blur_hash = blur_path.read_text() if blur_path.exists() else None
            else:
                # 1. Storage upload
                url_full = upload_file(bucket, full_path, 
                    f"recipes/{args.lang}/full/{recipe_id}.webp")
                url_thumb = upload_file(bucket, thumb_path, 
                    f"recipes/{args.lang}/thumb/{recipe_id}.webp")
                blur_hash = blur_path.read_text() if blur_path.exists() else None
                
                # 2. Firestore: recipes_xx
                collection = f"recipes_{args.lang}"
                db.collection(collection).document(recipe_id).update({
                    'image.url_full': url_full,
                    'image.url_thumb': url_thumb,
                    'image.blur_hash': blur_hash,
                    'image.width': 1200,
                    'image.height': 900,
                    'image.source': result.get('final_source'),
                    'image.source_id': None,  # gelecekte saklanabilir
                    'image.photographer': result.get('photographer'),
                    'image.license': result.get('final_source'),
                    'image.status': 'review',  # admin onayı bekliyor
                    'image.created_at': firestore.SERVER_TIMESTAMP,
                    'image_status': 'review'
                })
                
                # 3. image_jobs güncelle
                job_id = f"img_job_{recipe_id}"
                db.collection('image_jobs').document(job_id).update({
                    'status': 'review',
                    'current_image_url': url_thumb,
                    'current_source': result.get('final_source'),
                    'requires_review': True,
                    'completed_at': firestore.SERVER_TIMESTAMP,
                    'updated_at': firestore.SERVER_TIMESTAMP
                })
                
                # 4. Review queue'ya ekle
                db.collection('image_review_queue').document(recipe_id).set({
                    'recipe_id': recipe_id,
                    'recipe_title': title,
                    'current_image_url': url_thumb,
                    'source': result.get('final_source'),
                    'photographer': result.get('photographer'),
                    'decision': None,
                    'reviewer_id': None,
                    'reviewed_at': None,
                    'created_at': firestore.SERVER_TIMESTAMP
                })
            
            print(f"     ✓ Uploaded — full: {url_full[:60]}...")
            uploaded.append({
                'recipe_id': recipe_id,
                'url_full': url_full,
                'url_thumb': url_thumb,
                'blur_hash': blur_hash
            })
        
        except Exception as e:
            print(f"     ✗ Error: {e}")
            failed.append({'recipe_id': recipe_id, 'reason': str(e)})
    
    # Özet
    print(f"\n{'=' * 60}")
    print(f"UPLOAD COMPLETE")
    print(f"  Total: {len(successful)}")
    print(f"  Success: {len(uploaded)}")
    print(f"  Failed: {len(failed)}")
    print(f"{'=' * 60}")
    
    # Kaydet
    summary_file = Path(args.output_dir) / f"upload_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump({
            'uploaded': uploaded,
            'failed': failed,
            'lang': args.lang,
            'completed_at': datetime.now().isoformat()
        }, f, ensure_ascii=False, indent=2)
    print(f"📄 Summary: {summary_file}")


if __name__ == '__main__':
    main()
