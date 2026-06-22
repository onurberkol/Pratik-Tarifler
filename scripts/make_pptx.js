// Pratik Tarifler - Urun Sunumu v2 (RecipeBox tarzi, yeni palet)
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Pratik Tarifler";
pres.title = "Pratik Tarifler - Urun Sunumu";

// Yeni sicak palet
const C = {
  tomato:"E14328", tomatoD:"C2371F", honey:"F4A024", basil:"3E8E5A",
  ink:"22180F", inkSoft:"7D6E5C", cream:"FFF3E0", bg:"FFFBF5",
  white:"FFFFFF", line:"F0E7D8", darkCard:"2A2118",
};
const A = "/home/claude/docs/assets";
const shadow = () => ({ type:"outer", color:"22180F", blur:9, offset:3, angle:135, opacity:0.16 });

// === SLAYT 1 - KAPAK ===
let s = pres.addSlide();
s.background = { path:`${A}/bg_tomato.png` };
s.addShape(pres.shapes.OVAL, { x:9.5, y:-2.2, w:6, h:6, fill:{color:"FFFFFF",transparency:92} });
s.addText("🍳", { x:0.7, y:0.55, w:2, h:1.5, fontSize:74, margin:0 });
s.addText("URUN SUNUMU · 2026", { x:0.75, y:2.05, w:8, h:0.4, fontSize:13, color:"FFD8CF", bold:true, charSpacing:4, margin:0 });
s.addText("Pratik Tarifler", { x:0.7, y:2.4, w:10, h:1.5, fontSize:66, color:C.white, bold:true, fontFace:"Georgia", margin:0 });
s.addText("Buzdolabini cek, yapay zeka ne pisirecegini soylesin.", { x:0.75, y:3.95, w:9, h:0.6, fontSize:22, color:"FFE8E2", margin:0 });
s.addShape(pres.shapes.RECTANGLE, { x:0.75, y:4.7, w:1.2, h:0.07, fill:{color:C.honey} });
s.addText("Turkiye'nin ilk AI destekli akilli mutfak asistani", { x:0.75, y:4.9, w:8, h:0.5, fontSize:14, color:"FFE0D9", margin:0 });
s.addText("2500+ Tarif    ·    14 Mutfak    ·    13 Dil    ·    3 Akilli Mod", { x:0.75, y:6.6, w:10, h:0.4, fontSize:13, color:C.white, bold:true, margin:0 });

// === SLAYT 2 - PROBLEM ===
s = pres.addSlide();
s.background = { path:`${A}/bg_light.png` };
s.addText("PROBLEM", { x:0.7, y:0.55, w:4, h:0.4, fontSize:14, color:C.tomato, bold:true, charSpacing:3, margin:0 });
s.addText("Her gun sorulan bir soru", { x:0.7, y:0.95, w:11, h:0.9, fontSize:38, color:C.ink, bold:true, fontFace:"Georgia", margin:0 });
s.addText("\u201CAksam ne pisirsem?\u201D", { x:0.7, y:1.85, w:11, h:0.7, fontSize:26, color:C.tomatoD, italic:true, margin:0 });
const probs = [
  ["😩","Karar Yorgunlugu","Her gun ne pisirilecegine karar vermek zihinsel yuk yaratir."],
  ["🗑️","Gida Israfi","Buzdolabindaki malzemeler kullanilmadan curuyup atilir."],
  ["💸","Gereksiz Harcama","Evde malzeme varken markete gidilir, fazla para harcanir."],
  ["🔍","Zayif Arama","Tarif siteleri \u201Celimde su var\u201D mantigiyla arama yapamaz."],
];
probs.forEach((p,i)=>{
  const x = 0.7 + i*3.05;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:2.95, w:2.8, h:3.2, fill:{color:C.white}, rectRadius:0.14, shadow:shadow() });
  s.addText(p[0], { x, y:3.2, w:2.8, h:0.9, fontSize:40, align:"center", margin:0 });
  s.addText(p[1], { x:x+0.2, y:4.15, w:2.4, h:0.6, fontSize:15, color:C.ink, bold:true, align:"center", margin:0 });
  s.addText(p[2], { x:x+0.25, y:4.75, w:2.3, h:1.2, fontSize:11, color:C.inkSoft, align:"center", margin:0 });
});
s.addText("Sonuc: zaman kaybi, para kaybi ve milyonlarca ton gida israfi.", { x:0.7, y:6.45, w:11.5, h:0.5, fontSize:14, color:C.inkSoft, italic:true, margin:0 });

