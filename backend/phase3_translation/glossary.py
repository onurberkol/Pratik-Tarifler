"""
Pratik Tarifler — Translation Glossary
==========================================
Her dil için tutarlı çeviri terimleri sözlüğü.
Bu sözlük her çeviri prompt'una eklenir, Claude'un bu kelimeleri 
HEPSİNDE aynı şekilde çevirmesini sağlar.

Kullanım:
    from glossary import get_glossary
    terms = get_glossary('en')
    # → dict of TR → EN translations
"""

# ============================================================
# 1. ÖZGÜN TÜRK YEMEK İSİMLERİ (TÜM DİLLERDE AYNI KALIR)
# ============================================================
KEEP_ORIGINAL = [
    # Ana yemekler
    "menemen", "pide", "lahmacun", "döner", "kebap", "kebab",
    "köfte", "manti", "mantı", "dolma", "sarma", "musakka",
    "imam bayıldı", "karnıyarık", "hünkar beğendi",
    
    # Hamur işleri
    "börek", "böreği", "su böreği", "sigara böreği", "talaş böreği",
    "katmer", "açma", "simit", "poğaça", "gözleme", "bazlama",
    
    # Tatlılar
    "baklava", "künefe", "kadayıf", "lokum", "halva", "helva",
    "şekerpare", "revani", "kazandibi", "muhallebi", "sütlaç",
    "aşure", "tulumba", "ekmek kadayıfı",
    
    # İçecekler
    "ayran", "rakı", "raki", "boza", "salep", "şalgam",
    
    # Mutfak terimleri
    "saç", "sahan", "tandır", "köz", "yufka",
    
    # Çorbalar
    "tarhana", "düğün çorbası", "ezogelin", "yayla çorbası",
    
    # Soslar/baharatlar
    "yoğurt", "tahin", "pekmez", "sumak", "pul biber", "isot",
    "nar ekşisi", "biber salçası",
    
    # Peynirler
    "kaşar", "lor", "ezine", "tulum",
]

# Tarif başlığında: ilk geçişte (yöre — açıklama) eklenir
# Örn: "Adana Kebab (spicy minced meat kebab from southern Turkey)"
DISH_EXPLANATIONS = {
    "menemen": {
        "en": "Turkish scrambled eggs with peppers and tomatoes",
        "de": "Türkisches Rührei mit Paprika und Tomaten",
        "fr": "Œufs brouillés à la turque aux poivrons",
        "es": "Huevos revueltos turcos con pimientos",
        "it": "Uova strapazzate alla turca",
        "ar": "البيض المخفوق التركي بالفلفل",
    },
    "lahmacun": {
        "en": "Turkish flatbread with spiced minced meat",
        "de": "Türkische Fladen mit Hackfleisch",
        "fr": "Pizza turque à la viande hachée épicée",
        "es": "Pizza turca con carne picada especiada",
        "it": "Pizza turca con carne macinata speziata",
        "ar": "خبز مسطح تركي باللحم المفروم",
    },
    "köfte": {
        "en": "Turkish meatballs",
        "de": "Türkische Hackbällchen",
        "fr": "Boulettes turques",
        "es": "Albóndigas turcas",
        "it": "Polpette turche",
        "ar": "كفتة تركية",
    },
    "manti": {
        "en": "Turkish dumplings with yogurt",
        "de": "Türkische Teigtaschen mit Joghurt",
        "fr": "Raviolis turcs au yaourt",
        "es": "Ravioles turcos con yogur",
        "ar": "مانتي تركية بالزبادي",
    },
    "börek": {
        "en": "Turkish layered pastry",
        "de": "Türkische Blätterteigtaschen",
        "fr": "Feuilleté turc",
        "es": "Hojaldre turco",
        "ar": "بوريك تركي",
    },
    "baklava": {
        "en": "phyllo dough dessert with nuts and syrup",
        "de": "Blätterteig-Süßspeise mit Nüssen und Sirup",
        "fr": "pâtisserie en pâte phyllo aux noix et sirop",
        "ar": "بقلاوة",
    },
    "künefe": {
        "en": "shredded phyllo dessert with cheese and syrup",
        "de": "Käse-Dessert mit Engelshaar-Teig",
        "fr": "dessert au fromage et cheveux d'ange",
    },
    "ayran": {
        "en": "Turkish yogurt drink",
        "de": "Türkisches Joghurtgetränk",
        "fr": "boisson au yaourt turque",
        "es": "bebida de yogur turca",
        "ar": "عيران",
    },
}


