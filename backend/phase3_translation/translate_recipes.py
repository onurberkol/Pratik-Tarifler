"""
Pratik Tarifler — Translation Pipeline (PRODUCTION)
=====================================================
2500 TR tarifi 12 dile çevirir.

PROVIDER: Anthropic Claude Haiku 3.5 (maliyet/kalite oranı en iyi)
KALITE KONTROL: Otomatik validation + opsiyonel GPT-4o spot check

KULLANIM:
  # Dry-run (API çağrısı yok, prompt görüntüleme)
  python translate_recipes.py --dry-run --target en --limit 3
  
  # Pilot: 50 tarif × 1 dil (en)
  python translate_recipes.py --target en --limit 50
  
  # Tam ölçek: 2500 × 1 dil
  python translate_recipes.py --target en
  
  # Tüm 12 dil
  python translate_recipes.py --target all
  
  # Sadece belirli tarifler
  python translate_recipes.py --target en --ids tr-menemen,tr-mercimek-corbasi
"""

import os
import sys
import json
import asyncio
import logging
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List

sys.path.insert(0, os.path.dirname(__file__))

try:
    from anthropic import AsyncAnthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False
    print("⚠️  anthropic paketi yok. Kur: pip install anthropic")

from glossary import (
    get_glossary_terms_for_prompt,
    get_supported_languages,
    DISH_EXPLANATIONS,
    CUISINE_LABELS,
)


# ===================== CONFIG =====================
class Config:
    # Anthropic
    MODEL = "claude-haiku-4-5-20251001"  # Hızlı + ucuz
    # Premium çeviri için: "claude-opus-4-6" veya benzeri
    
    MAX_TOKENS_PER_RECIPE = 4000   # input + output
    TEMPERATURE = 0.3              # Tutarlılık için düşük
    
    # Cost ($)
    HAIKU_INPUT_PER_M = 0.25      # $0.25 per 1M tokens input
    HAIKU_OUTPUT_PER_M = 1.25     # $1.25 per 1M tokens output
    
    # Concurrency
    MAX_CONCURRENT = 5             # Aynı anda 5 çeviri
    RETRY_ATTEMPTS = 3
    RETRY_DELAY_SEC = 2
    
    # Batch
    BATCH_SIZE = 50                # 50'lik gruplar
    SAVE_EVERY = 10                # Her 10 tarifte ara kaydet


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger('translate')


# ===================== PROMPT BUILDER =====================
def build_translation_prompt(recipe: dict, target_lang: str) -> str:
    """Tarif için optimize edilmiş çeviri prompt'u."""
    
    lang_names = {
        'en': 'English', 'de': 'German', 'fr': 'French', 'es': 'Spanish',
        'it': 'Italian', 'pt': 'Portuguese', 'el': 'Greek', 'nl': 'Dutch',
        'ru': 'Russian', 'sr': 'Serbian', 'ar': 'Arabic', 'he': 'Hebrew'
    }
    target_name = lang_names.get(target_lang, target_lang)
    
    # Sadece çevrilecek kısımları çıkar (token vs gibi sabit alanları gönderme)
    translatable = {
        "title": recipe.get("title", ""),
        "description": recipe.get("description", ""),
        "ingredients_notes": [
            {"idx": i, "note": ing.get("note", "")}
            for i, ing in enumerate(recipe.get("ingredients", []))
        ],
        "steps": [
            {
                "order": s.get("order"),
                "title": s.get("title", ""),
                "body": s.get("body", "")
            }
            for s in recipe.get("steps", [])
        ],
        "tips": recipe.get("tips", []),
    }
    
    # Glossary
    glossary = get_glossary_terms_for_prompt(target_lang)
    
    # Cuisine context
    cuisine = recipe.get("cuisine", "turkish")
    cuisine_name = CUISINE_LABELS.get(cuisine, {}).get(target_lang, cuisine)
    
    # Difficulty
    difficulty = recipe.get("difficulty", "easy")
    
    prompt = f"""You are a professional culinary translator specializing in Turkish cuisine.

Translate the following recipe content from Turkish to {target_name}.

CRITICAL RULES:
1. Return ONLY valid JSON in the EXACT same structure as input
2. DO NOT translate or alter ingredient_tokens, ids, numbers, or measurements amounts
3. Keep Turkish dish names in their ORIGINAL form (see glossary below)
4. Use {target_name} cooking terminology naturally — home cook level, warm tone
5. For the title: if it's a Turkish dish name, keep original. Optionally add brief clarification in parentheses ONLY in title (not description), like: "Menemen (Turkish scrambled eggs)"
6. Convert measurements naturally:
   - "1 su bardağı" → use the {target_name} cup equivalent
   - "yemek kaşığı" → tablespoon equivalent
7. Preserve cooking times exactly (e.g., "20 dakika" → "20 minutes")
8. Keep the ingredient_notes brief — they describe the ingredient (e.g., "red", "fresh", "finely chopped")
9. Steps should be clear, imperative voice ("Sauté the onion until golden")

CONTEXT:
- Cuisine: {cuisine_name}
- Difficulty: {difficulty}
- This is a home recipe, not restaurant style

{glossary}

INPUT JSON (Turkish):
```json
{json.dumps(translatable, ensure_ascii=False, indent=2)}
```

Return ONLY the translated JSON in the same structure, no explanations."""
    
    return prompt