// === SLAYT 3 - COZUM ===
s = pres.addSlide();
s.background = { path:`${A}/bg_dark.png` };
s.addText("COZUM", { x:0.7, y:0.55, w:4, h:0.4, fontSize:14, color:C.honey, bold:true, charSpacing:3, margin:0 });
s.addText("Pratik Tarifler", { x:0.7, y:0.95, w:11, h:0.9, fontSize:40, color:C.white, bold:true, fontFace:"Georgia", margin:0 });
s.addText("Yapay zeka, buzdolabindaki malzemelerden yola cikarak sana ne pisirebilecegini soyler. Markete gitmeden, israf etmeden, akillica.", { x:0.7, y:1.85, w:11.5, h:0.9, fontSize:17, color:"D8CCBE", margin:0 });
const sols = [
  ["📸","Cek","Buzdolabi fotografini cek - AI 60+ malzemeyi tanisin"],
  ["🤖","Kesfet","Niyetine uygun moddan sana ozel tarifler onerilsin"],
  ["👨‍🍳","Pisir","Pisirme modunda buyuk yazi ve sayacla rahatca pisir"],
];
sols.forEach((p,i)=>{
  const x = 0.9 + i*4.0;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:3.0, w:3.6, h:3.3, fill:{color:C.darkCard}, rectRadius:0.14, line:{color:"4A3A2C",width:1} });
  s.addShape(pres.shapes.OVAL, { x:x+1.3, y:3.35, w:1.0, h:1.0, fill:{color:C.tomato} });
  s.addText(p[0], { x:x+1.3, y:3.43, w:1.0, h:0.85, fontSize:30, align:"center", margin:0 });
  s.addText(p[1], { x:x+0.2, y:4.5, w:3.2, h:0.5, fontSize:20, color:C.honey, bold:true, align:"center", margin:0 });
  s.addText(p[2], { x:x+0.35, y:5.05, w:2.9, h:1.1, fontSize:12, color:"D8CCBE", align:"center", margin:0 });
  if(i<2) s.addText("→", { x:x+3.55, y:4.3, w:0.5, h:0.5, fontSize:24, color:C.tomato, bold:true, margin:0 });
});
s.addText("Turkiye'nin ilk AI destekli mutfak asistani", { x:0.7, y:6.7, w:11, h:0.4, fontSize:13, color:C.honey, bold:true, align:"center", margin:0 });

