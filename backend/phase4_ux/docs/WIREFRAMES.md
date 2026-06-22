# 📐 Pratik Tarifler — Ekran Wireframe'leri (ASCII)

> Her ekran için piksel-perfect olmasa da kompozisyon doğru ASCII çizim.

---

## 🏠 1. MODE SELECTION SCREEN (Ana Ekran)

```
┌─────────────────────────────────────────────┐
│  ☰  Pratik Tarifler              🔔  ⚙️       │ ← TopBar
├─────────────────────────────────────────────┤
│                                             │
│   Bugün ne pişirelim?                       │ ← Başlık 28pt
│   Sana özel tarifler bekliyor               │ ← Subtitle 14pt
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  🥘                                  │   │ ← Mod 1 Kartı
│   │                                      │   │   (140pt yükseklik)
│   │  EVDEKİ KALANLARLA                  │   │
│   │  YAPACAĞIM                          │   │
│   │                                      │   │
│   │  Buzdolabı fotoğrafı  →             │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  🛒                                  │   │ ← Mod 2 Kartı
│   │                                      │   │
│   │  1-2 EK MALZEME                     │   │
│   │  ALABİLİRİM                         │   │
│   │                                      │   │
│   │  Daha geniş seçenek  →              │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  🌍                                  │   │ ← Mod 3 Kartı
│   │                                      │   │
│   │  SINIRSIZ KEŞFEDEYİM                │   │
│   │                                      │   │
│   │  2500 tarif arası  →                │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   Bugünün önerisi:                          │
│   ┌──────┐ ┌──────┐ ┌──────┐                │ ← Quick suggest
│   │ İmg  │ │ İmg  │ │ İmg  │                │   (yatay scroll)
│   └──────┘ └──────┘ └──────┘                │
│                                             │
├─────────────────────────────────────────────┤
│  🏠   🔍   ⭐   👤                            │ ← Tab Bar
└─────────────────────────────────────────────┘
```

**State'ler:**
- Default: 3 kart eşit boyutta
- Son seçilen mod: hafif highlighted (subtle border accent)
- İlk açılış: Mod 1 üzerinde animated pulse (öğretici)

---

## 📸 2. PANTRY INPUT SCREEN (Mod 1 Girişi)

```
┌─────────────────────────────────────────────┐
│  ← Geri          Evdeki Kalanlar           │
├─────────────────────────────────────────────┤
│                                             │
│   Malzemelerini nasıl ekleyeceksin?         │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │                                      │   │
│   │           📸                         │   │ ← Tıklanabilir
│   │                                      │   │   büyük buton
│   │   BUZDOLABI FOTOĞRAFI ÇEK           │   │
│   │   AI senin için bulsun               │   │
│   │                                      │   │
│   │   [Premium: 3/3 hak kaldı]          │   │ ← Free user
│   │                                      │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ─────────  veya  ─────────                │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  ✍️  MALZEMELERİ KENDİM YAZAYIM      │   │ ← Manuel giriş
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  🗄️  KAYITLI BUZDOLABIM (12 ürün)   │   │ ← Önceden kayıt
│   └─────────────────────────────────────┘   │
│                                             │
│   💡 İpucu: Fotoğraf için dolabın           │
│      kapağını açıp tüm rafları çek          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📷 3. PHOTO CAMERA SCREEN

```
┌─────────────────────────────────────────────┐
│  ✕                                  ⚙️      │ ← Light overlay
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│                                             │
│                                             │
│         [   CAMERA VIEWFINDER   ]            │ ← Full screen camera
│                                             │
│         ┌─────────────────┐                 │
│         │                 │                 │ ← Çerçeve overlay
│         │  Dolabını       │                 │
│         │  buraya         │                 │
│         │  doğrult        │                 │
│         │                 │                 │
│         └─────────────────┘                 │
│                                             │
│                                             │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│    🖼️       [  ⭕ ]      🔄                  │ ← Galeri | Çek | Flash
│  Galeri    (büyük)    Flip                  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✅ 4. PHOTO REVIEW SCREEN (Vision Sonucu)

