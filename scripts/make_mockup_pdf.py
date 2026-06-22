#!/usr/bin/env python3
"""Yeni tasarim 8 mockup ekranini PDF'e donustur."""
import asyncio, os
from playwright.async_api import async_playwright

os.makedirs("/home/claude/docs/output", exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        html = """<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8">
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;font-family:'Plus Jakarta Sans',sans-serif;}
        .serif{font-family:'Fraunces',serif;}
        .page{width:100%;height:100vh;page-break-after:always;display:flex;
          flex-direction:column;align-items:center;justify-content:center;
          background:#FFFBF5;padding:38px;}
        .cover{background:linear-gradient(160deg,#E14328 0%,#C2371F 55%,#9C2E1A 100%);color:#FFF;
          position:relative;overflow:hidden;}
        .cover .ring{position:absolute;width:520px;height:520px;border-radius:50%;
          border:60px solid rgba(255,255,255,.06);right:-180px;top:-160px;}
        .cover .badge{font-size:74px;}
        .cover h1{font-size:56px;font-weight:700;margin-top:18px;}
        .cover p{font-size:19px;margin-top:14px;font-weight:500;max-width:560px;text-align:center;
          color:#FFE8E2;}
        .cover .divider{width:70px;height:5px;background:#F4A024;border-radius:3px;margin:26px 0;}
        .cover .meta{font-size:14px;color:#FFD8CF;line-height:2;text-align:center;font-weight:500;}
        .shot{max-height:80vh;max-width:88%;object-fit:contain;
          filter:drop-shadow(0 24px 56px rgba(40,28,16,.30));}
        .label{margin-top:24px;font-size:25px;font-weight:700;color:#22180F;}
        .label small{display:block;font-size:14px;font-weight:500;color:#7D6E5C;margin-top:5px;}
        .num{position:fixed;top:30px;right:42px;font-size:13px;font-weight:700;color:#C3B7A4;}
        </style></head><body>

        <div class="page cover">
          <div class="ring"></div>
          <div class="badge">&#127859;</div>
          <h1 class="serif">Pratik Tarifler</h1>
          <p>Istah kabartan, modern arayuz tasarimi</p>
          <div class="divider"></div>
          <div class="meta">
            UYGULAMA MOCKUP EKRANLARI<br>
            8 Ana Ekran &middot; Turkce Arayuz<br>
            3 Modlu UX &middot; 2500+ Tarif &middot; 13 Dil<br><br>
            Surum 1.0 &middot; 2026
          </div>
        </div>
        """

        labels = [
            ("Ana Sayfa", "Hero gunun tarifi, 3 mod kisayolu, akilli arama"),
            ("Buzdolabi Kamera", "AI ile gercek zamanli malzeme tanima"),
            ("Malzeme Inceleme", "AI sonucunu duzenle, manuel malzeme ekle"),
            ("Mod 1 - Sonuclar", "Sadece eldeki malzemelerle yapilabilen tarifler"),
            ("Mod 2 - Sonuclar", "Eksik malzemeli tarifler + akilli alisveris listesi"),
            ("Tarif Detay", "Full-bleed hero gorsel, porsiyon ayari, malzemeler"),
            ("Pisirme Modu", "Buyuk yazi, otomatik sayac, sesli okuma"),
            ("Premium Abonelik", "Freemium paywall - 7 gun ucretsiz deneme"),
        ]
        for i, (title, desc) in enumerate(labels, 1):
            html += f"""
            <div class="page">
              <div class="num">{i} / 8</div>
              <img class="shot" src="file:///home/claude/docs/assets/v2_screen_{i:02d}.png">
              <div class="label serif">{i}. {title}<small>{desc}</small></div>
            </div>"""
        html += "</body></html>"

        with open("/home/claude/docs/_mockup_v2.html", "w") as f:
            f.write(html)
        await page.goto("file:///home/claude/docs/_mockup_v2.html")
        await page.wait_for_timeout(2400)
        await page.pdf(
            path="/home/claude/docs/output/01_Mockup_Ekranlari_TR.pdf",
            format="A4", landscape=True, print_background=True,
            margin={"top":"0","bottom":"0","left":"0","right":"0"},
        )
        await browser.close()
        print("OK 01_Mockup_Ekranlari_TR.pdf guncellendi")

asyncio.run(main())