// === SLAYT 4 - 3 MOD ===
s = pres.addSlide();
s.background = { path:`${A}/bg_light.png` };
s.addText("TEMEL OZELLIK", { x:0.7, y:0.5, w:4, h:0.4, fontSize:14, color:C.tomato, bold:true, charSpacing:3, margin:0 });
s.addText("3 Akilli Kesif Modu", { x:0.7, y:0.88, w:11, h:0.8, fontSize:36, color:C.ink, bold:true, fontFace:"Georgia", margin:0 });
s.addText("Kullanicinin niyeti her zaman ayni degil - Pratik Tarifler uc moda sahip.", { x:0.7, y:1.65, w:11.5, h:0.5, fontSize:14, color:C.inkSoft, margin:0 });
const modes = [
  [C.honey,"🥘","MOD 1","Evdeki Kalanlarla","Buzdolabi fotografini cek. AI yalnizca tamami elinde olan tarifleri onerir. Sifir eksik, sifir israf."],
  [C.basil,"🛒","MOD 2","1-2 Ek Malzemeyle","Eldekilere ek 1-3 malzemeye kadar tarifler. Eksikler ve tahmini fiyatlari gosterilir."],
  [C.tomato,"🌍","MOD 3","Sinirsiz Kesfet","2500 tariflik havuzda gez. Mutfak, ogun, diyet, sure filtreleriyle ara."],
];
modes.forEach((m,i)=>{
  const y = 2.35 + i*1.55;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:0.7, y, w:11.9, h:1.4, fill:{color:C.white}, rectRadius:0.12, shadow:shadow() });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:0.95, y:y+0.2, w:1.0, h:1.0, fill:{color:m[0]}, rectRadius:0.14 });
  s.addText(m[1], { x:0.95, y:y+0.27, w:1.0, h:0.85, fontSize:34, align:"center", margin:0 });
  s.addText(m[2], { x:2.25, y:y+0.18, w:3, h:0.35, fontSize:11, color:C.inkSoft, bold:true, charSpacing:1, margin:0 });
  s.addText(m[3], { x:2.25, y:y+0.45, w:4, h:0.5, fontSize:19, color:C.ink, bold:true, fontFace:"Georgia", margin:0 });
  s.addText(m[4], { x:6.4, y:y+0.22, w:6.0, h:1.0, fontSize:12.5, color:C.inkSoft, valign:"middle", margin:0 });
});

// === SLAYT 5 - NASIL CALISIR (yeni mockup) ===
s = pres.addSlide();
s.background = { path:`${A}/bg_light.png` };
s.addText("KULLANIM AKISI", { x:0.7, y:0.5, w:4, h:0.4, fontSize:14, color:C.tomato, bold:true, charSpacing:3, margin:0 });
s.addText("Buzdolabindan Sofraya", { x:0.7, y:0.88, w:11, h:0.8, fontSize:36, color:C.ink, bold:true, fontFace:"Georgia", margin:0 });
s.addImage({ path:`${A}/v2_screen_02.png`, x:0.8, y:1.9, h:4.9, w:2.26, shadow:shadow() });
s.addImage({ path:`${A}/v2_screen_04.png`, x:3.3, y:1.9, h:4.9, w:2.26, shadow:shadow() });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:6.1, y:2.0, w:6.5, h:4.7, fill:{color:C.white}, rectRadius:0.12, shadow:shadow() });
const steps = [
  ["1","Buzdolabini Cek","Dolabin fotografini cek. AI raflari tarayip 60+ malzeme turunu saniyeler icinde tanir."],
  ["2","Sonucu Onayla","Bulunan malzemeler chip olarak listelenir. Yanlisi kaldir, eksigi manuel ekle."],
  ["3","Tarifini Sec ve Pisir","Sana ozel tarifler aninda listelenir. Pisirme moduna gec, rahatca pisir."],
];
steps.forEach((st,i)=>{
  const y = 2.35 + i*1.45;
  s.addShape(pres.shapes.OVAL, { x:6.4, y, w:0.55, h:0.55, fill:{color:C.tomato} });
  s.addText(st[0], { x:6.4, y:y+0.02, w:0.55, h:0.5, fontSize:18, color:C.white, bold:true, align:"center", margin:0 });
  s.addText(st[1], { x:7.15, y:y-0.05, w:5.2, h:0.4, fontSize:16, color:C.ink, bold:true, margin:0 });
  s.addText(st[2], { x:7.15, y:y+0.32, w:5.2, h:0.9, fontSize:11.5, color:C.inkSoft, margin:0 });
});

