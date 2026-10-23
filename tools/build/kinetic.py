#!/usr/bin/env python3
"""Kinetic-typography / motion-graphics explainer: every narrated word appears exactly when it is spoken.

    python tools/build/kinetic.py <film_dir>
Reads <film_dir>/kinetic.json + script.json + tts.json, writes <film_dir>/proj/index.html (+ fonts).

kinetic.json
{
  "format": "9:16",                          # "16:9" (1920x1080) or "9:16" (1080x1920, Shorts / Reels / TikTok)
  "title": "سرعة الضوء",                       # small header that stays on screen (optional)
  "ink": "#fdf8ee", "palette": [["#1d2b53", "#ffcf4a"], ["#7e2553", "#ffa3c4"]],   # [background, accent] per card (cycled)
  "vo": {"s1": 0.6, "s2": 4.3},              # narration start per line
  "cards": [
    {"line": "s1", "style": "pop"},          # pop | drop | rise  (word entrance)
    {"line": "s2", "style": "rise", "number": {"value": 300000, "suffix": "", "unit": "كيلومتر في الثانية", "word": 3}}
  ],
  "music": "assets/mix.wav",                 # optional single mixed track (narration + bed), else per-line VO
  "tail": 1.2
}
In script.json mark keywords with *asterisks*: "يقطعُ الضوءُ نحو *ثلاثمئة ألف* كيلومتر" -> accent colour + drawn underline + bounce.
A card lasts from its line's start to the next card's start. "number.word" = index of the word that triggers the counter.
"""
import json, os, re, shutil, sys, html as H
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def tokens(text):
    out, key = [], False
    for raw in text.split():
        starts, ends = raw.startswith("*"), raw.rstrip("،,.!؟?:؛…").endswith("*")
        if starts: key = True
        clean = raw.replace("*", "")
        out.append((clean, key)); key = key and not ends
    return out

def main():
    d = os.path.abspath(sys.argv[1]); K = json.load(open(os.path.join(d, "kinetic.json")))
    S = {s["id"]: s["text"] for s in json.load(open(os.path.join(d, "script.json")))}
    T = json.load(open(os.path.join(d, "tts.json"))); VO = K["vo"]
    W, Hh = (1080, 1920) if K.get("format") == "9:16" else (1920, 1080); tall = Hh > W
    pal = K.get("palette", [["#1d2b53", "#ffcf4a"]]); ink = K.get("ink", "#fdf8ee")
    last = K["cards"][-1]["line"]; TOTAL = round(VO[last] + T[last]["dur"] + K.get("tail", 1.2), 2)
    cards_html, cards_js = [], []
    for i, c in enumerate(K["cards"]):
        sid = c["line"]; toks = tokens(S[sid]); tw = T[sid]["words"]; t0 = VO[sid]
        if len(tw) == len(toks): times = [t0 + w["timestamp"][0] for w in tw]
        else:  # timing/token mismatch: spread evenly over the line (and warn)
            print(f"WARN {sid}: {len(toks)} tokens vs {len(tw)} timed words -> even spacing", file=sys.stderr)
            times = [t0 + T[sid]["dur"] * k / max(1, len(toks)) for k in range(len(toks))]
        bg, acc = pal[i % len(pal)]
        t1 = VO[K["cards"][i + 1]["line"]] if i + 1 < len(K["cards"]) else None
        words = []
        spans = []
        for k, ((w, key), t) in enumerate(zip(toks, times)):
            ul = '<svg viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M 98 12 C 70 18, 30 6, 2 13"/></svg>' if key else ""
            spans.append(f'<span class="w w{k}{" key" if key else ""}">{H.escape(w)}{ul}</span>')
            words.append({"t": round(t, 3), "key": key})
        num_html, num = "", None
        if c.get("number"):
            n = c["number"]; at = times[min(n.get("word", 0), len(times) - 1)]
            num = {"value": n["value"], "suffix": n.get("suffix", ""), "at": round(at, 3), "dur": n.get("dur", 1.6)}
            num_html = f'<div class="num">0</div><div class="unit">{H.escape(n.get("unit", ""))}</div>'
        inner = f'<div class="numwrap">{num_html}<div class="line">{"".join(spans)}</div></div>' if num_html else f'<div class="line">{"".join(spans)}</div>'
        cards_html.append(f'<div class="card" id="card-{i}" style="--accent:{acc}">{inner}</div>')
        rnd = lambda k: ((i * 7 + k * 13) * 2654435761 % 1000) / 1000.0
        shapes = [[round((rnd(k) - 0.5) * W * 0.9), round((rnd(k + 5) - 0.5) * Hh * 0.9), round(0.6 + rnd(k + 9) * 1.6, 2), round(0.10 + 0.12 * rnd(k + 3), 2)] for k in range(6)]
        cards_js.append({"t0": round(t0, 3), "t1": t1, "bg": bg, "accent": acc, "style": c.get("style", "pop"), "words": words, "number": num, "shapes": shapes})
    shapes_html = "\n".join(f'<div class="shape" id="shape-{k}" style="left:{W/2 - 110}px;top:{Hh/2 - 110}px;width:220px;height:220px;"></div>' for k in range(6))
    if K.get("music"):
        audio = f'<audio id="mix" src="{K["music"]}" data-start="0" data-duration="{TOTAL}" data-track-index="2" data-volume="1"></audio>'
    else:
        audio = "\n".join(f'<audio id="vo-{s}" src="assets/voice/{s}.mp3" data-start="{VO[s]}" data-duration="{T[s]["dur"]:.3f}" data-track-index="2" data-volume="1"></audio>' for s in VO)
    rep = {"%W%": str(W), "%H%": str(Hh), "%TOTAL%": str(TOTAL), "%BG0%": pal[0][0], "%ACC0%": pal[0][1], "%INK%": ink,
           "%PAD%": "70" if tall else "160", "%FS%": "118" if tall else "124", "%NFS%": "230" if tall else "260",
           "%UFS%": "70" if tall else "76", "%TFS%": "64" if tall else "54", "%TTOP%": "150" if tall else "60",
           "%TITLE%": H.escape(K.get("title", "")), "%SHAPES%": shapes_html, "%CARDS%": "\n".join(cards_html),
           "%CARDJS%": json.dumps(cards_js, ensure_ascii=False), "%AUDIO%": audio}
    page = open(os.path.join(ROOT, "templates", "kinetic", "template.html"), encoding="utf-8").read()
    for k, v in rep.items(): page = page.replace(k, v)
    os.makedirs(os.path.join(d, "proj", "assets"), exist_ok=True)
    open(os.path.join(d, "proj", "index.html"), "w", encoding="utf-8").write(page)
    shutil.copytree(os.path.join(ROOT, "assets", "fonts"), os.path.join(d, "proj", "fonts"), dirs_exist_ok=True)
    if os.path.isdir(os.path.join(d, "assets")): shutil.copytree(os.path.join(d, "assets"), os.path.join(d, "proj", "assets"), dirs_exist_ok=True)
    print("built", os.path.join(d, "proj", "index.html"), f"{W}x{Hh}", TOTAL, "s")

if __name__ == "__main__":
    main()
