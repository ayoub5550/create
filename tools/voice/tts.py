#!/usr/bin/env python3
"""Narration: script.json -> assets/voice/<id>.mp3 + tts.json (duration + per-word timestamps for choreography).

    python tools/voice/tts.py script.json                      # free default: Microsoft Edge neural voices (edge-tts)
    python tools/voice/tts.py script.json --provider elevenlabs --voice JBFqnCBsd6RMkjVDRZzb   # needs ELEVENLABS_API_KEY
    python tools/voice/tts.py script.json --only s3 s4         # regenerate some lines

script.json = [{"id": "s1", "text": "..."}, ...]   (one line per beat; short lines = easier sync)
tts.json    = {"s1": {"file": "assets/voice/s1.mp3", "dur": 4.36, "words": [{"text": "...", "timestamp": [0.0, 0.48]}, ...]}}

Providers
  edge        free, no key, good Arabic voices: ar-SA-HamedNeural (m), ar-SA-ZariyahNeural (f), ar-EG-ShakirNeural (m),
              ar-EG-SalmaNeural (f), ar-AE-HamdanNeural, ar-JO-TaimNeural ...  (`edge-tts --list-voices | grep ar-`).
              Options: --rate "-8%" (storytelling is slower), --pitch "-2Hz".  pip install edge-tts
  elevenlabs  most expressive; REST /v1/text-to-speech/{voice}/with-timestamps, character alignment -> words.
              --model eleven_multilingual_v2 (default) or eleven_v3; language "ar". Passes previous/next text for
              continuous intonation. Generate SEQUENTIALLY (parallel calls can swap files / hit rate limits).
Always run tools/voice/stt_check.py afterwards (a TTS can skip or mangle words, especially with diacritics).
"""
import argparse, asyncio, base64, json, os, subprocess, sys, urllib.request


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True).stdout.strip()
    return float(out)


async def edge_line(text, dst, voice, rate, pitch):
    import edge_tts
    c = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    words = []
    with open(dst, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                s = ch["offset"] / 1e7; words.append({"text": ch["text"], "timestamp": [round(s, 3), round(s + ch["duration"] / 1e7, 3)]})
    return words


def eleven_line(text, dst, voice, model, lang, prev, nxt, stability):
    key = os.environ.get("ELEVENLABS_API_KEY") or sys.exit("set ELEVENLABS_API_KEY")
    body = {"text": text, "model_id": model, "voice_settings": {"stability": stability, "similarity_boost": 0.75}}
    if lang: body["language_code"] = lang
    if prev: body["previous_text"] = prev
    if nxt: body["next_text"] = nxt
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
                                 data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=180))
    open(dst, "wb").write(base64.b64decode(r["audio_base64"]))
    al = r.get("alignment") or r.get("normalized_alignment") or {}
    chars, st, en = al.get("characters", []), al.get("character_start_times_seconds", []), al.get("character_end_times_seconds", [])
    words, cur, t0, t1 = [], "", None, None
    for c, a, b in zip(chars, st, en):
        if c.isspace():
            if cur: words.append({"text": cur, "timestamp": [round(t0, 3), round(t1, 3)]}); cur = ""
            continue
        if not cur: t0 = a
        cur += c; t1 = b
    if cur: words.append({"text": cur, "timestamp": [round(t0, 3), round(t1, 3)]})
    return words


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("script"); ap.add_argument("--provider", choices=["edge", "elevenlabs"], default="edge")
    ap.add_argument("--voice"); ap.add_argument("--rate", default="-5%"); ap.add_argument("--pitch", default="+0Hz")
    ap.add_argument("--model", default="eleven_multilingual_v2"); ap.add_argument("--lang", default="ar")
    ap.add_argument("--stability", type=float, default=0.6)
    ap.add_argument("--out-dir", default="assets/voice"); ap.add_argument("--tts-json", default="tts.json")
    ap.add_argument("--only", nargs="*")
    a = ap.parse_args()
    S = json.load(open(a.script)); os.makedirs(a.out_dir, exist_ok=True)
    out = json.load(open(a.tts_json)) if os.path.exists(a.tts_json) else {}
    voice = a.voice or ("ar-SA-HamedNeural" if a.provider == "edge" else "JBFqnCBsd6RMkjVDRZzb")  # George
    for i, s in enumerate(S):
        if a.only and s["id"] not in a.only: continue
        dst = os.path.join(a.out_dir, f"{s['id']}.mp3")
        text = s["text"].replace("*", "")          # *keyword* marks are for the visuals only
        if a.provider == "edge":
            words = asyncio.run(edge_line(text, dst, voice, a.rate, a.pitch))
        else:
            prev = S[i - 1]["text"].replace("*", "") if i else None; nxt = S[i + 1]["text"].replace("*", "") if i + 1 < len(S) else None
            words = eleven_line(text, dst, voice, a.model, a.lang, prev, nxt, a.stability)
        out[s["id"]] = {"file": dst, "dur": round(duration(dst), 3), "words": words}
        print(f"{s['id']}: {out[s['id']]['dur']:.2f}s, {len(words)} words  {s['text']}", flush=True)
    json.dump(out, open(a.tts_json, "w"), ensure_ascii=False, indent=1)
    print("total narration", round(sum(v["dur"] for v in out.values()), 2), "s ->", a.tts_json)


if __name__ == "__main__":
    main()