```
┌─────────────────────────────────────────────┐
│  ← Geri      Fotoğraf İncelemesi             │
├─────────────────────────────────────────────┤
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │                                      │   │
│   │      [çekilen fotoğraf, blur]        │   │ ← Thumbnail 200pt
│   │   ✓ 8 malzeme tespit edildi          │   │
│   │                                      │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   Tespit edilen malzemeler:                 │
│   (eksik olanları kaldır, eksikleri ekle)   │
│                                             │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│   │ 🥚 Yumur ✕│ │ 🍅 Domat ✕│ │ 🧅 Soğan ✕│   │ ← Silinebilir chip
│   └──────────┘ └──────────┘ └──────────┘    │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│   │ 🧀 Peyni ✕│ │ 🍞 Ekmek ✕│ │ 🥒 Salat ✕│   │
│   └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  + Eksik malzeme ekle               │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   💡 İpucu: Daha fazla malzeme = daha       │
│      fazla tarif önerisi                    │
│                                             │
├─────────────────────────────────────────────┤
│   ┌─────────────────────────────────────┐   │
│   │   🍳  TARIFLERI GÖSTER (8 malzeme)   │   │ ← Primary CTA
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## ✍️ 5. INGREDIENT LIST SCREEN (Manuel Giriş)

```
┌─────────────────────────────────────────────┐
│  ← Geri        Malzemelerin                  │
├─────────────────────────────────────────────┤
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  🔍 Malzeme ara... (yumurta, soğan)│   │ ← Otomatik tamamla
│   └─────────────────────────────────────┘   │
│                                             │
│   Hızlı ekle (sık kullanılanlar):           │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│   │ 🥚   │ │ 🧅   │ │ 🍅   │ │ 🧀   │       │ ← Sık kullanılan
│   │ Yum  │ │ Soğ  │ │ Dom  │ │ Pey  │       │   chip'ler
│   └──────┘ └──────┘ └──────┘ └──────┘       │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│   │ 🥩   │ │ 🐔   │ │ 🥔   │ │ 🍚   │       │
│   │ Et   │ │ Tav  │ │ Pat  │ │ Pir  │       │
│   └──────┘ └──────┘ └──────┘ └──────┘       │
│                                             │
│   ────────────────────────────────────       │
│                                             │
│   Seçtiklerin (5):                          │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│   │ Yumurta ✕│ │ Soğan ✕  │ │ Domates ✕│   │ ← Silinebilir
│   └──────────┘ └──────────┘ └──────────┘    │
│   ┌──────────┐ ┌──────────┐                 │
│   │ Peynir ✕ │ │ Ekmek ✕  │                 │
│   └──────────┘ └──────────┘                 │
│                                             │
├─────────────────────────────────────────────┤
│   ┌─────────────────────────────────────┐   │
│   │   🍳  TARIFLERI GÖSTER  (5)          │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🍳 6. PANTRY RESULTS SCREEN (Mod 1 Sonuçları)

```
┌─────────────────────────────────────────────┐
│  ← Geri  8 malzemenle yapılabilecek (12)    │
├─────────────────────────────────────────────┤
│                                             │
│  Sıralama: [En uygun ▼] [Süre] [Zorluk]     │ ← Filter chips
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ┌──────┐                             │    │
│  │ │ İMG  │  Menemen                    │    │ ← Recipe card
│  │ │      │  ⭐ 4.8  ⏱ 15dk  Kolay      │    │   (110pt yükseklik)
│  │ │      │                              │    │
│  │ │      │  ✓ Tüm malzemen var (5/5)   │    │ ← Mod 1 özel
│  │ └──────┘                             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ┌──────┐                             │    │
│  │ │ İMG  │  Sahanda Yumurta            │    │
│  │ │      │  ⭐ 4.6  ⏱ 10dk  Kolay      │    │
│  │ │      │                              │    │
│  │ │      │  ✓ Tüm malzemen var (3/3)   │    │
│  │ └──────┘                             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ┌──────┐                             │    │
│  │ │ İMG  │  Domates Çorbası            │    │
│  │ │      │  ⭐ 4.5  ⏱ 25dk  Kolay      │    │
│  │ │      │                              │    │
│  │ │      │  ✓ Tüm malzemen var (4/4)   │    │
│  │ └──────┘                             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  💡 1-2 malzeme daha alabilirsen 25         │
│     tarif daha açılır                       │ ← Cross-sell Mod 2
│  ┌─────────────────────────────────────┐    │
│  │  🛒  Mod 2'ye geç                   │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🛒 7. SUPPLY RESULTS SCREEN (Mod 2 Sonuçları)

```
┌─────────────────────────────────────────────┐
│  ← Geri  Tedarik ile 25 tarif               │
├─────────────────────────────────────────────┤
│                                             │
│  Sıralama: [Az eksik ▼] [Süre]              │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ┌──────┐                             │    │
│  │ │ İMG  │  Tavuk Sote                 │    │
│  │ │      │  ⭐ 4.7  ⏱ 30dk  Orta       │    │
│  │ │      │                              │    │
│  │ │      │  🛒 1 eksik: tavuk göğüs    │    │ ← Mod 2 özel
│  │ │      │     [Markete ekle]           │    │   (shopping btn)
│  │ └──────┘                             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ┌──────┐                             │    │
│  │ │ İMG  │  Mantarlı Risotto           │    │
│  │ │      │  ⭐ 4.6  ⏱ 35dk  Orta       │    │
│  │ │      │                              │    │
│  │ │      │  🛒 2 eksik: mantar, parm   │    │
│  │ │      │     [Markete ekle]           │    │
│  │ └──────┘                             │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │  📋  Toplu Alışveriş Listesi (8)    │    │ ← Bottom action
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## 🌍 8. DISCOVER SCREEN (Mod 3)

