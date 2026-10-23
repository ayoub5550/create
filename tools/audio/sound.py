"""sound.py — code-made film audio: a plucked oud in Arabic maqamat, pads, drones, bells, Foley/SFX and a
narration-aware mixer. numpy + scipy only, no samples, no API keys. MIT.

    import sys; sys.path.insert(0, "tools/audio"); from sound import *
    S = Score(60.0)                                    # 60 s film
    S.phrase(0.8, maqam_line("hijaz", 62, [0, 1, 2, 3, 2, 1, 0], [1, .5, .5, 1.5, .5, .5, 2]), bpm=72, gain=.42)
    S.music_add(drone(38, 26.5), 0.4, 0.22)            # D drone
    S.sfx_add(rain(5.2), 32.75, .32);  S.sfx_add(thunder(), 32.6, .45)
    for t in (4.5, 5.1, 5.7): S.sfx_add(thud(), t, .18)  # footsteps
    S.voice({"s1": 1.0, "s2": 6.0}, "assets/voice/{}.mp3") # narration, placed at its start times
    S.render("proj/assets/mix.wav")                    # reverb, ducking, normalise, report levels

Pitches are MIDI numbers; floats are allowed, so quarter tones work (63.5 = E half-flat, for Rast / Bayati / Saba).
Target levels (60 s film, measured by Score.render): narration parts ≈ -22 dB RMS, music-only ≈ -27 dB, peak < -1 dB.
"""
import subprocess, wave
import numpy as np
from scipy.signal import lfilter

SR = 44100
_rng = np.random.default_rng(11)

# maqam scales as semitone steps from the tonic (quarter tones as .5) — one octave, ascending
MAQAM = {
    "ajam":     [0, 2, 4, 5, 7, 9, 11, 12],        # major: bright, joyful, resolution
    "nahawand": [0, 2, 3, 5, 7, 8, 11, 12],        # minor (harmonic): night, longing, sadness
    "hijaz":    [0, 1, 4, 5, 7, 8, 10, 12],        # desert, journey, tension, drama
    "kurd":     [0, 1, 3, 5, 7, 8, 10, 12],        # gentle melancholy
    "rast":     [0, 2, 3.5, 5, 7, 9, 10.5, 12],    # noble, "home", storytelling (quarter tones)
    "bayati":   [0, 1.5, 3, 5, 7, 8, 10, 12],      # warm, everyday, folk (quarter tones)
    "saba":     [0, 1.5, 3, 4, 7, 8, 10, 12],      # grief, deep sorrow (quarter tones)
}


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)


def maqam_line(name, tonic, degrees, beats):
    """[(midi, beats)] from scale degrees (0 = tonic, 7 = octave, negatives go below; None = rest)."""
    sc = MAQAM[name]; out = []
    for d, b in zip(degrees, beats):
        if d is None: out.append((None, b)); continue
        o, k = divmod(d, 7); out.append((tonic + 12 * o + sc[k], b))
    return out


def lowpass(x, a): return lfilter([1 - a], [1, -a], x)


def env(n, att, rel, dur):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(att, 1e-4)) * np.clip((dur - t) / max(rel, 1e-4), 0, 1)


# ------------------------------------------------------------------ instruments
def oud(m, dur=1.8, bright=0.6, decay=0.996):
    """Karplus-Strong plucked string (oud / qanun colour), block-vectorised."""
    f = hz(m); p = max(2, int(round(SR / f))); n = int(SR * dur); nb = n // p + 2
    y = np.zeros(nb * p); y[:p] = lowpass(_rng.uniform(-1, 1, p), 1 - bright)
    for k in range(1, nb):
        prev = y[(k - 1) * p:k * p]; last = y[(k - 1) * p - 1] if k > 1 else 0.0
        y[k * p:(k + 1) * p] = decay * 0.5 * (prev + np.concatenate([[last], prev[:-1]]))
    y = y[:n]; t = np.arange(n) / SR
    y = y + 0.25 * lowpass(y, 0.9)
    return y * np.minimum(1, t / 0.003) * np.clip((dur - t) / 0.15, 0, 1) / (np.abs(y).max() + 1e-9)


def ney(m, dur=1.5, breath=0.25):
    """Breathy flute (ney-like): sine stack + band noise, slow attack, light vibrato."""
    n = int(SR * dur); t = np.arange(n) / SR; f = hz(m) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / .4))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + .3 * np.sin(2 * ph) + .12 * np.sin(3 * ph) + breath * noise_band(n, hz(m), hz(m) * 4)
    return s * env(n, .12, .25, dur) / 1.6


