#!/usr/bin/env python3
"""Final gate on a rendered video: format, duration, audio level and a frame tile you must LOOK at.

    python tools/render/verify.py out/film.mp4 [--expect 60] [--tile check.png] [--n 12]
Checks: video + audio streams present, duration within 0.5 s of --expect, integrated loudness (EBU R128; platforms
normalise to about -14 LUFS and never turn quiet videos up: shorts -14..-16 via Score.render(lufs=...), long narration
-16..-20), true peak below -1 dBTP.
Writes a tile of --n evenly spaced frames: compare it with your preview sheets (a render can differ from the browser)."""
import argparse, json, re, subprocess, sys
from PIL import Image

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("video"); ap.add_argument("--expect", type=float)
    ap.add_argument("--tile", default="check.png"); ap.add_argument("--n", type=int, default=12)
    a = ap.parse_args(); ok = True
    p = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", a.video], capture_output=True, text=True).stdout)
    v = [s for s in p["streams"] if s["codec_type"] == "video"]; au = [s for s in p["streams"] if s["codec_type"] == "audio"]
    dur = float(p["format"]["duration"])
    if v: print(f"video  {v[0]['codec_name']} {v[0]['width']}x{v[0]['height']} @ {v[0]['r_frame_rate']}")
    else: print("FAIL no video stream"); ok = False
    if au: print(f"audio  {au[0]['codec_name']} {au[0].get('sample_rate')} Hz {au[0].get('channels')} ch")
    else: print("FAIL no audio stream"); ok = False
    print(f"length {dur:.2f} s  size {int(p['format']['size']) / 1e6:.1f} MB")
    if a.expect and abs(dur - a.expect) > 0.5: print(f"FAIL duration differs from {a.expect}"); ok = False
    if au:
        e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", a.video, "-filter_complex", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
        I = re.findall(r"I:\s+(-?[\d.]+) LUFS", e); TP = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)
        if I: print(f"loudness {I[-1]} LUFS integrated, true peak {TP[-1] if TP else '?'} dBTP")
        if TP and float(TP[-1]) > -1.0: print("WARN true peak above -1 dBTP (may clip after platform encoding)")
    frames = []
    for i in range(a.n):
        t = dur * (i + 0.5) / a.n; f = f"/tmp/verify_{i}.png"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", a.video, "-frames:v", "1", "-vf", "scale=480:-2", f], check=True)
        frames.append(Image.open(f).convert("RGB"))
    w, h = frames[0].size; cols = 4 if w > h else 6; rows = (len(frames) + cols - 1) // cols
    tile = Image.new("RGB", (cols * w, rows * h), "white")
    for i, im in enumerate(frames): tile.paste(im, ((i % cols) * w, (i // cols) * h))
    tile.save(a.tile); print("tile", a.tile, "-> look at it")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
