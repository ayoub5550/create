#!/usr/bin/env python3
"""Dialogue films: scene.json + cast.json -> a voice per character, the timeline, lip sync and acting tracks.

    python tools/voice/dialogue.py <film_dir>                  # every line (cached by text + voice; --force to redo)
    python tools/voice/dialogue.py <film_dir> --only l3 l4     # re-voice some lines
    python tools/voice/dialogue.py <film_dir> --engine energy  # lip sync without Rhubarb

<film_dir>/cast.json
  {"characters": {"sami": {"name": "سامي",
      "voice": {"provider": "edge", "voice": "en-US-AndrewNeural", "rate": "+0%", "pitch": "+0Hz"},   # or elevenlabs + voice id
      "look": {"ink": "#2b2a28", "color": "#c4453b", "scale": 0.72, "head": 46, "accessories": ["scarf"]},
      "personality": {"gesture": 1.0, "energy": 1.0}}}}
<film_dir>/scene.json
  {"start": 0.8, "tail": 1.6, "lines": [
      {"id": "l1", "who": "sami", "text": "...", "gap": 0.3, "emotion": "happy", "gesture": "explain"},
      {"id": "l2", "who": "layla", "text": "... *كلمة* ...", "gap": 0.9, "react": true},     # *word* = stressed (beat)
      {"id": "l3", "who": "sami", "text": "...", "at": 14.2, "max_pause": 0.35}]}             # "at" pins the start
  "max_pause" (per line, or scene-wide): shorten pauses INSIDE the line to this many seconds (TTS pauses at «؟» «...»
  run 0.8-0.9 s; 0.3-0.5 keeps comedy snappy — a rule of three needs ~0.8 s between its onsets). Cuts silence only.
Writes into <film_dir>:
  assets/voice/<id>.mp3   one file per line, generated SEQUENTIALLY (parallel TTS calls swapped files before)
  tts.json                {id: {file, dur, words, who, text, hash}}  (tools/voice/tts.py format + who/text)
  timeline.json           {fps, total, lines: [{id, who, text, start, end, dur, emotion, gesture, react, words: [{text, t0, t1}]}]}
                          absolute times — read by captions.py, shotlist.py and the film's score.py
  lipsync.json            per-line cache {id: {hash, engine, cues, accents}}
  film_data.js            window.FILM_DATA = {total, lines (with word times), chars: {id: {mouth, blinks, accents, beats, nods,
                          gesture, energy}}}  (gesture / energy = cast.json personality: gesture size, energy)
Timing rules (conversation): the next line starts `gap` s after the previous one's LAST WORD ends (TTS files carry ~0.8 s
of trailing silence, which is ignored; default gap 0.3 s when the speaker
changes, 0.15 s when the same character goes on; negative = overlap / interruption; 0.8-1.2 s = hesitation or a comic
beat before a punchline). Acting tracks: listener nods at the other speaker's phrase ends, beats (hand strokes) on
*marked* words or the longest word of a line (<= 1 per 1.5 s), head accents on loudness peaks, seeded blinks + a blink
after each of the character's own lines. Then: python tools/direct/shotlist.py auto <film_dir>.
"""
import argparse, asyncio, hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from tts import edge_line, eleven_line, duration, trim_pauses   # noqa: E402
from lipsync import cues_for                               # noqa: E402

FPS = 30


def h01(*parts):
    """deterministic 0..1 from strings/numbers"""
    return int(hashlib.sha1("|".join(map(str, parts)).encode()).hexdigest()[:8], 16) / 0xFFFFFFFF


def clean(text): return text.replace("*", "")


def voice_line(line, ch, dst, prev, nxt):
    v = ch.get("voice", {}); prov = v.get("provider", "edge"); text = clean(line["text"])
    if prov == "edge":
        return asyncio.run(edge_line(text, dst, v.get("voice", "en-US-AndrewNeural"), v.get("rate", "+0%"), v.get("pitch", "+0Hz")))
    return eleven_line(text, dst, v.get("voice", "JBFqnCBsd6RMkjVDRZzb"), v.get("model", "eleven_multilingual_v2"), v.get("lang"),
                       prev, nxt, v.get("stability", 0.5))