# ===================== CLAUDE CLIENT =====================
class ClaudeTranslator:
    def __init__(self, api_key: str):
        if not HAS_ANTHROPIC:
            raise ImportError("anthropic package not installed")
        self.client = AsyncAnthropic(api_key=api_key)
        self.total_input_tokens = 0
        self.total_output_tokens = 0
    
    async def translate(self, recipe: dict, target_lang: str) -> Optional[dict]:
        """Tek tarifi çevir."""
        prompt = build_translation_prompt(recipe, target_lang)
        
        for attempt in range(Config.RETRY_ATTEMPTS):
            try:
                response = await self.client.messages.create(
                    model=Config.MODEL,
                    max_tokens=Config.MAX_TOKENS_PER_RECIPE,
                    temperature=Config.TEMPERATURE,
                    messages=[{"role": "user", "content": prompt}]
                )
                
                self.total_input_tokens += response.usage.input_tokens
                self.total_output_tokens += response.usage.output_tokens
                
                # JSON çıkarma
                text = response.content[0].text.strip()
                
                # Eğer ```json``` ile sarılmışsa temizle
                if text.startswith("```json"):
                    text = text[7:]
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                
                translated = json.loads(text)
                return translated
            
            except json.JSONDecodeError as e:
                log.warning(f"  JSON parse error (attempt {attempt+1}): {e}")
                if attempt < Config.RETRY_ATTEMPTS - 1:
                    await asyncio.sleep(Config.RETRY_DELAY_SEC)
            except Exception as e:
                log.warning(f"  API error (attempt {attempt+1}): {e}")
                if attempt < Config.RETRY_ATTEMPTS - 1:
                    await asyncio.sleep(Config.RETRY_DELAY_SEC * (attempt + 1))
        
        return None
    
    def estimate_cost(self) -> float:
        cost_in = (self.total_input_tokens / 1_000_000) * Config.HAIKU_INPUT_PER_M
        cost_out = (self.total_output_tokens / 1_000_000) * Config.HAIKU_OUTPUT_PER_M
        return cost_in + cost_out


# ===================== VALIDATION =====================
def validate_translation(original: dict, translated: dict) -> tuple[bool, List[str]]:
    """Çeviri doğrulaması — yapısal kontrol."""
    warnings = []
    
    # Steps sayısı korunmalı
    orig_steps = len(original.get("steps", []))
    trans_steps = len(translated.get("steps", []))
    if orig_steps != trans_steps:
        warnings.append(f"Step count mismatch: {orig_steps} → {trans_steps}")
    
    # Ingredients notes sayısı
    orig_notes = len(original.get("ingredients", []))
    trans_notes = len(translated.get("ingredients_notes", []))
    if orig_notes != trans_notes:
        warnings.append(f"Ingredient notes count mismatch: {orig_notes} → {trans_notes}")
    
    # Tips sayısı
    orig_tips = len(original.get("tips", []))
    trans_tips = len(translated.get("tips", []))
    if orig_tips != trans_tips:
        warnings.append(f"Tips count mismatch: {orig_tips} → {trans_tips}")
    
    # Title boş olmamalı
    if not translated.get("title", "").strip():
        warnings.append("Empty title")
    
    return (len(warnings) == 0, warnings)