// === SLAYT 6 - OZELLIK SETI ===
s = pres.addSlide();
s.background = { path:`${A}/bg_light.png` };
s.addText("OZELLIK SETI", { x:0.7, y:0.5, w:4, h:0.4, fontSize:14, color:C.tomato, bold:true, charSpacing:3, margin:0 });
s.addText("Eksiksiz Mutfak Asistani", { x:0.7, y:0.88, w:11, h:0.8, fontSize:36, color:C.ink, bold:true, fontFace:"Georgia", margin:0 });
const feats = [
  ["📸","AI Gorsel Tanima","Buzdolabi fotografindan otomatik malzeme tespiti"],
  ["🛍️","Akilli Alisveris Listesi","Eksikleri tek listede topla, marketteyken takip et"],
  ["👨‍🍳","Pisirme Modu","Buyuk yazi, otomatik sayac, sesli okuma"],
  ["🌐","13 Dil Destegi","RTL destegiyle dunya capinda kullanim"],
  ["🥗","Diyet Filtreleri","Vejetaryen, vegan, glutensiz kolayca filtrele"],
  ["📴","Cevrimdisi Erisim","Favori tarifler internet olmadan erisilebilir"],
];
feats.forEach((f,i)=>{
  const col=i%3, row=Math.floor(i/3);
  const x=0.7+col*4.05, y=2.0+row*2.35;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w:3.8, h:2.1, fill:{color:C.white}, rectRadius:0.12, shadow:shadow() });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:x+0.3, y:y+0.3, w:0.75, h:0.75, fill:{color:C.cream}, rectRadius:0.12 });
  s.addText(f[0], { x:x+0.3, y:y+0.34, w:0.75, h:0.65, fontSize:22, align:"center", margin:0 });
  s.addText(f[1], { x:x+0.3, y:y+1.15, w:3.2, h:0.45, fontSize:14, color:C.ink, bold:true, margin:0 });
  s.addText(f[2], { x:x+0.3, y:y+1.55, w:3.2, h:0.5, fontSize:10.5, color:C.inkSoft, margin:0 });
});

// === SLAYT 7 - HEDEF KITLE ===
s = pres.addSlide();
s.background = { path:`${A}/bg_light.png` };
s.addText("HEDEF KITLE", { x:0.7, y:0.5, w:4, h:0.4, fontSize:14, color:C.tomato, bold:true, charSpacing:3, margin:0 });
s.addText("Kimler Kullanir?", { x:0.7, y:0.88, w:11, h:0.8, fontSize:36, color:C.ink, bold:true, fontFace:"Georgia", margin:0 });
const personas = [
  ["👩‍💼","Calisan Ebeveyn","25-45 yas","Is cikisi hizli, pratik cozum ariyor. Aileye saglikli yemek yetistirmek istiyor ama zamani kisitli."],
  ["🧑‍🎓","Ogrenci / Bekar","20-35 yas","Butcesi sinirli, israf istemiyor. Az malzemeyle pratik tarifler ariyor."],
  ["🌍","Mutfak Meraklisi","Her yas","Yeni tatlar, dunya mutfaklari kesfetmeyi seviyor. Premium tariflere ilgi duyuyor."],
];
personas.forEach((p,i)=>{
  const x=0.7+i*4.05;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:2.1, w:3.8, h:4.3, fill:{color:C.white}, rectRadius:0.14, shadow:shadow() });
  s.addText(p[0], { x, y:2.45, w:3.8, h:1.1, fontSize:48, align:"center", margin:0 });
  s.addText(p[1], { x:x+0.2, y:3.7, w:3.4, h:0.5, fontSize:18, color:C.ink, bold:true, align:"center", margin:0 });
  s.addText(p[2], { x:x+0.2, y:4.15, w:3.4, h:0.4, fontSize:11, color:C.tomato, bold:true, align:"center", margin:0 });
  s.addText(p[3], { x:x+0.35, y:4.6, w:3.1, h:1.6, fontSize:11.5, color:C.inkSoft, align:"center", margin:0 });
});