def stressed_words(text, words):
    """indices of *marked* words, else the longest word (>= 4 letters)"""
    toks = text.split(); marked = []; key = False
    for i, w in enumerate(toks):
        if w.startswith("*"): key = True
        if key: marked.append(i)
        if w.rstrip("،,.!؟?:؛…").endswith("*"): key = False
    if marked: return [i for i in marked if i < len(words)]
    best = max(range(len(words)), key=lambda i: len(re.sub(r"\W", "", words[i]["text"])), default=None)
    return [best] if best is not None and len(re.sub(r"\W", "", words[best]["text"])) >= 4 else []


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("film_dir"); ap.add_argument("--only", nargs="*"); ap.add_argument("--force", action="store_true")
    ap.add_argument("--engine", choices=["auto", "rhubarb", "energy"], default="auto"); ap.add_argument("--fps", type=float, default=FPS)
    a = ap.parse_args(); d = os.path.abspath(a.film_dir)
    cast = json.load(open(os.path.join(d, "cast.json"), encoding="utf-8"))["characters"]
    scene = json.load(open(os.path.join(d, "scene.json"), encoding="utf-8")); L = scene["lines"]
    for ln in L:
        if ln["who"] not in cast: sys.exit(f"{ln['id']}: unknown character {ln['who']!r} (cast.json has {list(cast)})")
    os.makedirs(os.path.join(d, "assets", "voice"), exist_ok=True)
    tp = os.path.join(d, "tts.json"); T = json.load(open(tp, encoding="utf-8")) if os.path.exists(tp) else {}
    lp = os.path.join(d, "lipsync.json"); LS = json.load(open(lp, encoding="utf-8")) if os.path.exists(lp) else {}

    # 1. voices (sequential, cached)
    revoiced = set()
    for i, ln in enumerate(L):
        ch = cast[ln["who"]]; rel = f"assets/voice/{ln['id']}.mp3"; dst = os.path.join(d, rel)
        mp = ln.get("max_pause", scene.get("max_pause"))
        hv = hashlib.sha1(json.dumps([clean(ln["text"]), ch.get("voice", {})] + ([float(mp)] if mp else []), ensure_ascii=False,
                                     sort_keys=True).encode()).hexdigest()[:12]
        cached = T.get(ln["id"], {}).get("hash") == hv and os.path.exists(dst)
        if cached and not a.force and not (a.only and ln["id"] in a.only):
            continue
        if a.only and ln["id"] not in a.only and cached: continue
        prev = clean(L[i - 1]["text"]) if i else None; nxt = clean(L[i + 1]["text"]) if i + 1 < len(L) else None
        words = voice_line(ln, ch, dst, prev, nxt); cut = 0.0
        if mp and words: words, cut = trim_pauses(dst, words, float(mp))
        T[ln["id"]] = {"file": rel, "dur": round(duration(dst), 3), "words": words, "who": ln["who"], "text": ln["text"], "hash": hv}
        if cut: T[ln["id"]]["trimmed"] = cut
        revoiced.add(ln["id"])
        print(f"voice {ln['id']} ({ln['who']}, {ch.get('voice', {}).get('voice')}): {T[ln['id']]['dur']:.2f}s"
              f"{f' (pauses -{cut:.2f}s)' if cut else ''}  {clean(ln['text'])}", flush=True)
    json.dump(T, open(tp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # 2. timeline
    t = float(scene.get("start", 0.8)); lines = []; prev_who = None
    for ln in L:
        e = T[ln["id"]]
        gap = ln.get("gap", 0.15 if ln["who"] == prev_who else 0.3)
        start = float(ln["at"]) if "at" in ln else (t + gap if lines else t)
        start = round(round(start * a.fps) / a.fps, 3)                     # cuts and cues land on frames
        speech = (e["words"][-1]["timestamp"][1] if e["words"] else e["dur"]) + 0.05   # TTS files end with ~0.8 s of silence
        end = round(start + min(speech, e["dur"]), 3)
        lines.append({"id": ln["id"], "who": ln["who"], "text": clean(ln["text"]), "start": start, "end": end, "dur": round(end - start, 3),
                      "file_dur": e["dur"],
                      "emotion": ln.get("emotion", "neutral"), "gesture": ln.get("gesture"), "react": bool(ln.get("react")),
                      "words": [{"text": w["text"], "t0": round(start + w["timestamp"][0], 3), "t1": round(start + w["timestamp"][1], 3)} for w in e["words"]]})
        t = end; prev_who = ln["who"]
    total = round(max(l["end"] for l in lines) + float(scene.get("tail", 1.6)), 2)

    # 3. lip sync per line (cached)
    for ln in L:
        e = T[ln["id"]]; key = f"{e['hash']}:{a.engine}:{a.fps}"
        if LS.get(ln["id"], {}).get("key") != key or ln["id"] in revoiced:
            cues, used, acc = cues_for(os.path.join(d, e["file"]), e["words"], a.engine, a.fps, text=clean(ln["text"]))
            LS[ln["id"]] = {"key": key, "engine": used, "cues": cues, "accents": acc}
            print(f"lipsync {ln['id']}: {len(cues)} cues ({used})", flush=True)
    json.dump(LS, open(lp, "w", encoding="utf-8"), ensure_ascii=False)

    # 4. acting tracks per character
    chars = {}
    for cid, ch in cast.items():
        own = [l for l in lines if l["who"] == cid]; other = [l for l in lines if l["who"] != cid]
        mouth = [[0.0, "X"]]
        for l in own:
            for tc, s in LS[l["id"]]["cues"]:
                tt = round(l["start"] + tc, 3)
                if mouth and abs(mouth[-1][0] - tt) < 1e-6: mouth[-1][1] = s
                elif mouth[-1][1] != s: mouth.append([tt, s])
            if mouth[-1][1] != "X": mouth.append([round(l["end"], 3), "X"])
        acc = []
        for l in own:
            for x in LS[l["id"]]["accents"]:
                tt = round(l["start"] + x, 3)
                if not acc or tt - acc[-1] >= 0.35: acc.append(tt)
        beats = []
        for l in own:
            if l["dur"] < 1.2: continue
            for wi in stressed_words(next(s["text"] for s in L if s["id"] == l["id"]), l["words"]):
                tb = round(l["words"][wi]["t0"] - 0.08, 3)
                if not beats or tb - beats[-1] >= 1.5: beats.append(tb)
        nods = []
        for l in other:
            if any(o["start"] < l["end"] + 0.6 and o["end"] > l["end"] for o in own): continue   # busy talking
            if h01(cid, l["id"], "nod") < 0.75: nods.append(round(l["end"] + 0.12, 3))
            for w in l["words"][:-1]:
                if w["text"].endswith(("،", ",")) and h01(cid, l["id"], w["t1"]) < 0.45: nods.append(round(w["t1"] + 0.1, 3))
        bl = []; k = 0; tb = 0.5 + h01(cid, "b0") * 2.0
        while tb < total:
            bl.append(round(tb, 3)); k += 1; tb += 2.2 + 3.0 * h01(cid, "blink", k)
        bl += [round(l["end"] + 0.15, 3) for l in own]
        bl = sorted(bl); blinks = [b for i, b in enumerate(bl) if i == 0 or b - bl[i - 1] > 0.6]
        p = ch.get("personality", {})
        chars[cid] = {"mouth": mouth, "blinks": blinks, "accents": acc, "beats": sorted(beats), "nods": sorted(nods),
                      "gesture": p.get("gesture", 1.0), "energy": p.get("energy", 1.0)}

    timeline = {"fps": a.fps, "total": total, "lines": lines}
    json.dump(timeline, open(os.path.join(d, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    data = {"total": total, "lines": [{k: l[k] for k in ("id", "who", "text", "start", "end", "emotion", "gesture", "react", "words")} for l in lines], "chars": chars}
    open(os.path.join(d, "film_data.js"), "w", encoding="utf-8").write(
        "/* generated by tools/voice/dialogue.py — do not edit */\nwindow.FILM_DATA = " + json.dumps(data, ensure_ascii=False) + ";\n")
    print(f"\n{'line':5} {'who':8} {'start':>6} {'end':>6}  text")
    for l in lines: print(f"{l['id']:5} {l['who']:8} {l['start']:6.2f} {l['end']:6.2f}  {l['text']}")
    print(f"total {total} s -> timeline.json, film_data.js  (engines: {sorted(set(v['engine'] for v in LS.values()))})")


if __name__ == "__main__":
    main()
