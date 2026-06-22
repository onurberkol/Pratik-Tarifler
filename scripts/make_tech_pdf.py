#!/usr/bin/env python3
"""HTML dosyalarını PDF'e çevir ve birleştir."""
import asyncio, sys
from playwright.async_api import async_playwright
from pypdf import PdfWriter, PdfReader
import os

os.makedirs("/home/claude/docs/output", exist_ok=True)

async def html_to_pdf(html_path, pdf_path):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(f"file://{html_path}")
        await page.wait_for_timeout(1800)
        await page.pdf(
            path=pdf_path, format="A4", print_background=True,
            margin={"top":"0","bottom":"0","left":"0","right":"0"},
        )
        await browser.close()

async def build_tech_doc():
    parts = [
        "/home/claude/docs/tech_doc_part1.html",
        "/home/claude/docs/tech_doc_part2.html",
        "/home/claude/docs/tech_doc_part3.html",
    ]
    tmp_pdfs = []
    for i, part in enumerate(parts):
        tmp = f"/home/claude/docs/_tech_{i}.pdf"
        await html_to_pdf(part, tmp)
        tmp_pdfs.append(tmp)
        print(f"  ✓ part {i+1} rendered")

    writer = PdfWriter()
    for tmp in tmp_pdfs:
        reader = PdfReader(tmp)
        for pg in reader.pages:
            writer.add_page(pg)
    out = "/home/claude/docs/output/02_Teknik_Dokuman_TR.pdf"
    with open(out, "wb") as f:
        writer.write(f)
    for tmp in tmp_pdfs:
        os.remove(tmp)
    print(f"✓ {out} ({len(writer.pages)} sayfa)")

asyncio.run(build_tech_doc())