// === SLAYT 8 - PAZAR ===
s = pres.addSlide();
s.background = { path:`${A}/bg_light.png` };
s.addText("PAZAR FIRSATI", { x:0.7, y:0.5, w:4, h:0.4, fontSize:14, color:C.tomato, bold:true, charSpacing:3, margin:0 });
s.addText("Neden Simdi?", { x:0.7, y:0.88, w:11, h:0.8, fontSize:36, color:C.ink, bold:true, fontFace:"Georgia", margin:0 });
const stats = [["%64","Tariflerin kolay\nseviyede olmasi"],["14","Desteklenen\ndunya mutfagi"],["~$50","Aylik altyapi\nmaliyeti (10K MAU)"],["8x","Hedeflenen\nLTV / CAC orani"]];
stats.forEach((st,i)=>{
  const x=0.7+i*3.05;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:2.0, w:2.8, h:1.9, fill:{color:C.tomato}, rectRadius:0.12, shadow:shadow() });
  s.addText(st[0], { x, y:2.2, w:2.8, h:0.85, fontSize:38, color:C.white, bold:true, align:"center", margin:0 });
  s.addText(st[1], { x:x+0.2, y:3.05, w:2.4, h:0.75, fontSize:11, color:"FFE0D9", align:"center", margin:0 });
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:0.7, y:4.2, w:5.85, h:2.4, fill:{color:C.white}, rectRadius:0.12, shadow:shadow() });
s.addText("🤖", { x:1.0, y:4.45, w:0.9, h:0.7, fontSize:30, margin:0 });
s.addText("AI Teknolojisi Olgunlasti", { x:1.95, y:4.5, w:4.4, h:0.5, fontSize:15, color:C.ink, bold:true, margin:0 });
s.addText("Gorsel tanima teknolojisi artik mobil cihazlarda erisilebilir ve uygun maliyetli. Birkac yil once bu urun mumkun degildi.", { x:1.0, y:5.15, w:5.3, h:1.3, fontSize:11.5, color:C.inkSoft, margin:0 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:6.75, y:4.2, w:5.85, h:2.4, fill:{color:C.white}, rectRadius:0.12, shadow:shadow() });
s.addText("📉", { x:7.05, y:4.45, w:0.9, h:0.7, fontSize:30, margin:0 });
s.addText("Gida Israfi Bilinci Artiyor", { x:8.0, y:4.5, w:4.4, h:0.5, fontSize:15, color:C.ink, bold:true, margin:0 });
s.addText("Ekonomik baskilar nedeniyle tuketiciler gida israfini onlemeye her zamankinden daha istekli. Pratik Tarifler tam bu noktada.", { x:7.05, y:5.15, w:5.3, h:1.3, fontSize:11.5, color:C.inkSoft, margin:0 });

// === SLAYT 9 - RAKIP ANALIZI ===
s = pres.addSlide();
s.background = { path:`${A}/bg_light.png` };
s.addText("REKABET", { x:0.7, y:0.5, w:4, h:0.4, fontSize:14, color:C.tomato, bold:true, charSpacing:3, margin:0 });
s.addText("Rakiplerden Ayrisma", { x:0.7, y:0.88, w:11, h:0.8, fontSize:36, color:C.ink, bold:true, fontFace:"Georgia", margin:0 });
const compRows = [
  [{text:"Ozellik",options:{bold:true,color:C.white,fill:{color:C.ink}}},
   {text:"Geleneksel\nTarif Siteleri",options:{bold:true,color:C.white,fill:{color:C.ink}}},
   {text:"Yabanci AI\nUygulamalari",options:{bold:true,color:C.white,fill:{color:C.ink}}},
   {text:"Pratik Tarifler",options:{bold:true,color:C.white,fill:{color:C.tomato}}}],
  ["AI buzdolabi tarama","Yok","Var","Var"],
  ["3 niyet bazli mod","Yok","Yok","Var"],
  ["Turk mutfagi uzmanligi","Kismi","Zayif","Guclu (1077 tarif)"],
  ["13 dil + RTL destegi","Kismi","Kismi","Var"],
  ["Ucretsiz baslangic","Var","Genelde yok","Var"],
];
s.addTable(compRows, { x:0.7, y:2.0, w:11.9, colW:[3.5,2.8,2.8,2.8], rowH:0.72, fontSize:12,
  color:C.ink, valign:"middle", align:"center", border:{pt:1,color:C.line}, fill:{color:C.white} });