# ============================================================
# 2. PİŞİRME EYLEMLERİ — KONSİSTENS GLOSSARY
# ============================================================
COOKING_VERBS = {
    "kavur": {
        "en": "sauté",
        "de": "anbraten",
        "fr": "faire revenir",
        "es": "saltear",
        "it": "soffriggere",
        "pt": "saltear",
        "el": "σοτάρω",
        "nl": "fruiten",
        "ru": "обжарить",
        "sr": "пропржити",
        "ar": "اقلي",
        "he": "להקפיץ",
    },
    "haşla": {
        "en": "boil",
        "de": "kochen",
        "fr": "faire bouillir",
        "es": "hervir",
        "it": "bollire",
        "pt": "ferver",
        "el": "βράζω",
        "nl": "koken",
        "ru": "варить",
        "sr": "кувати",
        "ar": "اغلي",
        "he": "להרתיח",
    },
    "kıs ateşte pişir": {
        "en": "simmer over low heat",
        "de": "bei niedriger Hitze köcheln",
        "fr": "mijoter à feu doux",
        "es": "cocinar a fuego lento",
        "it": "sobbollire a fuoco lento",
    },
    "yoğur": {
        "en": "knead",
        "de": "kneten",
        "fr": "pétrir",
        "es": "amasar",
        "it": "impastare",
    },
    "çırp": {
        "en": "whisk",
        "de": "schlagen",
        "fr": "fouetter",
        "es": "batir",
        "it": "sbattere",
    },
    "dilim": {
        "en": "slice",
        "de": "in Scheiben schneiden",
        "fr": "trancher",
        "es": "rebanar",
        "it": "affettare",
    },
    "küp doğra": {
        "en": "dice",
        "de": "würfeln",
        "fr": "couper en dés",
        "es": "cortar en dados",
        "it": "tagliare a cubetti",
    },
    "altın olana kadar": {
        "en": "until golden",
        "de": "bis goldbraun",
        "fr": "jusqu'à doré",
        "es": "hasta dorar",
        "it": "fino a doratura",
    },
    "demlen": {
        "en": "let it rest, covered",
        "de": "abgedeckt ruhen lassen",
        "fr": "laisser reposer couvert",
        "es": "dejar reposar tapado",
    },
    "kayna": {
        "en": "bring to a boil",
        "de": "zum Kochen bringen",
        "fr": "porter à ébullition",
        "es": "llevar a ebullición",
    },
}


# ============================================================
# 3. ÖLÇÜ BİRİMLERİ — LOKALİZASYON
# ============================================================
UNIT_LOCALIZATION = {
    "su bardağı": {
        "en": "cup (240 ml)",
        "de": "Tasse (240 ml)",
        "fr": "tasse (240 ml)",
        "es": "taza (240 ml)",
        "it": "tazza (240 ml)",
        "pt": "xícara (240 ml)",
        "el": "φλιτζάνι (240 ml)",
        "nl": "kop (240 ml)",
        "ru": "стакан (240 мл)",
        "sr": "шоља (240 мл)",
        "ar": "كوب (240 مل)",
        "he": "כוס (240 מ\"ל)",
    },
    "çay bardağı": {
        "en": "tea glass (100 ml)",
        "de": "Teeglas (100 ml)",
        "fr": "verre à thé (100 ml)",
        "es": "vaso de té (100 ml)",
    },
    "yemek kaşığı": {
        "en": "tablespoon",
        "de": "Esslöffel",
        "fr": "cuillère à soupe",
        "es": "cucharada",
        "it": "cucchiaio",
        "pt": "colher de sopa",
        "el": "κουταλιά της σούπας",
        "nl": "eetlepel",
        "ru": "столовая ложка",
        "sr": "кашика",
        "ar": "ملعقة كبيرة",
        "he": "כף",
    },
    "çay kaşığı": {
        "en": "teaspoon",
        "de": "Teelöffel",
        "fr": "cuillère à café",
        "es": "cucharadita",
        "it": "cucchiaino",
        "pt": "colher de chá",
        "el": "κουταλάκι",
        "nl": "theelepel",
        "ru": "чайная ложка",
        "sr": "кашичица",
        "ar": "ملعقة صغيرة",
        "he": "כפית",
    },
    "tutam": {
        "en": "pinch",
        "de": "Prise",
        "fr": "pincée",
        "es": "pizca",
        "it": "pizzico",
    },
    "diş": {  # "3 diş sarımsak" — "garlic clove"
        "en": "clove",
        "de": "Zehe",
        "fr": "gousse",
        "es": "diente",
        "it": "spicchio",
    },
    "adet": {  # genelde sayı + isim — "1 onion" yeterli, "adet" gerekmez
        "en": "",  # boş bırak, "1 onion"
        "de": "",
        "fr": "",
        "es": "",
    },
    "demet": {  # "1 demet maydanoz" → "1 bunch parsley"
        "en": "bunch",
        "de": "Bund",
        "fr": "bouquet",
        "es": "manojo",
        "it": "mazzo",
    },
}


# ============================================================
# 4. DİYET ETİKETLERİ (UI GÖSTERİMİ İÇİN)
# ============================================================
DIET_LABELS = {
    "vegetarian": {
        "en": "Vegetarian",
        "de": "Vegetarisch",
        "fr": "Végétarien",
        "es": "Vegetariano",
        "it": "Vegetariano",
        "pt": "Vegetariano",
        "el": "Χορτοφαγικό",
        "nl": "Vegetarisch",
        "ru": "Вегетарианское",
        "sr": "Вегетаријанско",
        "ar": "نباتي",
        "he": "צמחוני",
        "tr": "Vejetaryen",
    },
    "vegan": {
        "en": "Vegan",
        "de": "Vegan",
        "fr": "Végan",
        "es": "Vegano",
        "it": "Vegano",
        "ar": "نباتي صرف",
        "he": "טבעוני",
        "tr": "Vegan",
    },
    "gluten_free": {
        "en": "Gluten-Free",
        "de": "Glutenfrei",
        "fr": "Sans gluten",
        "es": "Sin gluten",
        "it": "Senza glutine",
        "ar": "خالٍ من الغلوتين",
        "he": "ללא גלוטן",
        "tr": "Glutensiz",
    },
}


