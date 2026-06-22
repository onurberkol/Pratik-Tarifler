#!/usr/bin/env python3
"""Gorsel uretim kilavuzu - 3 HTML parcasini PDF'e birlestir."""
import asyncio, os
from playwright.async_api import async_playwright
from pypdf import PdfWriter, PdfReader

os.makedirs("/home/claude/docs/output", exist_ok=True)

async def html_to_pdf(html_path, pdf_path):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(f"file://{html_path}")
        await page.wait_for_timeout(1800)
        await page.pdf(path=pdf_path, format="A4", print_background=True,
                       margin={"top":"0","bottom":"0","left":"0","right":"0"})
        await browser.close()

async def build():
    parts = ["img_guide_part1.html","img_guide_part2.html","img_guide_part3.html"]
    tmps = []
    for i,part in enumerate(parts):
        tmp = f"/home/claude/docs/_img_{i}.pdf"
        await html_to_pdf(f"/home/claude/docs/{part}", tmp)
        tmps.append(tmp)
        print(f"  part {i+1} rendered")
    writer = PdfWriter()
    for tmp in tmps:
        for pg in PdfReader(tmp).pages:
            writer.add_page(pg)
    out = "/home/claude/docs/output/06_Gorsel_Uretim_Kilavuzu_TR.pdf"
    with open(out,"wb") as f:
        writer.write(f)
    for tmp in tmps:
        os.remove(tmp)
    print(f"OK {out} ({len(writer.pages)} sayfa)")

asyncio.run(build())
