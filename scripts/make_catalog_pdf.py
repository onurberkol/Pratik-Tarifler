#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2500 tarifi kategorize ederek resimsiz metin PDF'e topla."""
import json
from collections import defaultdict
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
                                 Table, TableStyle, KeepTogether, Flowable)
from reportlab.pdfgen import canvas as canvaslib
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ---- Turkce destekli fontlari kaydet ----
FONT_DIR = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("DejaVu", f"{FONT_DIR}/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", f"{FONT_DIR}/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("DejaVu-Oblique", f"{FONT_DIR}/DejaVuSans-Oblique.ttf"))
pdfmetrics.registerFontFamily("DejaVu", normal="DejaVu", bold="DejaVu-Bold",
                               italic="DejaVu-Oblique", boldItalic="DejaVu-Bold")
# Font isim eslemeleri
F_REG = "DejaVu"
F_BOLD = "DejaVu-Bold"
F_ITAL = "DejaVu-Oblique"

# ---- Token -> Turkce malzeme sozlugu ----
import sys
sys.path.insert(0, "/home/claude/docs")
from token_tr import token_to_tr

# ---- Veri yukle ----
with open("/home/claude/recipes_db/recipes_db_FULL_tr_v2.json") as f:
    data = json.load(f)
recipes = data if isinstance(data, list) else data.get("recipes", [])
print(f"Toplam tarif: {len(recipes)}")

# ---- Kategori esleme (Turkce) ----
MEAL_TR = {
    "breakfast": "Kahvaltı",
    "soup": "Çorbalar",
    "appetizer": "Başlangıçlar & Mezeler",
    "lunch": "Öğle Yemekleri",
    "dinner": "Ana Yemekler",
    "snack": "Atıştırmalıklar",
    "dessert": "Tatlılar",
}
MEAL_ORDER = ["breakfast", "soup", "appetizer", "lunch", "dinner", "snack", "dessert"]
CUISINE_TR = {
    "turkish": "Türk", "italian": "İtalyan", "mediterranean": "Akdeniz",
    "french": "Fransız", "middle_eastern": "Orta Doğu", "american": "Amerikan",
    "mexican": "Meksika", "indian": "Hint", "spanish": "İspanyol",
    "japanese": "Japon", "thai": "Tayland", "chinese": "Çin",
    "russian": "Rus", "other": "Diğer",
}
DIFF_TR = {"easy": "Kolay", "medium": "Orta", "hard": "Zor"}
DIET_TR = {"vegetarian": "Vejetaryen", "vegan": "Vegan", "gluten_free": "Glutensiz",
           "dairy_free": "Süt İçermez", "nut_free": "Fındık İçermez", "low_carb": "Düşük Karb."}

# ---- Her tarifi tek bir ana kategoriye ata (meal_type onceligine gore) ----
def primary_category(r):
    mts = r.get("meal_type", [])
    for m in MEAL_ORDER:
        if m in mts:
            return m
    return "dinner"

by_cat = defaultdict(list)
for r in recipes:
    by_cat[primary_category(r)].append(r)

# Her kategori icinde alfabetik sirala
for cat in by_cat:
    by_cat[cat].sort(key=lambda r: r.get("title", "").lower())

# ---- Renkler ----
INK   = HexColor("#22180F")
TOMATO= HexColor("#E14328")
HONEY = HexColor("#C2841C")
BASIL = HexColor("#3E8E5A")
SOFT  = HexColor("#7D6E5C")
LINE  = HexColor("#E8DECC")
CREAM = HexColor("#FFF7EC")
BG    = HexColor("#FFFBF5")

# ---- Stiller ----
styles = getSampleStyleSheet()

st_cat = ParagraphStyle("cat", parent=styles["Normal"], fontName=F_BOLD,
                         fontSize=26, textColor=HexColor("#FFFFFF"), leading=30)
st_catnum = ParagraphStyle("catnum", parent=styles["Normal"], fontName=F_REG,
                            fontSize=12, textColor=HexColor("#FFE0D9"), leading=16)
st_title = ParagraphStyle("title", parent=styles["Normal"], fontName=F_BOLD,
                           fontSize=12.5, textColor=INK, leading=15, spaceBefore=8, spaceAfter=2)
st_meta = ParagraphStyle("meta", parent=styles["Normal"], fontName=F_REG,
                          fontSize=8, textColor=SOFT, leading=11, spaceAfter=3)
st_desc = ParagraphStyle("desc", parent=styles["Normal"], fontName=F_ITAL,
                          fontSize=8.5, textColor=HexColor("#5C4E3E"), leading=11.5,
                          spaceAfter=4, alignment=TA_JUSTIFY)
st_sec = ParagraphStyle("sec", parent=styles["Normal"], fontName=F_BOLD,
                         fontSize=8.5, textColor=TOMATO, leading=11, spaceBefore=3, spaceAfter=1)
st_body = ParagraphStyle("body", parent=styles["Normal"], fontName=F_REG,
                          fontSize=8.5, textColor=HexColor("#3D3022"), leading=11.5)
st_ing = ParagraphStyle("ing", parent=styles["Normal"], fontName=F_REG,
                         fontSize=8.5, textColor=HexColor("#3D3022"), leading=12)
st_step = ParagraphStyle("step", parent=styles["Normal"], fontName=F_REG,
                          fontSize=8.5, textColor=HexColor("#3D3022"), leading=12,
                          spaceAfter=2)
st_tip = ParagraphStyle("tip", parent=styles["Normal"], fontName=F_REG,
                         fontSize=8, textColor=HexColor("#2E6B42"), leading=11)

# Kapak stilleri
st_cover_t = ParagraphStyle("ct", parent=styles["Normal"], fontName=F_BOLD,
                             fontSize=44, textColor=HexColor("#FFFFFF"), leading=48,
                             alignment=TA_CENTER)
st_cover_s = ParagraphStyle("cs", parent=styles["Normal"], fontName=F_REG,
                             fontSize=16, textColor=HexColor("#FFE0D9"), leading=24,
                             alignment=TA_CENTER)
st_cover_m = ParagraphStyle("cm", parent=styles["Normal"], fontName=F_REG,
                             fontSize=11, textColor=HexColor("#FFD8CF"), leading=20,
                             alignment=TA_CENTER)
st_toc = ParagraphStyle("toc", parent=styles["Normal"], fontName=F_REG,
                         fontSize=11, textColor=INK, leading=20)
st_h1 = ParagraphStyle("h1", parent=styles["Normal"], fontName=F_BOLD,
                        fontSize=20, textColor=INK, leading=24, spaceAfter=6)


def esc(s):
    """XML escape."""
    if not s:
        return ""
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


# ---- Renkli arka plan / banner Flowable ----
class CatBanner(Flowable):
    """Kategori basligi icin renkli bant."""
    def __init__(self, title, count, width):
        Flowable.__init__(self)
        self.title = title
        self.count = count
        self.width = width
        self.height = 56

    def draw(self):
        c = self.canv
        c.setFillColor(TOMATO)
        c.roundRect(0, 0, self.width, self.height, 8, fill=1, stroke=0)
        c.setFillColor(HexColor("#FFFFFF"))
        c.setFont(F_BOLD, 22)
        c.drawString(18, 26, self.title)
        c.setFillColor(HexColor("#FFE0D9"))
        c.setFont(F_REG, 11)
        c.drawString(18, 10, f"{self.count} tarif")


class HRule(Flowable):
    """Tarifler arasi ince ayrac."""
    def __init__(self, width):
        Flowable.__init__(self)
        self.width = width
        self.height = 6

    def draw(self):
        c = self.canv
        c.setStrokeColor(LINE)
        c.setLineWidth(0.6)
        c.line(0, 3, self.width, 3)


# ---- Sayfa dekoratoru (header/footer) ----
PAGE_W, PAGE_H = A4

def on_page(canvas, doc):
    canvas.saveState()
    # arka plan
    canvas.setFillColor(BG)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # ust baslik
    canvas.setFont(F_REG, 7.5)
    canvas.setFillColor(HexColor("#B5AB99"))
    canvas.drawString(20*mm, PAGE_H - 12*mm, "PRATİK TARİFLER — 2500 Tarif Kataloğu")
    # alt sayfa no
    canvas.drawRightString(PAGE_W - 20*mm, 12*mm, f"{doc.page}")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(20*mm, PAGE_H - 14*mm, PAGE_W - 20*mm, PAGE_H - 14*mm)
    canvas.line(20*mm, 15*mm, PAGE_W - 20*mm, 15*mm)
    canvas.restoreState()


def on_cover(canvas, doc):
    canvas.saveState()
    # kirmizi gradient benzeri (duz katmanlar)
    steps = 60
    for i in range(steps):
        t = i / steps
        r = int(0xE1 + (0x9C - 0xE1) * t)
        g = int(0x43 + (0x2E - 0x43) * t)
        b = int(0x28 + (0x1A - 0x28) * t)
        canvas.setFillColorRGB(r/255, g/255, b/255)
        canvas.rect(0, PAGE_H * (1 - (i+1)/steps), PAGE_W, PAGE_H/steps + 1,
                    fill=1, stroke=0)
    # dekoratif halka
    canvas.setStrokeColorRGB(1, 1, 1, 0.08)
    canvas.setLineWidth(48)
    canvas.circle(PAGE_W - 30*mm, PAGE_H - 40*mm, 90*mm, fill=0, stroke=1)
    canvas.restoreState()


# ---- Icerik olustur ----
story = []

# === KAPAK ===
story.append(Spacer(1, 170))
story.append(Paragraph("Pratik Tarifler", st_cover_t))
story.append(Spacer(1, 8))
story.append(Paragraph("2500 Tarif Kataloğu", st_cover_s))
story.append(Spacer(1, 30))
story.append(Paragraph("Kategorilere Ayrılmış Tam Tarif Koleksiyonu<br/>"
                        "Malzemeler · Hazırlanış Adımları · Püf Noktaları",
                        st_cover_m))
story.append(Spacer(1, 50))
story.append(Paragraph("14 Dünya Mutfağı  ·  7 Ana Kategori  ·  Sürüm 1.0 — 2026",
                        ParagraphStyle("cm2", parent=st_cover_m, fontSize=10,
                                       textColor=HexColor("#FFD8CF"))))
story.append(PageBreak())

# === ICINDEKILER ===
story.append(Spacer(1, 10))
story.append(Paragraph("İçindekiler", st_h1))
story.append(Spacer(1, 6))

# istatistik tablosu
total = len(recipes)
diff_count = defaultdict(int)
diet_count = defaultdict(int)
prem = 0
for r in recipes:
    diff_count[r.get("difficulty", "?")] += 1
    if r.get("is_premium"):
        prem += 1
    for d in r.get("diet_tags", []):
        diet_count[d] += 1

toc_rows = [["Kategori", "Tarif Sayısı"]]
for cat in MEAL_ORDER:
    if cat in by_cat:
        toc_rows.append([MEAL_TR[cat], str(len(by_cat[cat]))])
toc_rows.append(["TOPLAM", str(total)])

toc_tbl = Table(toc_rows, colWidths=[110*mm, 50*mm])
toc_tbl.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), TOMATO),
    ("TEXTCOLOR", (0,0), (-1,0), HexColor("#FFFFFF")),
    ("FONTNAME", (0,0), (-1,0), F_BOLD),
    ("FONTNAME", (0,1), (-1,-1), F_REG),
    ("FONTNAME", (0,-1), (-1,-1), F_BOLD),
    ("FONTSIZE", (0,0), (-1,-1), 10),
    ("TEXTCOLOR", (0,1), (-1,-1), INK),
    ("BACKGROUND", (0,-1), (-1,-1), CREAM),
    ("ROWBACKGROUNDS", (0,1), (-1,-2), [HexColor("#FFFFFF"), HexColor("#FAF4E8")]),
    ("GRID", (0,0), (-1,-1), 0.5, LINE),
    ("TOPPADDING", (0,0), (-1,-1), 7),
    ("BOTTOMPADDING", (0,0), (-1,-1), 7),
    ("LEFTPADDING", (0,0), (-1,-1), 12),
]))
story.append(toc_tbl)
story.append(Spacer(1, 20))