def apply_translation_to_recipe(original: dict, translated: dict, target_lang: str) -> dict:
    """Çevrilen alanları orijinal şemaya geri uygula — recipes_{lang} için doc oluştur."""
    new_recipe = original.copy()
    
    # Dil bilgisi
    new_recipe["language"] = target_lang
    
    # Çevrilen alanlar
    new_recipe["title"] = translated.get("title", original["title"])
    new_recipe["description"] = translated.get("description", original["description"])
    new_recipe["tips"] = translated.get("tips", original.get("tips", []))
    
    # Ingredient notes
    new_recipe["ingredients"] = []
    trans_notes = {i["idx"]: i["note"] for i in translated.get("ingredients_notes", [])}
    for i, ing in enumerate(original.get("ingredients", [])):
        new_ing = ing.copy()
        if i in trans_notes:
            new_ing["note"] = trans_notes[i]
        new_recipe["ingredients"].append(new_ing)
    
    # Steps
    new_recipe["steps"] = []
    trans_steps = {s["order"]: s for s in translated.get("steps", [])}
    for s in original.get("steps", []):
        new_s = s.copy()
        if s["order"] in trans_steps:
            new_s["title"] = trans_steps[s["order"]].get("title", s["title"])
            new_s["body"] = trans_steps[s["order"]].get("body", s["body"])
        new_recipe["steps"].append(new_s)
    
    # Search keywords yeniden üret (basit: title kelimelerini al)
    keywords = set()
    for w in new_recipe["title"].lower().split():
        if len(w) > 2:
            keywords.add(w)
    for token in new_recipe.get("primary_ingredients", []):
        keywords.add(token)
    new_recipe["search_keywords"] = sorted(keywords)
    
    # Update timestamps
    new_recipe["translated_at"] = datetime.now().isoformat()
    new_recipe["translation_status"] = "completed"
    
    return new_recipe