s.addText("Pratik Tarifler, yerel mutfak uzmanligi ile global AI teknolojisini birlestiren tek urundur.", { x:0.7, y:6.5, w:11.5, h:0.5, fontSize:13, color:C.inkSoft, italic:true, margin:0 });

// === SLAYT 10 - FIYATLANDIRMA ===
s = pres.addSlide();
s.background = { path:`${A}/bg_light.png` };
s.addText("IS MODELI", { x:0.7, y:0.5, w:4, h:0.4, fontSize:14, color:C.tomato, bold:true, charSpacing:3, margin:0 });
s.addText("Freemium Fiyatlandirma", { x:0.7, y:0.88, w:11, h:0.8, fontSize:36, color:C.ink, bold:true, fontFace:"Georgia", margin:0 });
const plans = [
  ["UCRETSIZ","0 TL","sonsuza dek",C.white,C.ink,false,["Gunde 3 buzdolabi taramasi","20 favori tarif","Tum 3 mod erisimi","1998 ucretsiz tarif"]],
  ["YILLIK PREMIUM","399 TL","yillik · ayda ~33 TL",C.darkCard,C.white,true,["Sinirsiz buzdolabi tarama","Sinirsiz favori","500+ premium tarif","Reklamsiz deneyim","Alisveris listesi disa aktarma"]],
  ["AYLIK PREMIUM","49 TL","aylik",C.white,C.ink,false,["Tum premium ozellikler","Esnek - her ay yenilenir","Istedigin zaman iptal","7 gun ucretsiz deneme"]],
];
plans.forEach((p,i)=>{
  const x=0.7+i*4.05, featured=p[5];
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:2.05, w:3.8, h:4.5, fill:{color:p[3]}, rectRadius:0.14,
    shadow:shadow(), line:featured?{color:C.honey,width:2.5}:{color:C.line,width:1} });
  if(featured){
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:x+1.0, y:1.85, w:1.8, h:0.4, fill:{color:C.honey}, rectRadius:0.08 });
    s.addText("EN POPULER", { x:x+1.0, y:1.87, w:1.8, h:0.35, fontSize:9, color:C.white, bold:true, align:"center", margin:0 });
  }
  s.addText(p[0], { x:x+0.2, y:2.35, w:3.4, h:0.4, fontSize:13, color:featured?C.honey:C.inkSoft, bold:true, align:"center", margin:0 });
  s.addText(p[1], { x:x+0.2, y:2.7, w:3.4, h:0.7, fontSize:34, color:featured?C.honey:C.tomato, bold:true, align:"center", fontFace:"Georgia", margin:0 });
  s.addText(p[2], { x:x+0.2, y:3.4, w:3.4, h:0.35, fontSize:10, color:p[4]==C.white?"D8CCBE":C.inkSoft, align:"center", margin:0 });
  const items = p[6].map(t=>({text:t,options:{bullet:true,breakLine:true,color:p[4],fontSize:10.5,paraSpaceAfter:6}}));
  s.addText(items, { x:x+0.4, y:3.9, w:3.0, h:2.5, margin:0 });
});

