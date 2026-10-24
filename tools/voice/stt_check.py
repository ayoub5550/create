#!/usr/bin/env python3
"""Narration integrity gate: transcribe every voice line and compare with the script (catches skipped / swapped /
mangled words before you build choreography on them).

    python tools/voice/stt_check.py script.json                    # local, free: faster-whisper (pip install faster-whisper)
    python tools/voice/stt_check.py script.json --engine elevenlabs   # ElevenLabs Scribe, needs ELEVENLABS_API_KEY
    python tools/voice/stt_check.py scene.json                     # dialogue films (tools/voice/dialogue.py): same check
Prints similarity per line (diacritics and punctuation ignored); exits 1 if any line is below --min (default 0.75).
"""
import argparse, difflib, json, os, re, sys, time, urllib.request, uuid

AR_DIAC = re.compile(r"[\u064B-\u0652\u0670\u0640]")

def norm(s):
    s = AR_DIAC.sub("", s); s = re.sub(r"[إأآا]", "ا", s); s = s.replace("ى", "ي").replace("ة", "ه")
    return " ".join(re.sub(r"[^\w\s]", " ", s.lower()).split())          # English: case-insensitive

def pcm16k(path):
    """Decode with ffmpeg (avoids PyAV version clashes inside faster-whisper)."""
    import subprocess, numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

def whisper_engine(model):
    from faster_whisper import WhisperModel
    m = WhisperModel(model, device="cpu", compute_type="int8")
    return lambda path, lang: " ".join(seg.text for seg in m.transcribe(pcm16k(path), language=lang)[0])

def scribe(path, lang):
    key = os.environ.get("ELEVENLABS_API_KEY") or sys.exit("set ELEVENLABS_API_KEY")
    b = uuid.uuid4().hex; data = open(path, "rb").read()
    body = (f"--{b}\r\nContent-Disposition: form-data; name=\"model_id\"\r\n\r\nscribe_v1\r\n"
            + (f"--{b}\r\nContent-Disposition: form-data; name=\"language_code\"\r\n\r\n{lang}\r\n" if lang else "")
            + f"--{b}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"a.mp3\"\r\nContent-Type: audio/mpeg\r\n\r\n").encode() + data + f"\r\n--{b}--\r\n".encode()
    req = urllib.request.Request("https://api.elevenlabs.io/v1/speech-to-text", data=body,
                                 headers={"xi-api-key": key, "Content-Type": f"multipart/form-data; boundary={b}"})
    time.sleep(3.2)  # stay under ~20 requests/min
    return json.load(urllib.request.urlopen(req, timeout=180))["text"]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("script"); ap.add_argument("--engine", choices=["whisper", "elevenlabs"], default="whisper")
    ap.add_argument("--model", default="small"); ap.add_argument("--lang", default=None, help="en / ar ... (default: auto-detect)"); ap.add_argument("--dir", default="assets/voice")
    ap.add_argument("--min", type=float, default=0.75)
    a = ap.parse_args(); S = json.load(open(a.script, encoding="utf-8"))
    if isinstance(S, dict): S = S.get("lines", [])                  # scene.json of a dialogue film
    stt = whisper_engine(a.model) if a.engine == "whisper" else scribe
    bad = 0
    for s in S:
        p = os.path.abspath(os.path.join(a.dir, f"{s['id']}.mp3"))   # absolute paths: some engines silently return "" otherwise
        heard = stt(p, a.lang); r = difflib.SequenceMatcher(None, norm(s["text"].replace("*", "")), norm(heard)).ratio()
        flag = "OK " if r >= a.min else "BAD"; bad += r < a.min
        print(f"{flag} {s['id']} {r:.2f} | script: {s['text']}\n            heard:  {heard.strip()}", flush=True)
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
