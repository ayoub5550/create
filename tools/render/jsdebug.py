"""Open a built proj/index.html headless and print console errors + page errors (and optionally seek).
usage (in sandbox): python3 jsdebug.py <proj_dir> [t]"""
import asyncio, os, sys, glob
from playwright.async_api import async_playwright
async def main():
    proj = sys.argv[1]
    async with async_playwright() as p:
        exe = sorted(glob.glob(os.path.expanduser("~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell")))
        b = await p.chromium.launch(executable_path=exe[-1] if exe else None, args=["--allow-file-access-from-files"])
        pg = await b.new_page(viewport={"width": 1920, "height": 1080})
        pg.on("console", lambda m: print("CONSOLE", m.type, m.text) if m.type in ("error", "warning") else None)
        pg.on("pageerror", lambda e: print("PAGEERROR", e, getattr(e, "stack", "")))
        await pg.goto("file://" + os.path.abspath(os.path.join(proj, "index.html")))
        await pg.wait_for_timeout(1500)
        if len(sys.argv) > 2:
            await pg.evaluate(f"window.__timelines.main.seek({sys.argv[2]}, false); 0")
        print("timelines:", await pg.evaluate("Object.keys(window.__timelines || {}).join(',')"))
        await b.close()
asyncio.run(main())