// === SLAYT 11 - YOL HARITASI ===
s = pres.addSlide();
s.background = { path:`${A}/bg_light.png` };
s.addText("YOL HARITASI", { x:0.7, y:0.5, w:4, h:0.4, fontSize:14, color:C.tomato, bold:true, charSpacing:3, margin:0 });
s.addText("Pazara Cikis Plani", { x:0.7, y:0.88, w:11, h:0.8, fontSize:36, color:C.ink, bold:true, fontFace:"Georgia", margin:0 });
s.addShape(pres.shapes.LINE, { x:1.4, y:3.6, w:10.5, h:0, line:{color:C.tomato,width:2.5} });
const ms = [
  ["Hafta 1-2","Icerik Uretimi","Gorsel batch pipeline + 12 dile ceviri",C.honey],
  ["Hafta 3-4","Beta Programi","TestFlight ile 100 tester, bug ayiklama",C.basil],
  ["Hafta 5","Magaza Yayini","App Store + Google Play onay sureci","4A7A9C"],
  ["Hafta 6+","Lansman","Pazarlama kampanyasi, buyume optimizasyonu",C.tomato],
];
ms.forEach((m,i)=>{
  const x=1.0+i*2.95;
  s.addShape(pres.shapes.OVAL, { x:x+0.85, y:3.35, w:0.5, h:0.5, fill:{color:m[3]}, line:{color:C.white,width:2.5} });
  const cardY = (i%2===0)?1.85:3.95;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:cardY, w:2.6, h:1.5, fill:{color:C.white}, rectRadius:0.12, shadow:shadow() });
  s.addText(m[0], { x:x+0.2, y:cardY+0.15, w:2.2, h:0.35, fontSize:12, color:m[3], bold:true, margin:0 });
  s.addText(m[1], { x:x+0.2, y:cardY+0.45, w:2.2, h:0.4, fontSize:15, color:C.ink, bold:true, margin:0 });
  s.addText(m[2], { x:x+0.2, y:cardY+0.82, w:2.25, h:0.65, fontSize:9.5, color:C.inkSoft, margin:0 });
});
s.addText("Tahmini toplam pazara cikis suresi: 6 hafta", { x:0.7, y:5.95, w:11.5, h:0.5, fontSize:15, color:C.tomato, bold:true, align:"center", margin:0 });
s.addText("Ilk 30 gun hedefi:  10.000 indirme   ·   250 premium abone   ·   4.3+ puan ortalamasi", { x:0.7, y:6.5, w:11.9, h:0.5, fontSize:12, color:C.inkSoft, align:"center", margin:0 });

// === SLAYT 12 - KAPANIS ===
s = pres.addSlide();
s.background = { path:`${A}/bg_dark.png` };
s.addText("🍳", { x:5.9, y:1.0, w:1.5, h:1.2, fontSize:54, align:"center", margin:0 });
s.addText("Mutfakta yapay zeka\ncagi basliyor.", { x:1.0, y:2.2, w:11.3, h:1.7, fontSize:44, color:C.white, bold:true, fontFace:"Georgia", align:"center", margin:0 });
s.addText("Pratik Tarifler - buzdolabindan sofraya, akillica.", { x:1.0, y:3.9, w:11.3, h:0.6, fontSize:18, color:C.honey, align:"center", margin:0 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:3.4, y:4.8, w:6.5, h:1.0, fill:{color:C.tomato}, rectRadius:0.5 });
s.addText("Urun production'a hazir · Pazara cikis: 6 hafta", { x:3.4, y:4.95, w:6.5, h:0.7, fontSize:15, color:C.white, bold:true, align:"center", margin:0 });
s.addText("🌐  pratiktarifler.app        📧  destek@pratiktarifler.app", { x:1.0, y:6.4, w:11.3, h:0.5, fontSize:13, color:"A89578", align:"center", margin:0 });

pres.writeFile({ fileName:"/home/claude/docs/output/04_Urun_Sunumu_TR.pptx" })
  .then(()=>console.log("OK 04_Urun_Sunumu_TR.pptx - 12 slayt guncellendi"))
  .catch(e=>{console.error("HATA:",e);process.exit(1);});