# ozet istatistikler
story.append(Paragraph("Koleksiyon Özeti", ParagraphStyle("h2", parent=st_h1, fontSize=14)))
story.append(Spacer(1, 4))

stat_rows = [
    ["Zorluk Dağılımı", f"Kolay: {diff_count.get('easy',0)}  ·  "
                        f"Orta: {diff_count.get('medium',0)}  ·  "
                        f"Zor: {diff_count.get('hard',0)}"],
    ["Diyet Etiketleri", f"Vejetaryen: {diet_count.get('vegetarian',0)}  ·  "
                         f"Vegan: {diet_count.get('vegan',0)}  ·  "
                         f"Glutensiz: {diet_count.get('gluten_free',0)}"],
    ["Erişim", f"Ücretsiz: {total - prem}  ·  Premium: {prem}"],
    ["Mutfak Çeşitliliği", "14 farklı dünya mutfağı"],
]
stat_tbl = Table(stat_rows, colWidths=[55*mm, 105*mm])
stat_tbl.setStyle(TableStyle([
    ("FONTNAME", (0,0), (0,-1), F_BOLD),
    ("FONTNAME", (1,0), (1,-1), F_REG),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("TEXTCOLOR", (0,0), (0,-1), TOMATO),
    ("TEXTCOLOR", (1,0), (1,-1), INK),
    ("ROWBACKGROUNDS", (0,0), (-1,-1), [HexColor("#FFFFFF"), HexColor("#FAF4E8")]),
    ("GRID", (0,0), (-1,-1), 0.5, LINE),
    ("TOPPADDING", (0,0), (-1,-1), 7),
    ("BOTTOMPADDING", (0,0), (-1,-1), 7),
    ("LEFTPADDING", (0,0), (-1,-1), 12),
]))
story.append(stat_tbl)
story.append(Spacer(1, 16))
story.append(Paragraph(
    "Bu katalog, Pratik Tarifler uygulamasının 2500 tariflik veritabanının tam metin "
    "dökümüdür. Tarifler yedi ana kategoriye ayrılmış, her kategori içinde alfabetik "
    "sıralanmıştır. Her tarif; özet bilgileri, malzeme listesi, adım adım hazırlanışı "
    "ve varsa püf noktalarıyla birlikte verilmiştir.",
    st_desc))
