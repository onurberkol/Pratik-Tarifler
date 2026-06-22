#!/usr/bin/env python3
"""Ürün tanıtım dokümanını PDF'e çevir."""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("file:///home/claude/docs/product_doc.html")
        await page.wait_for_timeout(2200)
        await page.pdf(
            path="/home/claude/docs/output/03_Urun_Tanitim_TR.pdf",
            format="A4", print_background=True,
            margin={"top":"0","bottom":"0","left":"0","right":"0"},
        )
        await browser.close()
        print("✓ 03_Urun_Tanitim_TR.pdf")

asyncio.run(main())