```
┌─────────────────────────────────────────────┐
│  Sınırsız Keşfet                       🔍   │
├─────────────────────────────────────────────┤
│                                             │
│  Bugünün Tarifi                             │
│  ┌─────────────────────────────────────┐    │
│  │                                      │    │
│  │      [Büyük tarif görsel 16:9]       │    │ ← Hero card
│  │                                      │    │
│  │  Iskender Kebap                      │    │
│  │  ⭐ 4.9  ⏱ 45dk  Orta                │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Mutfaklar                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │ ← Yatay scroll
│  │ 🇹🇷  │ │ 🇮🇹  │ │ 🇫🇷  │ │ 🇲🇽  │        │
│  │ Türk │ │ İtl  │ │ Frn  │ │ Mks  │        │
│  └──────┘ └──────┘ └──────┘ └──────┘        │
│                                             │
│  Hızlı (15dk altı)                          │
│  ┌──────┐ ┌──────┐ ┌──────┐                 │ ← Yatay scroll
│  │ İMG  │ │ İMG  │ │ İMG  │                 │
│  │ Card │ │ Card │ │ Card │                 │
│  └──────┘ └──────┘ └──────┘                 │
│                                             │
│  Vejetaryen Favoriler                       │
│  ┌──────┐ ┌──────┐ ┌──────┐                 │
│  │ İMG  │ │ İMG  │ │ İMG  │                 │
│  └──────┘ └──────┘ └──────┘                 │
│                                             │
│  Türk Tatlıları                             │
│  ┌──────┐ ┌──────┐ ┌──────┐                 │
│  │ İMG  │ │ İMG  │ │ İMG  │                 │
│  └──────┘ └──────┘ └──────┘                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔍 9. SEARCH SCREEN (Filtreli Arama)

```
┌─────────────────────────────────────────────┐
│  🔍 Tarif ara...                       ✕    │
├─────────────────────────────────────────────┤
│                                             │
│  Filtreler                          [Sıfır] │
│                                             │
│  Mutfak:                                    │
│  [Türk ✓] [İtalyan] [Akdeniz] [Tümü]        │
│                                             │
│  Yemek Türü:                                │
│  [Çorba] [Akşam] [Kahvaltı] [Tatlı]         │
│                                             │
│  Diyet:                                     │
│  [Vejetaryen] [Vegan] [Glutensiz]           │
│                                             │
│  Süre: ←──────●──────────→  30 dk          │ ← Slider
│                                             │
│  Zorluk:                                    │
│  [Kolay ✓] [Orta] [Zor]                     │
│                                             │
│  ─────────────────────────────────           │
│                                             │
│  142 tarif bulundu                          │
│                                             │
│  ┌────┐ ┌────┐                              │ ← Grid layout
│  │İMG │ │İMG │                              │   (2 sütun)
│  └────┘ └────┘                              │
│  Mercim  Yayla                              │
│  ⭐ 4.8  ⭐ 4.7                              │
│                                             │
│  ┌────┐ ┌────┐                              │
│  │İMG │ │İMG │                              │
│  └────┘ └────┘                              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📖 10. RECIPE DETAIL SCREEN

