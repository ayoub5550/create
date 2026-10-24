#!/usr/bin/env python3
"""Assemble film1 from its ten parts: render (optional) -> exact-length audio per part -> concat -> -14 LUFS master ->
mux -> merged English captions -> verify.  Run from the repo root:

    python3 films/film1/assemble.py [--build] [--render] [--parts p01,p02,...] [--workers 6]
--build   rebuild every part first (bash parts/pNN/build.sh)      --render  re-render every part MP4 (else only missing ones)
Outputs: out/film1/parts/pNN.mp4 · out/film1/film1.mp4 (1080p, AAC 48 kHz, -14 LUFS, peak <= -2 dBFS) · out/film1/film1.srt ·
out/film1/check.png (verify.py tile) · out/film1/film1-720p.mp4 (gallery preview).
Audio stays sample-exact per part: each part's mix.wav is padded/trimmed to that part's VIDEO length before the concat,
so picture and sound never drift across the ten cuts."""
import argparse, json, os, re, subprocess, sys, wave
import numpy as np

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
F = os.path.join(R, "films", "film1"); OUT = os.path.join(R, "out", "film1")
PARTS = [f"p{k:02d}" for k in range(1, 11)]


def sh(cmd, **kw):
    print("+", cmd if isinstance(cmd, str) else " ".join(cmd), flush=True)
    return subprocess.run(cmd, shell=isinstance(cmd, str), check=True, **kw)


def vdur(path):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries",
                        "stream=nb_read_packets,r_frame_rate", "-of", "json", path], capture_output=True, text=True).stdout
    s = json.loads(o)["streams"][0]; num, den = map(int, s["r_frame_rate"].split("/"))
    return int(s["nb_read_packets"]) * den / num


def read_wav(p):
    with wave.open(p) as w:
        sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).reshape(-1, ch)
    return sr, x


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--build", action="store_true"); ap.add_argument("--render", action="store_true")
    ap.add_argument("--parts", default=",".join(PARTS)); ap.add_argument("--workers", default="6")
    a = ap.parse_args(); parts = a.parts.split(",")
    os.makedirs(os.path.join(OUT, "parts"), exist_ok=True)
    durs, srts, offs = [], [], []
    # 1. build + render
    for p in parts:
        pd = os.path.join(F, "parts", p); mp4 = os.path.join(OUT, "parts", p + ".mp4")
        if a.build or not os.path.exists(os.path.join(pd, "proj", "index.html")): sh(["bash", os.path.join(pd, "build.sh")], cwd=pd)
        if a.render or not os.path.exists(mp4): sh(["bash", os.path.join(R, "tools", "render", "render.sh"), os.path.join(pd, "proj"), mp4, a.workers])
    # 2. audio: each part's mix padded/trimmed to its video length, then concatenated
    chunks, SR = [], None; t = 0.0
    for p in parts:
        pd = os.path.join(F, "parts", p); mp4 = os.path.join(OUT, "parts", p + ".mp4")
        d = vdur(mp4); sr, x = read_wav(os.path.join(pd, "proj", "assets", "mix.wav")); SR = SR or sr
        assert sr == SR, f"{p}: sample rate {sr} != {SR}"
        n = int(round(d * sr)); x = x[:n] if len(x) >= n else np.vstack([x, np.zeros((n - len(x), x.shape[1]), np.int16)])
        chunks.append(x); durs.append(d); offs.append(t); t += d
        print(f"{p}: video {d:.3f} s  (starts at {offs[-1]:.3f})")
    full = np.vstack(chunks); fw = os.path.join(OUT, "full_mix.wav")
    with wave.open(fw, "wb") as w:
        w.setnchannels(full.shape[1]); w.setsampwidth(2); w.setframerate(SR); w.writeframes(full.tobytes())
    # 3. master to -14 LUFS (EBU R128, dual mono like Score.render) with the repo's look-ahead limiter (ceiling -2.5 dBFS
    #    sample peak, so the AAC true peak stays under -1.5 dBTP)
    sys.path.insert(0, os.path.join(R, "tools", "audio")); from sound import measure_lufs, limit, SR as SSR
    assert SR == SSR, f"mix sample rate {SR} != sound.py SR {SSR}"
    x = full[:, 0].astype(np.float64) / 32767.0
    for _ in range(5):
        cur = measure_lufs(x); print(f"master: {cur:.2f} LUFS")
        if cur is None or abs(cur + 14) < 0.12: break
        x = limit(x * 10 ** ((-14 - cur) / 20), -2.5)
    st = (np.clip(np.stack([x, x], 1), -1, 1) * 32767).astype(np.int16); fm = os.path.join(OUT, "full_master.wav")
    with wave.open(fm, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
    fa = os.path.join(OUT, "full_mix.m4a")
    sh(["ffmpeg", "-y", "-v", "error", "-i", fm, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", fa])
    # 4. video concat (stream copy: every part comes from the same HyperFrames encoder settings) + mux
    lst = os.path.join(OUT, "concat.txt")
    open(lst, "w").write("".join(f"file '{os.path.join(OUT, 'parts', p + '.mp4')}'\n" for p in parts))
    fv = os.path.join(OUT, "film1.mp4")
    sh(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-i", fa, "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy", "-c:a", "copy", "-movflags", "+faststart", "-shortest", fv])
    # 5. captions: per part (speaker-prefixed), shifted by the part offsets, renumbered
    cues = []
    for p, off in zip(parts, offs):
        pd = os.path.join(F, "parts", p); srt = os.path.join(OUT, "parts", p + ".srt")
        sh([sys.executable, os.path.join(R, "tools", "voice", "captions.py"), os.path.join(pd, "tts.json"), os.path.join(pd, "timeline.json"), srt,
            "--speakers", os.path.join(F, "cast.json")])
        for blk in open(srt, encoding="utf-8").read().strip().split("\n\n"):
            ls = blk.strip().split("\n")
            if len(ls) < 3: continue
            t0, t1 = [x.strip() for x in ls[1].split("-->")]
            cues.append((tsec(t0) + off, tsec(t1) + off, "\n".join(ls[2:])))
    with open(os.path.join(OUT, "film1.srt"), "w", encoding="utf-8") as f:
        for i, (t0, t1, tx) in enumerate(cues, 1): f.write(f"{i}\n{ts(t0)} --> {ts(t1)}\n{tx}\n\n")
    # 6. verify + gallery preview
    sh([sys.executable, os.path.join(R, "tools", "render", "verify.py"), fv, "--expect", f"{sum(durs):.2f}", "--tile", os.path.join(OUT, "check.png"), "--n", "24"])
    sh(["ffmpeg", "-y", "-v", "error", "-i", fv, "-vf", "scale=-2:720", "-c:v", "libx264", "-crf", "24", "-preset", "medium", "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart", os.path.join(OUT, "film1-720p.mp4")])
    json.dump({"parts": parts, "durations": durs, "offsets": offs, "total": sum(durs)}, open(os.path.join(OUT, "assembly.json"), "w"), indent=1)
    print(f"film1: {sum(durs):.2f} s = {int(sum(durs) // 60)}:{sum(durs) % 60:05.2f}  ->  {fv}")


def tsec(s):
    h, m, rest = s.split(":"); sec, ms = rest.split(","); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000


def ts(t):
    ms = int(round(max(0.0, t) * 1000)); h, ms = divmod(ms, 3600_000); m, ms = divmod(ms, 60_000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


if __name__ == "__main__":
    main()