story.append(PageBreak())

# === KATEGORILER ===
content_width = PAGE_W - 40*mm

for cat in MEAL_ORDER:
    if cat not in by_cat:
        continue
    cat_recipes = by_cat[cat]

    # Kategori banner
    story.append(CatBanner(MEAL_TR[cat], len(cat_recipes), content_width))
    story.append(Spacer(1, 10))

    for idx, r in enumerate(cat_recipes):
        block = []
        # Baslik
        title = esc(r.get("title", "İsimsiz Tarif"))
        prem_tag = '  <font color="#C2841C">★ PREMIUM</font>' if r.get("is_premium") else ""
        block.append(Paragraph(f"{title}{prem_tag}", st_title))

        # Meta satiri
        cuisine = CUISINE_TR.get(r.get("cuisine", ""), r.get("cuisine", ""))
        diff = DIFF_TR.get(r.get("difficulty", ""), r.get("difficulty", ""))
        tt = r.get("total_time_min", "?")
        sv = r.get("servings", "?")
        rating = r.get("rating_avg", "")
        meta = f"{cuisine} Mutfağı  |  {diff}  |  {tt} dk  |  {sv} kişilik"
        if rating:
            meta += f"  |  Puan {rating}"
        diets = [DIET_TR.get(d, d) for d in r.get("diet_tags", [])]
        if diets:
            meta += f"  |  {', '.join(diets)}"
        block.append(Paragraph(esc(meta), st_meta))

        # Aciklama
        desc = r.get("description", "")
        if desc:
            block.append(Paragraph(esc(desc), st_desc))

        # Malzemeler
        ings = r.get("ingredients", [])
        if ings:
            block.append(Paragraph("MALZEMELER", st_sec))
            ing_lines = []
            for ing in ings:
                amount = esc(ing.get("amount", ""))
                note = esc(ing.get("note", ""))
                tok = ing.get("token", "")
                tok_tr = esc(token_to_tr(tok))
                # Turkce gosterim: not varsa "malzeme (not)", yoksa sadece malzeme
                if note:
                    name = f"{tok_tr} <font color='#7D6E5C'>({note})</font>"
                else:
                    name = tok_tr
                line = f"&bull; {amount} {name}".strip()
                ing_lines.append(line)
            block.append(Paragraph("<br/>".join(ing_lines), st_ing))

        # Hazirlanis
        steps = r.get("steps", [])
        if steps:
            block.append(Paragraph("HAZIRLANIŞI", st_sec))
            for s in sorted(steps, key=lambda x: x.get("order", 0)):
                num = s.get("order", "")
                stitle = esc(s.get("title", ""))
                sbody = esc(s.get("body", ""))
                timer = s.get("timer_sec")
                tinfo = ""
                if timer:
                    mins = timer // 60
                    secs = timer % 60
                    if mins and secs:
                        tinfo = f' <font color="#7D6E5C">[süre: {mins} dk {secs} sn]</font>'
                    elif mins:
                        tinfo = f' <font color="#7D6E5C">[süre: {mins} dk]</font>'
                    else:
                        tinfo = f' <font color="#7D6E5C">[süre: {secs} sn]</font>'
                head = f'<b>{num}. {stitle}</b>' if stitle else f'<b>{num}.</b>'
                block.append(Paragraph(f"{head} {sbody}{tinfo}", st_step))

        # Ipuclari
        tips = r.get("tips", [])
        if tips:
            block.append(Paragraph("PÜF NOKTALARI", st_sec))
            tip_lines = [f"&bull; {esc(t)}" for t in tips]
            block.append(Paragraph("<br/>".join(tip_lines), st_tip))

        # Ayrac
        if idx < len(cat_recipes) - 1:
            block.append(Spacer(1, 5))
            block.append(HRule(content_width))
            block.append(Spacer(1, 3))

        # Tarif blogunu birlikte tut (mumkunse bolme)
        story.append(KeepTogether(block))

    story.append(PageBreak())

# ---- PDF olustur ----
doc = SimpleDocTemplate(
    "/home/claude/docs/output/05_Tarif_Katalogu_TR.pdf",
    pagesize=A4,
    topMargin=18*mm, bottomMargin=18*mm,
    leftMargin=20*mm, rightMargin=20*mm,
    title="Pratik Tarifler - 2500 Tarif Kataloğu",
    author="Pratik Tarifler",
)

# Kapak ilk sayfa farkli dekoratorle
def first_page(canvas, doc):
    on_cover(canvas, doc)

def later_pages(canvas, doc):
    on_page(canvas, doc)

doc.build(story, onFirstPage=first_page, onLaterPages=later_pages)
print("PDF olusturuldu: 05_Tarif_Katalogu_TR.pdf")
