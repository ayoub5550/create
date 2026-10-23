#!/usr/bin/env python3
"""Subtitles from the narration timings: tts.json + line start times -> .srt (YouTube / Shorts / accessibility).

    python tools/voice/captions.py tts.json starts.json out.srt [--max-words 7]
starts.json = {"s1": 1.0, "s2": 6.0, ...}  (the same VO start times the film / score uses)
Long lines are split into chunks of <= --max-words words using the per-word timestamps."""
import json, sys, argparse

def ts(t):
    h, r = divmod(max(0, t), 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("tts"); ap.add_argument("starts"); ap.add_argument("out")
    ap.add_argument("--max-words", type=int, default=7)
    a = ap.parse_args(); T = json.load(open(a.tts)); S = json.load(open(a.starts)); n = 0; out = []
    for sid, t0 in sorted(S.items(), key=lambda kv: kv[1]):
        W = T[sid]["words"]
        for i in range(0, len(W), a.max_words):
            ch = W[i:i + a.max_words]; n += 1
            out.append(f"{n}\n{ts(t0 + ch[0]['timestamp'][0])} --> {ts(t0 + ch[-1]['timestamp'][1] + 0.15)}\n{' '.join(w['text'] for w in ch)}\n")
    open(a.out, "w", encoding="utf-8").write("\n".join(out)); print(a.out, n, "cues")

if __name__ == "__main__":
    main()
