#!/usr/bin/env python3
"""Subtitles from the narration timings: tts.json + line start times -> .srt (YouTube / Shorts / accessibility).

    python tools/voice/captions.py tts.json starts.json out.srt [--max-words 7]
    python tools/voice/captions.py tts.json board.json out.srt         # any JSON with a "vo" map works (board / kinetic)
    python tools/voice/captions.py tts.json timeline.json out.srt      # dialogue films: tools/voice/dialogue.py output
starts.json = {"s1": 1.0, "s2": 6.0, ...}  (the same VO start times the film / score uses)
Long lines are split into chunks of <= --max-words words using the per-word timestamps. Dialogue timelines prefix
each cue with the speaker's name when --speakers is given."""
import json, sys, argparse


def ts(t):
    ms = int(round(max(0.0, t) * 1000))            # round once, on the total: never prints ",1000"
    h, ms = divmod(ms, 3600_000); m, ms = divmod(ms, 60_000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def load_starts(path):
    """{"s1": 1.0} | {"vo": {...}} (board.json / kinetic.json) | dialogue timeline.json {"lines": [{"id", "start"}]}"""
    S = json.load(open(path, encoding="utf-8")); who = {}
    if isinstance(S, dict) and isinstance(S.get("lines"), list):
        who = {l["id"]: l.get("who", "") for l in S["lines"]}
        return {l["id"]: float(l["start"]) for l in S["lines"]}, who
    if isinstance(S, dict) and isinstance(S.get("vo"), dict): S = S["vo"]
    return {k: float(v) for k, v in S.items()}, who


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("tts"); ap.add_argument("starts"); ap.add_argument("out")
    ap.add_argument("--max-words", type=int, default=7)
    ap.add_argument("--speakers", help="cast.json: prefix dialogue cues with the character name")
    a = ap.parse_args()
    T = json.load(open(a.tts, encoding="utf-8")); S, who = load_starts(a.starts); n = 0; out = []
    script = {}
    try:
        J = json.load(open(a.starts, encoding="utf-8"))
        if isinstance(J, dict) and isinstance(J.get("lines"), list): script = {l["id"]: l.get("text", "") for l in J["lines"]}
    except Exception: pass
    names = {}
    if a.speakers:
        names = {k: v.get("name", k) for k, v in json.load(open(a.speakers, encoding="utf-8"))["characters"].items()}
    for sid, t0 in sorted(S.items(), key=lambda kv: kv[1]):
        if sid not in T: sys.exit(f"{sid}: no entry in {a.tts} (re-run tts / dialogue, or fix the start-times file)")
        W = T[sid]["words"]
        for i in range(0, len(W), a.max_words):
            ch = W[i:i + a.max_words]; n += 1
            text = " ".join(w["text"] for w in ch)
            if len(W) <= a.max_words and script.get(sid): text = script[sid].replace("*", "")   # keep ! ؟ … of the script
            if names and i == 0 and who.get(sid): text = f"{names.get(who[sid], who[sid])}: {text}"
            out.append(f"{n}\n{ts(t0 + ch[0]['timestamp'][0])} --> {ts(t0 + ch[-1]['timestamp'][1] + 0.15)}\n{text}\n")
    open(a.out, "w", encoding="utf-8").write("\n".join(out)); print(a.out, n, "cues")


if __name__ == "__main__":
    main()
