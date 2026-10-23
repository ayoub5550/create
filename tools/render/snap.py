#!/usr/bin/env python3
"""Fast local preview: seek the composition's timeline and screenshot frames into one contact sheet.

    python tools/render/snap.py <proj_dir> out.png 1 5.5 12 20 ...      # times in seconds
    python tools/render/snap.py <proj_dir> out.png --every 2.5           # whole film, every 2.5 s
Prints console errors (must be none). Use the sheet for self-review and for the critic (docs/recipe/08-critic.md).
Needs: pip install playwright && playwright install chromium   (or set CHROME=/path/to/chrome)
"""
import argparse, asyncio, glob, os, re
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw

def chrome():
    if os.environ.get("CHROME"): return os.environ["CHROME"]
    for pat in ["~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell",
                "~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome"]:
        hits = sorted(glob.glob(os.path.expanduser(pat)))
        if hits: return hits[-1]
    return None

async def shoot(proj, times, w, h, tmp):
    async with async_playwright() as p:
        exe = chrome()
        b = await p.chromium.launch(executable_path=exe, args=["--allow-file-access-from-files"]) if exe else await p.chromium.launch()
        pg = await b.new_page(viewport={"width": w, "height": h})
        errs = []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + os.path.abspath(os.path.join(proj, "index.html")))
        await pg.wait_for_timeout(1500)
        files = []
        for t in times:
            # NB: the evaluated expression must not return the GSAP timeline (serialising it hangs) -> "; 0"
            await pg.evaluate(f"(window.__timelines.main || Object.values(window.__timelines)[0]).seek({t}, false); 0")
            await pg.wait_for_timeout(60)
            f = os.path.join(tmp, f"snap_{t:07.2f}.png"); await pg.screenshot(path=f); files.append((t, f))
        await b.close()
    return files, errs

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("proj"); ap.add_argument("out"); ap.add_argument("times", nargs="*", type=float)
    ap.add_argument("--every", type=float); ap.add_argument("--cols", type=int, default=3)
    ap.add_argument("--keep", help="also keep full-size frames in this folder")
    a = ap.parse_args()
    html = open(os.path.join(a.proj, "index.html"), encoding="utf-8").read()
    W = int(re.search(r'data-width="(\d+)"', html).group(1)); H = int(re.search(r'data-height="(\d+)"', html).group(1))
    dur = float(re.search(r'data-duration="([\d.]+)"', html).group(1))
    times = a.times or [round(i * a.every, 2) for i in range(int(dur / a.every) + 1)] if (a.times or a.every) else [dur * i / 11 for i in range(12)]
    tmp = a.keep or "/tmp/create_snaps"; os.makedirs(tmp, exist_ok=True)
    files, errs = asyncio.run(shoot(a.proj, times, W, H, tmp))
    print("console errors:", errs[:8] or "none")
    tw = 640; th = round(tw * H / W); cols = a.cols; rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tw, rows * th), "white"); d = ImageDraw.Draw(sheet)
    for i, (t, f) in enumerate(files):
        x, y = (i % cols) * tw, (i // cols) * th
        sheet.paste(Image.open(f).convert("RGB").resize((tw, th)), (x, y)); d.rectangle([x, y, x + 58, y + 16], fill="white")
        d.text((x + 4, y + 3), f"{t:.2f}s", fill="red")
    sheet.save(a.out); print(a.out)

if __name__ == "__main__":
    main()
