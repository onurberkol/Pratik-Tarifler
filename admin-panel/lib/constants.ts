// Pratik Tarifler — sistem sabitleri

export const CUISINES = [
  { id: "turkish", label: "Türk", emoji: "🇹🇷" },
  { id: "italian", label: "İtalyan", emoji: "🇮🇹" },
  { id: "mediterranean", label: "Akdeniz", emoji: "🫒" },
  { id: "french", label: "Fransız", emoji: "🇫🇷" },
  { id: "middle_eastern", label: "Orta Doğu", emoji: "🥙" },
  { id: "american", label: "Amerikan", emoji: "🇺🇸" },
  { id: "mexican", label: "Meksika", emoji: "🌮" },
  { id: "indian", label: "Hint", emoji: "🇮🇳" },
  { id: "spanish", label: "İspanyol", emoji: "🇪🇸" },
  { id: "japanese", label: "Japon", emoji: "🍣" },
  { id: "thai", label: "Tayland", emoji: "🇹🇭" },
  { id: "chinese", label: "Çin", emoji: "🇨🇳" },
  { id: "russian", label: "Rus", emoji: "🇷🇺" },
  { id: "other", label: "Diğer", emoji: "🌍" },
] as const;

export const MEAL_TYPES = [
  { id: "breakfast", label: "Kahvaltı" },
  { id: "soup", label: "Çorba" },
  { id: "appetizer", label: "Başlangıç" },
  { id: "lunch", label: "Öğle" },
  { id: "dinner", label: "Ana Yemek" },
  { id: "snack", label: "Atıştırmalık" },
  { id: "dessert", label: "Tatlı" },
] as const;

export const DIFFICULTY = [
  { id: "easy", label: "Kolay", color: "text-green-600" },
  { id: "medium", label: "Orta", color: "text-yellow-600" },
  { id: "hard", label: "Zor", color: "text-red-600" },
] as const;

export const DIET_TAGS = [
  { id: "vegetarian", label: "Vejetaryen" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten_free", label: "Glutensiz" },
  { id: "dairy_free", label: "Süt İçermez" },
  { id: "nut_free", label: "Fındık İçermez" },
  { id: "low_carb", label: "Düşük Karb." },
] as const;

export const LANGUAGES = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "el", label: "Ελληνικά", flag: "🇬🇷" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "sr", label: "Српски", flag: "🇷🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦", rtl: true },
  { code: "he", label: "עברית", flag: "🇮🇱", rtl: true },
] as const;

export const SUBSCRIPTION_STATUS = {
  free: { label: "Ücretsiz", color: "bg-gray-100 text-gray-700" },
  trial: { label: "Deneme", color: "bg-blue-100 text-blue-700" },
  active: { label: "Aktif", color: "bg-green-100 text-green-700" },
  cancelled: { label: "İptal", color: "bg-orange-100 text-orange-700" },
  expired: { label: "Süresi Doldu", color: "bg-red-100 text-red-700" },
} as const;