```
┌─────────────────────────────────────────────┐
│  ← Geri              ⭐  ⋮                  │ ← Float over image
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │                                      │    │
│  │      [Büyük tarif görsel 4:3]        │    │ ← 280pt
│  │                                      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Mercimek Çorbası                           │ ← H1 22pt
│  ⭐ 4.8 (1.2K oy)                            │
│                                             │
│  Hafif, doyurucu, klasik bir Türk           │ ← Description
│  çorbası. Yıllardır sevilen.                │
│                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │ ← Meta cards
│  │ ⏱   │ │ 👥  │ │ 🌶️  │ │ 🌿  │            │
│  │ 35dk│ │ 4   │ │Kolay│ │Vegn │            │
│  └─────┘ └─────┘ └─────┘ └─────┘            │
│                                             │
│  Malzemeler                       2x  4x  6x│ ← Servis ayar
│  ●  1 su bardağı kırmızı mercimek           │
│  ●  1 adet soğan                            │
│  ●  1 yk salça                              │
│  ●  ...                                     │
│                                             │
│  Adımlar                                    │
│  ① Soğan kavur     (5 dk)                  │
│  ② Su + mercimek   (20 dk) ⏲              │ ← Timer var
│  ③ Tuz + biber                              │
│  ④ Üst yağ        (2 dk)                   │
│                                             │
│  İpuçları                                   │
│  💡 Limon ekleyince mineral emilimi artar   │
│  💡 Üzerine nane + tereyağı klasiktir       │
│                                             │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │   🍳  PİŞİRMEYE BAŞLA               │    │ ← Primary CTA
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## 🍳 11. COOK MODE SCREEN (Pişirme Modu)

```
┌─────────────────────────────────────────────┐
│  ✕  Adım 2/4                          🔊    │ ← Sesli ozumi kapat
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│                                             │
│       Adım 2: Mercimek pişir               │ ← Büyük yazı 24pt
│                                             │
│       Soğan üzerine 5 su bardağı su         │ ← Talimat 18pt
│       ve mercimekleri ekle. Kaynayınca       │
│       kıs ateşte 20 dakika pişir.           │
│                                             │
│                                             │
│         ┌─────────────────┐                 │
│         │                 │                 │
│         │   ⏲  18:23      │                 │ ← Geri sayım timer
│         │                 │                 │
│         │   [Başlat][Dur] │                 │
│         └─────────────────┘                 │
│                                             │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  ◀ Önceki            Sonraki ▶              │
└─────────────────────────────────────────────┘
```

**Cook mode özellikleri:**
- Screen wake-lock (ekran kapanmasın)
- Sesli okuma (TTS) — eller meşgul olduğunda
- Önceki/sonraki adım navigasyon
- Otomatik timer

---

## 📋 12. PANTRY MANAGEMENT (Profil > Buzdolabım)

```
┌─────────────────────────────────────────────┐
│  ← Geri        Kayıtlı Buzdolabım          │
├─────────────────────────────────────────────┤
│                                             │
│  Mevcut malzemeler (12):                    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 🥚 Yumurta            6 adet     ✕  │    │
│  │ 🛒 6 Mayıs eklendi                  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 🍅 Domates            500 g       ✕ │    │
│  │ 🛒 5 Mayıs eklendi                  │    │
│  │ ⚠️  Yarın sonu                       │    │ ← Expiration uyarısı
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 🧀 Beyaz peynir       250 g       ✕ │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│   ┌─────────────────────────────────────┐   │
│   │  +  Malzeme Ekle                    │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🎨 ÖZEL UI BİLEŞENLERİ

### Recipe Card (Liste)
```
┌─────────────────────────────────────────┐
│ ┌──────────┐                            │ ← 80×80 thumb
│ │   IMG    │  Recipe Title              │   sol
│ │ blurhash │  ⭐ 4.8  ⏱ 30dk  Kolay     │
│ │  load    │                             │
│ │          │  [varsa Mode-specific bilg]│
│ └──────────┘  💚                         │ ← Favorite icon
└─────────────────────────────────────────┘
```

### Ingredient Chip
```
┌──────────────────┐
│ 🥚 Yumurta    ✕  │ ← Tıklanırsa removed
└──────────────────┘
```

### Mode Card (Mode Selection)
```
┌───────────────────────────────────────┐
│ ┌──┐                                  │
│ │📷│  ← Icon büyük (48pt)              │
│ └──┘                                  │
│                                       │
│ EVDEKİ KALANLARLA                     │
│ YAPACAĞIM                             │
│                                       │
│ Buzdolabı fotoğrafı...    →           │
└───────────────────────────────────────┘
```

---

Bu wireframe'lere göre kodu yazıyoruz. Sıradaki: TypeScript tipler + Cloud Functions + React Native ekranlar.