def drone(m, dur, att=1.5, rel=2.0):
    n = int(SR * dur); t = np.arange(n) / SR; f = hz(m)
    s = sum(a * np.sin(2 * np.pi * f * h * t + 0.3 * np.sin(2 * np.pi * 0.2 * t)) for h, a in [(1, 1), (2, .45), (3, .22), (4, .1)])
    return s * env(n, att, rel, dur) / 1.8


def pad(ms, dur, att=0.8, rel=1.2):
    n = int(SR * dur); t = np.arange(n) / SR; s = np.zeros(n)
    for m in ms:
        for det in (-0.1, 0.1): s += np.sin(2 * np.pi * hz(m) * 2 ** (det / 12) * t)
    return s * env(n, att, rel, dur) / (2 * len(ms))


def bell(f_or_midi, dur=2.5, midi=False):
    f = hz(f_or_midi) if midi else f_or_midi; n = int(SR * dur); t = np.arange(n) / SR
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (dur / (1 + r))) for r, a in [(1, 1), (2.76, .5), (5.4, .25)]) * np.minimum(1, t / .002)


def frame_drum(dur=0.35, low=True):
    """Daf / bendir hit: pitched thump (dum) or bright slap (tak)."""
    n = int(SR * dur); t = np.arange(n) / SR
    if low: return np.sin(2 * np.pi * (95 - 40 * t / dur) * t) * np.exp(-t / .09) + .25 * noise_band(n, 100, 900) * np.exp(-t / .02)
    return noise_band(n, 1500, 7000) * np.exp(-t / .03) + .3 * np.sin(2 * np.pi * 420 * t) * np.exp(-t / .03)


# ------------------------------------------------------------------ SFX / Foley
def noise_band(n, lo, hi):
    x = _rng.standard_normal(n); X = np.fft.rfft(x); fr = np.fft.rfftfreq(n, 1 / SR); X[(fr < lo) | (fr > hi)] = 0
    y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)


def scribble(dur, seed=0):
    """Pencil / marker on paper (whiteboard hand, draw-ons)."""
    n = int(SR * dur); x = noise_band(n, 2500, 9000); tt = np.arange(n) / SR; r = np.random.default_rng(seed)
    am = 0.55 + 0.45 * np.sin(2 * np.pi * (6 + 3 * r.random()) * tt + r.random() * 6) * np.sin(2 * np.pi * 1.3 * tt)
    return x * am * env(n, .05, .08, dur)


def thud(f0=110, dur=0.18):
    """Footstep / landing / impact. Higher f0 = smaller object."""
    n = int(SR * dur); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (f0 - 50 * tt / dur) * tt) * np.exp(-tt / .04) + .5 * noise_band(n, 200, 2500) * np.exp(-tt / .015)


def dig(dur=0.3):
    """Shovel into dry soil (pair with a low thud)."""
    n = int(SR * dur); return noise_band(n, 400, 6000) * np.exp(-np.arange(n) / SR / .07)


def rain(dur=5.0, drops=260):
    n = int(SR * dur); tt = np.arange(n) / SR; e = env(n, .6, .8, dur)
    r = (noise_band(n, 800, 9000) * .6 + noise_band(n, 200, 1500) * .4) * e; d = np.zeros(n)
    for _ in range(drops):
        i = int(_rng.uniform(0, n - 2000)); d[i:i + 400] += _rng.uniform(.3, 1) * np.exp(-np.arange(400) / 60) * np.sin(np.arange(400) * _rng.uniform(.3, .9))
    return r * .5 + d * .25 * e


def thunder(dur=3.0):
    n = int(SR * dur); tt = np.arange(n) / SR; return noise_band(n, 30, 260) * np.exp(-tt / .9) * np.minimum(1, tt / .05)


def wind(dur=6.0):
    n = int(SR * dur); tt = np.arange(n) / SR; return noise_band(n, 150, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * .3 * tt)) * np.sin(np.pi * tt / dur)


def crickets(dur=4.6):
    n = int(SR * dur); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 28 * tt) > .3) * (np.sin(2 * np.pi * 1.6 * tt) > 0) * env(n, .8, .8, dur)


def bird(k=0, dur=0.18):
    n = int(SR * dur); tt = np.arange(n) / SR; f = 2600 + 900 * np.sin(np.pi * tt / dur) + (300 * k) % 400
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / dur) ** 2