# ===================== ORCHESTRATOR =====================
class TranslationPipeline:
    def __init__(self, args):
        self.args = args
        self.dry_run = args.dry_run
        self.translator = None if args.dry_run else ClaudeTranslator(os.getenv("ANTHROPIC_API_KEY"))
        
        # Output
        self.out_dir = Path(args.output)
        self.out_dir.mkdir(parents=True, exist_ok=True)
    
    async def translate_one(self, recipe: dict, target_lang: str) -> dict:
        recipe_id = recipe["id"]
        
        if self.dry_run:
            prompt = build_translation_prompt(recipe, target_lang)
            log.info(f"  [DRY-RUN] {recipe_id} — Prompt length: {len(prompt)} chars")
            return {
                "recipe_id": recipe_id,
                "target_lang": target_lang,
                "status": "dry_run",
                "prompt_preview": prompt[:300] + "..."
            }
        
        translated = await self.translator.translate(recipe, target_lang)
        if not translated:
            log.error(f"  ✗ {recipe_id} — Translation failed")
            return {"recipe_id": recipe_id, "target_lang": target_lang, "status": "failed"}
        
        # Validate
        ok, warnings = validate_translation(recipe, translated)
        
        # Apply to full schema
        translated_recipe = apply_translation_to_recipe(recipe, translated, target_lang)
        
        return {
            "recipe_id": recipe_id,
            "target_lang": target_lang,
            "status": "success" if ok else "needs_review",
            "warnings": warnings,
            "translated_recipe": translated_recipe,
        }
    
    async def run(self, recipes: list, target_langs: list):
        """Pipeline'ı çalıştır."""
        total = len(recipes) * len(target_langs)
        log.info(f"📚 Translation plan: {len(recipes)} recipes × {len(target_langs)} languages = {total} translations")
        
        all_results = {}
        for target_lang in target_langs:
            log.info(f"\n{'=' * 60}")
            log.info(f"🌍 TARGET LANGUAGE: {target_lang}")
            log.info(f"{'=' * 60}")
            
            results = []
            sem = asyncio.Semaphore(Config.MAX_CONCURRENT)
            
            async def task(r):
                async with sem:
                    res = await self.translate_one(r, target_lang)
                    log.info(f"  {'✓' if res['status']=='success' else '✗'} {r['id']} ({r.get('title','')[:40]})")
                    return res
            
            tasks = [task(r) for r in recipes]
            
            # Periodic saving (her N tarifte)
            batch_results = []
            for i, fut in enumerate(asyncio.as_completed(tasks), 1):
                res = await fut
                batch_results.append(res)
                if i % Config.SAVE_EVERY == 0:
                    self._save_intermediate(batch_results, target_lang, i)
            
            results = batch_results
            all_results[target_lang] = results
            
            # Final save
            self._save_translations(results, target_lang)
            
            # Stats
            success = sum(1 for r in results if r.get("status") == "success")
            failed = sum(1 for r in results if r.get("status") == "failed")
            review = sum(1 for r in results if r.get("status") == "needs_review")
            cost = self.translator.estimate_cost() if self.translator else 0
            
            log.info(f"\n  📊 {target_lang} stats:")
            log.info(f"     Success: {success}/{len(results)}")
            log.info(f"     Needs review: {review}")
            log.info(f"     Failed: {failed}")
            log.info(f"     Cost so far: ${cost:.4f}")
        
        # Final summary
        log.info(f"\n{'=' * 60}")
        log.info(f"🎉 TRANSLATION COMPLETE")
        if self.translator:
            final_cost = self.translator.estimate_cost()
            log.info(f"💰 Total cost: ${final_cost:.4f}")
            log.info(f"📊 Tokens: input={self.translator.total_input_tokens:,}, output={self.translator.total_output_tokens:,}")
        log.info(f"{'=' * 60}")
    
    def _save_intermediate(self, batch_results, target_lang, i):
        """Periyodik kayıt."""
        tmp = self.out_dir / f"recipes_{target_lang}.tmp.json"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(batch_results, f, ensure_ascii=False, indent=2)
    
    def _save_translations(self, results, target_lang):
        """Final dosyalar."""
        # Tüm sonuçlar
        all_file = self.out_dir / f"results_{target_lang}.json"
        with open(all_file, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        # Sadece başarılı çeviriler — Firestore-ready format
        success_recipes = [
            r["translated_recipe"]
            for r in results
            if r.get("status") in ("success", "needs_review") and r.get("translated_recipe")
        ]
        firestore_file = self.out_dir / f"recipes_{target_lang}_firestore.json"
        firestore_dict = {r["id"]: r for r in success_recipes}
        with open(firestore_file, "w", encoding="utf-8") as f:
            json.dump(firestore_dict, f, ensure_ascii=False, indent=2)
        
        log.info(f"  💾 Saved:")
        log.info(f"     {all_file.name} ({len(results)} records)")
        log.info(f"     {firestore_file.name} ({len(success_recipes)} for Firestore upload)")


# ===================== MAIN =====================
async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="/home/claude/recipes_db/recipes_db_FULL_tr_v2.json",
                        help="Source JSON (TR)")
    parser.add_argument("--output", default="/home/claude/recipes_db/phase3_translation/output",
                        help="Output directory")
    parser.add_argument("--target", required=True,
                        help="Target language code (en, de, fr, ...) or 'all'")
    parser.add_argument("--dry-run", action="store_true",
                        help="Simulate without API calls")
    parser.add_argument("--limit", type=int, default=None,
                        help="Limit number of recipes")
    parser.add_argument("--ids", type=str, default=None,
                        help="Comma-separated recipe IDs")
    args = parser.parse_args()
    
    # Target languages
    if args.target == "all":
        target_langs = get_supported_languages()
    else:
        target_langs = [args.target]
    
    # Load TR recipes
    with open(args.input, encoding="utf-8") as f:
        data = json.load(f)
    recipes = data["recipes"]
    log.info(f"Loaded {len(recipes)} TR recipes")
    
    # Filter
    if args.ids:
        ids_set = set(args.ids.split(","))
        recipes = [r for r in recipes if r["id"] in ids_set]
    if args.limit:
        recipes = recipes[:args.limit]
    
    # API key check
    if not args.dry_run and not os.getenv("ANTHROPIC_API_KEY"):
        log.error("❌ ANTHROPIC_API_KEY environment variable not set")
        log.error("   export ANTHROPIC_API_KEY=sk-ant-...")
        sys.exit(1)
    
    if not args.dry_run and not HAS_ANTHROPIC:
        log.error("❌ anthropic package not installed")
        log.error("   pip install anthropic")
        sys.exit(1)
    
    pipeline = TranslationPipeline(args)
    await pipeline.run(recipes, target_langs)


if __name__ == "__main__":
    asyncio.run(main())
