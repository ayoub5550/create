"""(sandbox) Screenshot full-res frames of a built project.  usage: python3 frames.py <proj_dir> <out_dir> t1 t2 ..."""
import asyncio, os, sys, glob
from playwright.async_api import async_playwright
async def main():
    proj, out, ts = sys.argv[1], sys.argv[2], [float(x) for x in sys.argv[3:]]
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        exe = sorted(glob.glob(os.path.expanduser("~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell")))
        b = await p.chromium.launch(executable_path=exe[-1] if exe else None, args=["--allow-file-access-from-files"])
        pg = await b.new_page(viewport={"width": 1920, "height": 1080})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + os.path.abspath(os.path.join(proj, "index.html"))); await pg.wait_for_timeout(1500)
        for t in ts:
            await pg.evaluate(f"window.__timelines.main.seek({t}, false); 0"); await pg.wait_for_timeout(80)
            await pg.screenshot(path=os.path.join(out, f"f_{t:08.3f}.png"))
        print("errors:", errs); await b.close()
asyncio.run(main())