def pop(dur=0.25, f0=300, f1=1200):
    """Cartoon pop / sprout / appear."""
    n = int(SR * dur); tt = np.arange(n) / SR; return np.sin(2 * np.pi * (f0 + (f1 - f0) * tt / dur) * tt) * np.exp(-tt / .08)


def whoosh(dur=0.5, lo=300, hi=3000):
    """Camera move / transition swish."""
    n = int(SR * dur); tt = np.arange(n) / SR; return noise_band(n, lo, hi) * np.sin(np.pi * tt / dur) ** 2


def glint(base=93):
    """Sparkle: three quick bells (MIDI base, base+3, base+7)."""
    out = np.zeros(int(SR * 1.0))
    for i, m in enumerate([base, base + 3, base + 7]):
        b = bell(hz(m), .8); s = int(i * .08 * SR); out[s:s + len(b)] += b[:len(out) - s]
    return out


def reverb(x, sec=1.8, mix=0.25):
    n = int(SR * sec); ir = _rng.standard_normal(n) * np.exp(-np.arange(n) / SR / .5); ir /= np.sqrt((ir ** 2).sum())
    F = 1 << int(np.ceil(np.log2(len(x) + n))); return x + mix * np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[:len(x)]


def load_audio(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


# ------------------------------------------------------------------ score / mixer
class Score:
    def __init__(self, dur):
        self.dur = dur; self.N = int(SR * dur)
        self.music = np.zeros(self.N); self.sfx = np.zeros(self.N); self.vo = np.zeros(self.N); self.vo_spans = []

    @staticmethod
    def _add(buf, sig, t0, g):
        i = int(t0 * SR)
        if i >= len(buf) or i < 0: return
        j = min(len(buf), i + len(sig)); buf[i:j] += g * sig[:j - i]

    def music_add(self, sig, t0, g=1.0): self._add(self.music, sig, t0, g)
    def sfx_add(self, sig, t0, g=1.0): self._add(self.sfx, sig, t0, g)

    def phrase(self, t0, notes, bpm=72, gain=0.5, bright=0.55, instrument=None):
        """Play [(midi|None, beats)] from t0; returns the end time. instrument(m, dur) -> signal (default oud)."""
        B = 60 / bpm; t = t0; inst = instrument or (lambda m, d: oud(m, max(1.2, d + 0.6), bright))
        for m, d in notes:
            if m is not None: self.music_add(inst(m, d * B), t, gain)
            t += d * B
        return t

    def voice(self, starts, pattern="assets/voice/{}.mp3"):
        """starts = {line_id: start_seconds}; pattern formats the file path from the id."""
        for sid, t0 in starts.items():
            a = load_audio(pattern.format(sid)); self._add(self.vo, a, t0, 1.0); self.vo_spans.append((t0, t0 + len(a) / SR))

    def render(self, out, music_gain=0.3, sfx_gain=0.9, duck=0.6, fade_in=0.8, fade_out=1.8, reverb_music=0.32, reverb_sfx=0.12):
        N = self.N; t = np.arange(N) / SR
        music = reverb(self.music, mix=reverb_music); sfx = reverb(self.sfx, 1.2, reverb_sfx)
        act = (np.abs(self.vo) > .01).astype(float); w = int(SR * .25)
        e = np.clip(np.convolve(act, np.ones(w) / w, "same") * 4, 0, 1); e = np.convolve(e, np.ones(int(SR * .3)) / int(SR * .3), "same")
        music *= (1 - duck * e) * np.minimum(1, t / fade_in) * np.clip((self.dur - t) / fade_out, 0, 1)
        music /= np.abs(music).max() + 1e-9
        mix = self.vo + music * music_gain + sfx * sfx_gain
        mix /= max(1.0, np.abs(mix).max() / .89)
        st = (np.stack([mix, mix], 1) * 32767).astype(np.int16)
        with wave.open(out, "wb") as f:
            f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(st.tobytes())
        self.report(mix); return mix

    def report(self, mix):
        print(f"wrote mix: mean {db(mix):.1f} dB RMS, peak {20 * np.log10(np.abs(mix).max() + 1e-12):.1f} dBFS")
        if self.vo_spans:
            vo = np.concatenate([mix[int(a * SR):int(b * SR)] for a, b in self.vo_spans])
            mask = np.ones(self.N, bool)
            for a, b in self.vo_spans: mask[int(a * SR):int(b * SR)] = False
            print(f"  narration parts {db(vo):.1f} dB (target ≈ -22), between lines {db(mix[mask]):.1f} dB (target ≈ -27)")