# ============================================================
# 5. MEAL TYPE ETİKETLERİ
# ============================================================
MEAL_TYPE_LABELS = {
    "breakfast": {"en": "Breakfast", "de": "Frühstück", "fr": "Petit-déjeuner", "es": "Desayuno", "it": "Colazione", "tr": "Kahvaltı", "ar": "إفطار"},
    "lunch": {"en": "Lunch", "de": "Mittagessen", "fr": "Déjeuner", "es": "Almuerzo", "it": "Pranzo", "tr": "Öğle yemeği"},
    "dinner": {"en": "Dinner", "de": "Abendessen", "fr": "Dîner", "es": "Cena", "it": "Cena", "tr": "Akşam yemeği"},
    "snack": {"en": "Snack", "de": "Snack", "fr": "Collation", "es": "Tentempié", "it": "Spuntino", "tr": "Atıştırmalık"},
    "appetizer": {"en": "Appetizer", "de": "Vorspeise", "fr": "Entrée", "es": "Aperitivo", "it": "Antipasto", "tr": "Meze"},
    "soup": {"en": "Soup", "de": "Suppe", "fr": "Soupe", "es": "Sopa", "it": "Zuppa", "tr": "Çorba"},
    "dessert": {"en": "Dessert", "de": "Dessert", "fr": "Dessert", "es": "Postre", "it": "Dolce", "tr": "Tatlı"},
}


# ============================================================
# 6. CUISINE LABELLER
# ============================================================
CUISINE_LABELS = {
    "turkish": {"en": "Turkish", "de": "Türkisch", "fr": "Turc", "es": "Turca", "it": "Turca", "ar": "تركي", "tr": "Türk"},
    "italian": {"en": "Italian", "de": "Italienisch", "fr": "Italien", "es": "Italiana", "it": "Italiana", "tr": "İtalyan"},
    "mediterranean": {"en": "Mediterranean", "de": "Mediterran", "fr": "Méditerranéen", "es": "Mediterránea", "tr": "Akdeniz"},
    "middle_eastern": {"en": "Middle Eastern", "de": "Nahöstlich", "fr": "Moyen-Oriental", "es": "Medio Oriente", "tr": "Orta Doğu"},
    "french": {"en": "French", "de": "Französisch", "fr": "Français", "es": "Francesa", "tr": "Fransız"},
    "american": {"en": "American", "de": "Amerikanisch", "fr": "Américain", "es": "Americana", "tr": "Amerikan"},
    "mexican": {"en": "Mexican", "tr": "Meksika"},
    "indian": {"en": "Indian", "tr": "Hint"},
    "spanish": {"en": "Spanish", "tr": "İspanyol"},
    "japanese": {"en": "Japanese", "tr": "Japon"},
    "chinese": {"en": "Chinese", "tr": "Çin"},
    "thai": {"en": "Thai", "tr": "Tay"},
    "russian": {"en": "Russian", "tr": "Rus"},
    "other": {"en": "Other", "tr": "Diğer"},
}


# ============================================================
# UTILITY FONKSIYONLAR
# ============================================================
def get_glossary_terms_for_prompt(target_lang: str) -> str:
    """Çeviri promptuna eklenecek glossary string'i üret."""
    lines = ["IMPORTANT TERM TRANSLATIONS:"]
    
    # Pişirme eylemleri
    lines.append("\nCooking verbs:")
    for tr, translations in COOKING_VERBS.items():
        if target_lang in translations:
            lines.append(f"  - {tr} → {translations[target_lang]}")
    
    # Ölçüler
    lines.append("\nMeasurements:")
    for tr, translations in UNIT_LOCALIZATION.items():
        if target_lang in translations and translations[target_lang]:
            lines.append(f"  - {tr} → {translations[target_lang]}")
    
    # Sabit kalan Türk yemek isimleri
    lines.append("\nKeep these Turkish dish names IN ORIGINAL FORM (do not translate):")
    lines.append("  " + ", ".join(KEEP_ORIGINAL))
    
    return "\n".join(lines)


def get_supported_languages():
    return ["en", "de", "fr", "it", "es", "pt", "el", "nl", "ru", "sr", "ar", "he"]


if __name__ == "__main__":
    # Test
    print("=" * 60)
    print("GLOSSARY for English (en):")
    print("=" * 60)
    print(get_glossary_terms_for_prompt("en"))
    print(f"\n\nTotal cooking verbs: {len(COOKING_VERBS)}")
    print(f"Total unit translations: {len(UNIT_LOCALIZATION)}")
    print(f"Total preserved dish names: {len(KEEP_ORIGINAL)}")
    print(f"Supported languages: {get_supported_languages()}")
