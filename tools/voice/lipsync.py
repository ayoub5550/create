#!/usr/bin/env python3
"""Lip sync: a voice line (+ optional word timings) -> mouth cues [[t, shape], ...] for StickFilm.rig({mouth}).

    python tools/voice/lipsync.py assets/voice/l1.mp3                          # auto: Rhubarb if available, else energy
    python tools/voice/lipsync.py assets/voice/l1.mp3 --words tts.json:l1 -o l1.mouth.json --engine energy
Usually you do not call it by hand: tools/voice/dialogue.py runs it for every line of a dialogue film.

Shapes = Rhubarb letters (Preston Blair / Hanna-Barbera mouth chart), drawn by engine/stickfilm.js:
  A closed, lips pressed (م ب) · B slightly open, teeth (most consonants, kasra, ي) · C open (fatha, ء ع ح)
  D wide open (alif, long fatha) · E rounded (o) · F puckered (و, damma) · G lip on teeth (ف) · H tongue up (ل ن ر) · X rest
Engines
  rhubarb  Rhubarb Lip Sync 1.14 (MIT, github.com/DanielSWolf/rhubarb-lip-sync). English lines (Latin script): its English
           recogniser + the transcript (most precise). Other languages: the language-independent "phonetic"
           recogniser (the default one is English-only). Downloaded once into ~/.cache/create/rhubarb, or set
           RHUBARB=/path/to/rhubarb. The lip-sync data it produces is yours (see its LICENSE.md).
  energy   numpy only: loudness -> openness (X/B/C/D), low/high band balance -> rounded vowels (E/F). Any language, no
           download; less precise on consonants.
Arabic rules (when word timings are known, e.g. from edge-tts / ElevenLabs): م ب force a closed A, ف forces G,
و and damma force a rounded F inside the word, at the letter's position (Rhubarb sometimes misses Arabic bilabials).
Finishing (craft rules): cues lead the audio by --lead (default 0.04 s ≈ 1 frame; viewers see a late mouth otherwise),
every shape is held >= 2 frames (a closed A may stay 1 frame), pauses > 0.25 s rest on X, the track starts/ends on X.
"""
import argparse, json, os, platform, re, shutil, stat, subprocess, sys, tempfile, urllib.request, zipfile
import numpy as np

RHUBARB_VERSION = "1.14.0"
CACHE = os.path.expanduser(os.environ.get("CREATE_CACHE", "~/.cache/create"))
OPEN = {"X": 0, "A": 1, "G": 2, "B": 3, "H": 4, "F": 5, "E": 6, "C": 7, "D": 8}   # openness rank, used when merging
SR = 16000


def decode(path, sr=SR):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.abspath(path), "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


# ------------------------------------------------------------------ Rhubarb
def rhubarb_bin(download=True):
    env = os.environ.get("RHUBARB")
    if env and os.path.exists(env): return env
    if shutil.which("rhubarb"): return shutil.which("rhubarb")
    osname = {"Linux": "Linux", "Darwin": "macOS", "Windows": "Windows"}.get(platform.system())
    if not osname: return None
    base = os.path.join(CACHE, "rhubarb")
    exe_name = "rhubarb.exe" if osname == "Windows" else "rhubarb"
    for dirpath, _, files in os.walk(base) if os.path.isdir(base) else []:
        if exe_name in files: return os.path.join(dirpath, exe_name)
    if not download: return None
    url = f"https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v{RHUBARB_VERSION}/Rhubarb-Lip-Sync-{RHUBARB_VERSION}-{osname}.zip"
    os.makedirs(base, exist_ok=True); z = os.path.join(base, "rhubarb.zip")
    print(f"downloading Rhubarb Lip Sync {RHUBARB_VERSION} (MIT) ...", file=sys.stderr)
    urllib.request.urlretrieve(url, z + ".part"); os.replace(z + ".part", z)
    with zipfile.ZipFile(z) as zf: zf.extractall(base)
    os.remove(z)
    for dirpath, _, files in os.walk(base):
        if exe_name in files:
            exe = os.path.join(dirpath, exe_name); os.chmod(exe, os.stat(exe).st_mode | stat.S_IEXEC); return exe
    return None


def is_english(text):
    """Latin letters and no Arabic script -> Rhubarb's English recogniser (more precise than "phonetic")"""
    return bool(text) and bool(re.search(r"[A-Za-z]", text)) and not re.search(r"[\u0600-\u06FF]", text)


def rhubarb_cues(path, exe, text=None):
    with tempfile.TemporaryDirectory() as td:
        wav = os.path.join(td, "line.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.abspath(path), "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", wav], check=True)
        cmd = [exe, "-q", "-f", "json", "--extendedShapes", "GHX"]
        if is_english(text):                                 # English: default recogniser + the transcript (dialog file)
            dlg = os.path.join(td, "line.txt"); open(dlg, "w", encoding="utf-8").write(text); cmd += ["-d", dlg]
        else: cmd += ["-r", "phonetic"]                      # any other language (Arabic): language-independent
        out = subprocess.run(cmd + [wav], capture_output=True, text=True, check=True).stdout
    return [[float(c["start"]), c["value"]] for c in json.loads(out)["mouthCues"]]


# ------------------------------------------------------------------ energy engine (+ stress accents)
def analyse(x, fps):
    """per-frame loudness (0..~1.3, smoothed) and low/high band balance"""
    hop = SR / fps; n = int(len(x) / hop) + 1; win = int(hop * 2)
    lv = np.zeros(n); tilt = np.zeros(n); w = np.hanning(win)
    freqs = np.fft.rfftfreq(win, 1 / SR); lo = (freqs > 250) & (freqs < 900); hi = (freqs > 1400) & (freqs < 4200)
    for i in range(n):
        c = int(i * hop); seg = x[max(0, c - win // 2): c + win // 2]
        if len(seg) < win: seg = np.pad(seg, (0, win - len(seg)))
        lv[i] = np.sqrt(np.mean(seg ** 2))
        sp = np.abs(np.fft.rfft(seg * w)); tilt[i] = (sp[lo].sum() + 1e-9) / (sp[hi].sum() + 1e-9)
    env = np.zeros(n); e = 0.0
    for i, r in enumerate(lv):                               # fast attack, slower release
        e += (r - e) * (0.65 if r > e else 0.35); env[i] = e
    voiced = env[env > env.max() * 0.08] if env.max() > 0 else env
    ref = np.percentile(voiced, 90) if len(voiced) else 1.0
    return env / (ref + 1e-9), tilt


def energy_frames(x, fps):
    lv, tilt = analyse(x, fps); out = []
    for L, T in zip(lv, tilt):
        if L < 0.12: s = "X"
        elif L < 0.32: s = "B"
        elif T > 9.0: s = "F" if L < 0.62 else "E"           # energy sits low: rounded vowel (و / o)
        elif L < 0.62: s = "C"
        else: s = "D"
        out.append(s)
    return out


def accents(x, fps, min_gap=0.32):
    """stressed syllables = clear loudness peaks (for head bobs / jaw accents)"""
    lv, _ = analyse(x, fps); out = []; last = -9
    for i in range(1, len(lv) - 1):
        if lv[i] > 0.78 and lv[i] >= lv[i - 1] and lv[i] >= lv[i + 1] and i / fps - last >= min_gap:
            out.append(round(i / fps, 3)); last = i / fps
    return out


# ------------------------------------------------------------------ Arabic letter rules
DIAC = set("\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652\u0670")
FORCE = {"م": "A", "ب": "A", "ف": "G", "و": "F", "\u064F": "F"}
LONG = set("اويآى")


def arabic_forced(words, fps):
    """[(t0, t1, shape)] relative to the line audio, from word timings [{"text", "timestamp": [a, b]}]"""
    out = []
    for w in words or []:
        a, b = w["timestamp"]; text = "".join(ch for ch in w["text"] if ch.isalpha() or ch in DIAC)
        units = []                                            # (char, weight)
        for ch in text:
            if ch in DIAC:
                if ch == "\u064F" and units: units.append((ch, 0.0))  # damma: rounding on the previous letter
                continue
            units.append((ch, 2.0 if ch in LONG else 1.0))
        tot = sum(u[1] for u in units) or 1.0; pos = 0.0
        for ch, wt in units:
            if ch in FORCE:
                tc = a + (b - a) * (pos + max(wt, 0.6) * 0.5) / tot
                d = 0.08 if FORCE[ch] == "F" else max(1.0 / fps, 0.06)
                out.append((tc - d / 2, tc + d / 2, FORCE[ch]))
            pos += wt
    return out


# ------------------------------------------------------------------ assemble
def raster(cues, n, fps):
    fr = ["X"] * n; k = 0
    cues = sorted(cues)
    for i in range(n):
        t = i / fps
        while k + 1 < len(cues) and cues[k + 1][0] <= t + 1e-6: k += 1
        if cues and cues[k][0] <= t + 1e-6: fr[i] = cues[k][1]
    return fr


def finish(fr, fps, lead=0.04, min_hold=2):
    n = len(fr); L = int(round(lead * fps))
    fr = fr[L:] + ["X"] * L                                   # lead the audio
    runs = []                                                 # run-length [shape, length]
    for s in fr:
        if runs and runs[-1][0] == s: runs[-1][1] += 1
        else: runs.append([s, 1])
    # short pauses inside speech: hold the previous shape (no flapping to rest)
    for i in range(1, len(runs) - 1):
        if runs[i][0] == "X" and runs[i][1] / fps < 0.15: runs[i][0] = runs[i - 1][0]
    changed = True
    while changed:                                            # enforce minimum holds
        changed = False; merged = []
        for r in runs:
            if merged and merged[-1][0] == r[0]: merged[-1][1] += r[1]
            else: merged.append(r)
        runs = merged
        for i, (s, ln) in enumerate(runs):
            keep = 1 if s == "A" else min_hold
            if ln < keep and len(runs) > 1:
                nb = [j for j in (i - 1, i + 1) if 0 <= j < len(runs)]
                j = max(nb, key=lambda q: OPEN[runs[q][0]])
                runs[j][1] += ln; runs[i][1] = 0; changed = True; break
        runs = [r for r in runs if r[1] > 0]
    out = []; i = 0
    for s, ln in runs:
        out.append([round(i / fps, 3), s]); i += ln
    if out and out[-1][1] != "X": out.append([round(i / fps, 3), "X"])     # always come back to rest
    return out


def cues_for(audio, words=None, engine="auto", fps=30, lead=0.04, text=None):
    """-> (cues [[t, shape]], engine_used, accents [t]) — times relative to the start of `audio`.
    text = the line's transcript (default: joined word texts); English lines use Rhubarb's English recogniser with it."""
    x = decode(audio); n = int(len(x) / SR * fps) + 2
    used = "energy"; fr = None
    if text is None and words: text = " ".join(w["text"] for w in words)
    if engine in ("auto", "rhubarb"):
        try:
            exe = rhubarb_bin(download=True)
            if exe:
                fr = raster(rhubarb_cues(audio, exe, text), n, fps); used = "rhubarb-en" if is_english(text) else "rhubarb"
            elif engine == "rhubarb": sys.exit("Rhubarb not available (set RHUBARB=/path/to/rhubarb)")
        except Exception as e:                               # no network / unsupported platform -> energy
            if engine == "rhubarb": raise
            print(f"rhubarb failed ({e}); using the energy engine", file=sys.stderr)
    if fr is None:
        ef = energy_frames(x, fps); fr = (ef + ["X"] * n)[:n]
    for t0, t1, s in arabic_forced(words, fps):               # Arabic closures / roundings at the letter position
        i0 = max(0, int(round(t0 * fps))); i1 = min(n, max(i0 + 1, int(round(t1 * fps))))
        for i in range(i0, i1):
            if fr[i] != "X" or s == "A": fr[i] = s
    return finish(fr, fps, lead), used, accents(x, fps)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("audio"); ap.add_argument("--engine", choices=["auto", "rhubarb", "energy"], default="auto")
    ap.add_argument("--words", help="word timings: tts.json:<line id>, or a JSON file with [{text, timestamp}]")
    ap.add_argument("--fps", type=float, default=30); ap.add_argument("--lead", type=float, default=0.04)
    ap.add_argument("-o", "--out")
    a = ap.parse_args(); words = None
    if a.words:
        f, _, key = a.words.partition(":"); W = json.load(open(f, encoding="utf-8"))
        words = W[key]["words"] if key else W
    cues, used, acc = cues_for(a.audio, words, a.engine, a.fps, a.lead)
    js = json.dumps({"engine": used, "fps": a.fps, "cues": cues, "accents": acc}, ensure_ascii=False)
    if a.out: open(a.out, "w", encoding="utf-8").write(js); print(f"{a.out}: {len(cues)} cues ({used})")
    else: print(js)


if __name__ == "__main__":
    main()
