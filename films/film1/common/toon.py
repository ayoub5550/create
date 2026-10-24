"""toon.py — the cartoon sound kit of "Sam & Layla" Ep. 1 (shared by every part's score.py; MIT).

Code-made, license-clean audio for a YouTube cartoon: a small cartoon band (marimba, xylophone, glockenspiel, music box,
ukulele, pizzicato strings, upright bass, bassoon, muted trombone, drum kit, timpani), the show's MUSIC CUES (one theme,
the same keys and tempo family in every part, so the 10 parts cut together as one score), synthesized cartoon SFX, and
CC0 Foley from Kenney packs (common/sfx/kenney, CC0 1.0, see License.txt) through foley(name).

    import os, sys
    HERE = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(HERE, "..", "..", "..", "..")
    sys.path[:0] = [os.path.join(R, "tools", "audio"), os.path.join(HERE, "..", "..", "common")]
    from sound import Score                      # the repo mixer (voice ducking, music_gap, LUFS mastering)
    import toon as T
    S = Score(DUR)
    S.music_add(T.cue("happy", 12.0), 0.3, 0.9)  # a named cue, cut to 12 s (ends on a cadence + tail)
    S.sfx_add(T.sfx("boing"), 4.2, 0.5)          # a cartoon SFX
    S.sfx_add(T.foley("footstep_grass", 2), 5.0, 0.4)
    S.render("proj/assets/mix.wav", music_gain=.3, lufs=-15)

Everything is mono float64 at SR = 44100, peak ~1.0 (set the level with the Score gain). Deterministic (seeded).
Run this file to write a demo reel of every sound:  python toon.py demo /tmp/toon_demo.wav
"""
import glob, os, sys
import numpy as np
from scipy.signal import butter, lfilter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
for _p in (os.path.join(HERE, "..", "..", "..", "tools", "audio"), os.path.join(HERE, "..", "..", "..", "..", "tools", "audio")):
    if os.path.exists(os.path.join(_p, "sound.py")) and _p not in sys.path: sys.path.insert(0, _p)
from sound import SR, hz, env, noise_band, oud, pad, bell, crickets as _crickets, wind as _wind, load_audio  # noqa: E402

KENNEY = os.path.join(HERE, "sfx", "kenney")


def _r(seed): return np.random.default_rng(seed)
def _t(n): return np.arange(n) / SR
def _n(d): return max(1, int(SR * d))
def norm(x, p=1.0): return x * (p / (np.abs(x).max() + 1e-9))


def bp(x, lo, hi, order=2):
    sos = butter(order, [max(20, lo), min(SR / 2 - 100, hi)], btype="band", fs=SR, output="sos"); return sosfilt(sos, x)


def lp(x, f, order=2): return sosfilt(butter(order, min(f, SR / 2 - 100), btype="low", fs=SR, output="sos"), x)
def hp(x, f, order=2): return sosfilt(butter(order, max(20, f), btype="high", fs=SR, output="sos"), x)


def fade(x, a=0.005, r=0.02):
    n = len(x); e = np.ones(n); na, nr = min(n, _n(a)), min(n, _n(r))
    e[:na] = np.linspace(0, 1, na); e[n - nr:] *= np.linspace(1, 0, nr); return x * e


def mix(*parts, dur=None):
    """mix((signal, t0, gain), ...) -> one signal."""
    end = max(t0 + len(s) / SR for s, t0, g in parts); n = _n(dur or end); out = np.zeros(n)
    for s, t0, g in parts:
        i = int(t0 * SR); j = min(n, i + len(s))
        if j > i: out[i:j] += g * s[:j - i]
    return out


def sweep(f0, f1, dur, curve="exp"):
    """Phase of a pitch glide (for sin(phase))."""
    n = _n(dur); x = np.linspace(0, 1, n)
    f = f0 * (f1 / f0) ** x if curve == "exp" else f0 + (f1 - f0) * x
    return 2 * np.pi * np.cumsum(f) / SR



def tv_lp(x, cut, blk=64):
    """One-pole lowpass with a time-varying cutoff array (block-wise, state carried across blocks)."""
    a = np.exp(-2 * np.pi * np.asarray(cut) / SR); y = np.zeros(len(x)); z = 0.0
    for i in range(0, len(x), blk):
        aa = a[i]; out, _ = lfilter([1 - aa], [1, -aa], x[i:i + blk], zi=[aa * z]); y[i:i + blk] = out; z = out[-1]
    return y


def small_speaker(x):
    """Through a boombox / phone speaker: band-limited 250 Hz - 5 kHz with a little drive."""
    return np.tanh(2.2 * bp(x, 250, 5000)) / 1.6


# ================================================================== instruments (m = MIDI note, floats allowed)
def modal(m, dur, ratios, amps, decays, click=0.0, seed=0):
    n = _n(dur); t = _t(n); f = hz(m); s = np.zeros(n)
    for r, a, d in zip(ratios, amps, decays):
        if f * r < SR / 2.2: s += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d)
    if click: s += click * hp(_r(seed).standard_normal(n), 2000) * np.exp(-t / 0.004)
    return fade(s * np.minimum(1, t / 0.0015), 0.0005, 0.03) / sum(amps)


def marimba(m, dur=1.0): return modal(m, dur, [1, 3.93, 9.24], [1, 0.32, 0.08], [0.45, 0.09, 0.03], click=0.05)
def xylo(m, dur=0.7): return modal(m, dur, [1, 3.0, 6.0, 9.9], [1, 0.45, 0.2, 0.08], [0.28, 0.07, 0.03, 0.02], click=0.12)
def glock(m, dur=1.6): return modal(m, dur, [1, 2.76, 5.40, 8.93], [1, 0.4, 0.2, 0.08], [0.9, 0.3, 0.12, 0.05], click=0.03)
def musicbox(m, dur=1.5): return modal(m, dur, [1, 2.0, 3.01, 4.97], [1, 0.25, 0.12, 0.05], [0.7, 0.35, 0.15, 0.06], click=0.08)
def celesta(m, dur=1.4): return modal(m, dur, [1, 2.0, 4.0], [1, 0.2, 0.06], [0.8, 0.25, 0.08], click=0.02)
def woodblock(m=79, dur=0.18): return modal(m, dur, [1, 2.7, 5.4], [1, 0.3, 0.1], [0.04, 0.015, 0.008], click=0.2)
def ukulele(m, dur=1.2, bright=0.75): return oud(m, dur, bright, 0.994) * 0.9


def pizz(m, dur=0.5):
    """Pizzicato string: a short, round pluck with a woody body."""
    s = oud(m, max(0.25, dur), 0.45, 0.985); return fade(lp(s, 3500), 0.001, 0.08)


def upright(m, dur=0.6):
    """Plucked upright bass: KS + sub sine, lowpassed."""
    n = _n(dur); t = _t(n); s = 0.7 * oud(m, dur, 0.35, 0.992)[:n] + 0.5 * np.sin(2 * np.pi * hz(m) * t) * np.exp(-t / 0.35)
    return fade(lp(s, 900), 0.002, 0.06)


def synbass(m, dur=0.3):
    """Funk / slap bass: saw through a closing lowpass + a thumb pop."""
    n = _n(dur); t = _t(n); f = hz(m); ph = (f * t) % 1.0; saw = 2 * ph - 1
    e = np.exp(-t / 0.25) * np.minimum(1, t / 0.003)
    s = lp(saw * e, 600) + 0.6 * np.sin(2 * np.pi * f * t) * e + 0.25 * hp(saw, 1500) * np.exp(-t / 0.02)
    return fade(np.tanh(1.5 * s), 0.002, 0.03)


def reed(m, dur, vib=0.006, bright=0.5, att=0.04):
    """Bassoon / clarinet colour: odd-heavy harmonics, soft attack, delayed vibrato (sneaky tunes)."""
    n = _n(dur); t = _t(n); f = hz(m) * (1 + vib * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.15) / 0.3, 0, 1))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(a * np.sin(k * ph) for k, a in [(1, 1), (2, 0.25 * bright), (3, 0.55), (4, 0.1 * bright), (5, 0.3 * bright), (7, 0.12 * bright)])
    s += 0.04 * bp(_r(int(m)).standard_normal(n), hz(m), hz(m) * 6)
    return fade(s * env(n, att, 0.06, dur), 0.002, 0.05) / 2.0


def brass(m, dur, bend=0.0, mute=0.0, att=0.03, vib=0.004):
    """Trombone / horn: a saw with a filter that opens on the attack ("bwah"); bend = semitones over the note
    (sad-trombone fall); mute 0..1 gives a wah/plunger colour."""
    n = _n(dur); t = _t(n)
    f = hz(m) * 2 ** (bend * np.clip((t - 0.1) / max(0.1, dur - 0.1), 0, 1) / 12) * (1 + vib * np.sin(2 * np.pi * 5 * t) * np.clip((t - 0.2) / 0.3, 0, 1))
    ph = np.cumsum(f) / SR; saw = 2 * (ph % 1.0) - 1
    cut = 400 + 2600 * np.minimum(1, t / max(att * 2.5, 1e-3)) * (1 - 0.35 * np.minimum(1, t / max(dur, 0.2)))
    if mute: cut = cut * (1 - mute * 0.6 * (0.5 + 0.5 * np.cos(2 * np.pi * 2.0 * t)))
    y = tv_lp(tv_lp(saw, cut), cut)
    return fade(np.tanh(1.8 * y) * env(n, att, 0.08, dur), 0.002, 0.05)


def strings(ms, dur, att=0.5, rel=0.8, trem=0.0):
    """A soft string section chord: detuned saws, lowpassed; trem = tremolo rate in Hz (tension)."""
    n = _n(dur); t = _t(n); s = np.zeros(n)
    for m in ms:
        for d in (-0.07, 0.0, 0.08):
            f = hz(m) * 2 ** (d / 12) * (1 + 0.003 * np.sin(2 * np.pi * (4.7 + d) * t)); s += 2 * ((np.cumsum(f) / SR) % 1.0) - 1
    s = lp(s, 2200) / (3 * len(ms))
    if trem: s *= 0.6 + 0.4 * np.sin(2 * np.pi * trem * t)
    return s * env(n, att, rel, dur)


# ------------------------------------------------------------------ drums
def kick(d=0.35):
    n = _n(d); t = _t(n); return np.sin(sweep(150, 45, d)) * np.exp(-t / 0.12) + 0.2 * hp(_r(1).standard_normal(n), 1500) * np.exp(-t / 0.003)


def snare(d=0.25):
    n = _n(d); t = _t(n); return 0.55 * bp(_r(2).standard_normal(n), 1200, 8000) * np.exp(-t / 0.06) + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04)


def hat(d=0.06, open_=False):
    n = _n(0.35 if open_ else d); t = _t(n); return hp(_r(3).standard_normal(n), 7000) * np.exp(-t / (0.12 if open_ else 0.015)) * 0.6


def clap(d=0.2):
    n = _n(d); t = _t(n); x = bp(_r(4).standard_normal(n), 900, 5000); e = sum(np.exp(-np.maximum(0, t - k * 0.011) / 0.006) * (t >= k * 0.011) for k in range(3)) + np.exp(-t / 0.05) * 0.6
    return x * e * 0.6


def shaker(d=0.08):
    n = _n(d); t = _t(n); return hp(_r(5).standard_normal(n), 5000) * np.sin(np.pi * np.minimum(1, t / d)) * 0.35


def timpani(m=41, d=1.6, roll=0.0):
    """Timpani hit (roll = seconds of roll crescendo before the hit)."""
    n = _n(d); t = _t(n); f = hz(m)
    hit = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t / 0.3)) * np.exp(-t / 0.7) + 0.3 * lp(_r(6).standard_normal(n), 800) * np.exp(-t / 0.03)
    if not roll: return hit
    nr = _n(roll); tr = _t(nr); rr = np.zeros(nr)
    for k in np.arange(0, roll, 0.045):
        i = int(k * SR); seg = np.sin(2 * np.pi * f * tr[:_n(0.3)]) * np.exp(-tr[:_n(0.3)] / 0.12); j = min(nr, i + len(seg)); rr[i:j] += seg[:j - i] * 0.25
    rr *= np.linspace(0.1, 1, nr) ** 2
    return np.concatenate([rr, hit])


def cymbal(d=2.0, swell=False):
    n = _n(d); t = _t(n); x = hp(_r(7).standard_normal(n), 3500) * 0.5
    return x * (np.linspace(0, 1, n) ** 3 if swell else np.exp(-t / 0.7))


def triangle(d=1.5): return modal(105, d, [1, 2.9, 5.1], [1, 0.5, 0.3], [0.9, 0.5, 0.3]) * 0.6


# ================================================================== music: the show's theme + cues
# Key family: theme in C major (60), "plan" music in G minor-ish, night in F, epilogue in D major. Tempo family 100-112.
THEME = [(72, .5), (76, .5), (79, .5), (81, .5), (79, 1), (76, .5), (77, .5), (79, .5), (76, .5), (72, .5), (74, .5), (72, 1.5)]
CHORDS_C = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]]          # C  Am  F  G


def _seq(notes, bpm, inst, t0=0.0, gain=1.0, length=None):
    B = 60 / bpm; parts = []; t = t0
    for m, b in notes:
        if m is not None: parts.append((inst(m, max(0.25, b * B + 0.4)), t, gain))
        t += b * B
    return parts, t


def _loop(bar_fn, dur, bpm, beats=4):
    """Repeat a bar generator until dur; bar_fn(k, t0) -> parts. Returns parts."""
    B = 60 / bpm; parts = []; k = 0; t = 0.0
    while t < dur - 0.05:
        parts += bar_fn(k, t); k += 1; t += beats * B
    return parts


def _finish(parts, dur, tail=1.2, rel=0.6):
    x = mix(*parts, dur=dur + tail) if parts else np.zeros(_n(dur + tail))
    x = x[:_n(dur + tail)]; n = len(x); t = _t(n)
    e = np.clip((dur + tail - t) / max(rel, 1e-3), 0, 1); return norm(x * e, 0.95)


def theme_sting(bpm=132, key=0):
    """Title sting (~2.5 s): xylophone theme head + pizz + brass hit + cymbal."""
    B = 60 / bpm; head = [(72, .5), (76, .5), (79, .5), (84, 1.5)]
    p, t = _seq([(m + key, b) for m, b in head], bpm, xylo, 0, 0.9)
    p2, _ = _seq([(m + key - 12, b) for m, b in head], bpm, pizz, 0, 0.5)
    hit = 1.5 * B; ch = [60 + key, 64 + key, 67 + key, 72 + key]
    p += p2 + [(sum(brass(m, 1.2, att=0.01) for m in ch) / 3, hit, 0.6), (timpani(36 + key, 1.4), hit, 0.7), (cymbal(1.6), hit, 0.35),
               (glock(96 + key, 1.2), hit, 0.3)]
    return _finish(p, hit + 1.3, 0.4, 0.5)


def happy(dur, bpm=108, key=0, busy=1.0):
    """Light comedy underscore: ukulele chops (C Am F G), pizz bass, shaker, and the theme on marimba every other phrase."""
    B = 60 / bpm
    def bar(k, t0):
        ch = [m + key for m in CHORDS_C[k % 4]]; p = [(upright(ch[0] - 12 + 12, 0.5), t0, 0.55), (upright(ch[0] + 7 - 12 + 12, 0.5), t0 + 2 * B, 0.45)]
        for s in (0.5, 1.5, 2.5, 3.5):                                         # off-beat uke chops
            p.append((sum(ukulele(m + 12, 0.35, 0.8) for m in ch[1:]) / 2.2, t0 + s * B, 0.45))
        if busy > 0.5:
            for s in range(8): p.append((shaker(), t0 + s * B / 2, 0.25 if s % 2 else 0.35))
        return p
    p = _loop(bar, dur, bpm)
    if busy >= 1.0:
        k = 0; t = 4 * 4 * B
        while t + 8 * B < dur:                                                  # theme answers: bars 5-8, 13-16...
            q, _ = _seq([(m + key, b) for m, b in THEME], bpm, marimba, t, 0.5); p += q; t += 8 * 4 * B
    return _finish(p, dur)


def scheme(dur, bpm=112, key=0):
    """Sam has a PLAN: mischievous pizzicato ostinato in G minor + bassoon line, woodblock ticks (Plans B-F)."""
    B = 60 / bpm; G = 55 + key
    ost = [G, G + 3, G + 7, G + 3, G + 8, G + 7, G + 3, G + 2]
    line = [(G - 12, 1), (G - 9, 1), (G - 5, 1.5), (G - 7, .5), (G - 9, 1), (G - 10, 1), (G - 12, 2)]
    def bar(k, t0):
        p = [(pizz(ost[i] + (5 if k % 4 == 2 else 0), 0.3), t0 + i * B / 2, 0.55) for i in range(8)]
        p += [(upright(G - 24 + (5 if k % 4 == 2 else 0), 0.5), t0, 0.6), (upright(G - 17, 0.5), t0 + 2 * B, 0.45)]
        p += [(woodblock(84 if i % 2 else 79), t0 + i * B, 0.18) for i in range(4)]
        return p
    p = _loop(bar, dur, bpm)
    t = 2 * 4 * B
    while t + 8 * B < dur:
        q, _ = _seq(line, bpm, lambda m, d: reed(m, d, bright=0.6), t, 0.42); p += q; t += 4 * 4 * B
    return _finish(p, dur)


def sneaky(dur, bpm=96, key=0):
    """Tiptoe music (Operation Don't Look): staccato pizz on every step, low reed + chromatic walk, soft snare brush."""
    B = 60 / bpm; E = 52 + key
    walk = [E, E + 3, E + 4, E + 7, E + 6, E + 7, E + 4, E + 3]
    tune = [(E + 12, .5), (None, .5), (E + 15, .5), (None, .5), (E + 16, .5), (E + 19, .5), (E + 18, 1), (None, 1),
            (E + 16, .5), (None, .5), (E + 15, .5), (E + 12, .5), (E + 11, 1), (None, 1)]
    def bar(k, t0):
        p = [(pizz(walk[i] - 12, 0.25), t0 + i * B / 2, 0.6) for i in range(8)]
        p += [(snare(0.08) * 0.3, t0 + (i + 0.5) * B, 0.25) for i in range(4)]
        return p
    p = _loop(bar, dur, bpm)
    t = 2 * 4 * B
    while t + 8 * B < dur:
        q, _ = _seq(tune, bpm, lambda m, d: reed(m, d * 0.7, bright=0.3, att=0.02), t, 0.45); p += q; t += 4 * 4 * B
    return _finish(p, dur)


def groove(dur, bpm=104, key=0, speaker=True):
    """Plan E's boombox: a funky drum + slap-bass + clav groove (through a small speaker by default)."""
    B = 60 / bpm; R = 43 + key
    bl = [(0, R), (0.75, R), (1.5, R + 12), (2, R + 10), (2.5, R + 7), (3, R + 5), (3.5, R + 3)]
    def bar(k, t0):
        p = [(kick(), t0, 0.9), (kick(), t0 + 1.75 * B, 0.6), (kick(), t0 + 2.5 * B, 0.8), (snare(), t0 + B, 0.7), (snare(), t0 + 3 * B, 0.7)]
        p += [(hat(open_=(i == 7)), t0 + i * B / 2, 0.5 if i % 2 else 0.35) for i in range(8)]
        p += [(synbass(m, 0.28), t0 + s * B, 0.75) for s, m in bl]
        for s in (0.5, 1.25, 2.5, 3.25): p.append((sum(ukulele(m, 0.15, 0.95) for m in (R + 22, R + 26, R + 29)) / 2, t0 + s * B, 0.4))
        return p
    x = _finish(_loop(bar, dur, bpm), dur, 0.3, 0.2)
    return norm(small_speaker(x), 0.95) if speaker else x


def lullaby(dur, bpm=72, key=0):
    """Night: music box waltz in F over a soft string pad (3/4)."""
    B = 60 / bpm; F = 65 + key
    mel = [(F + 7, 1), (F + 4, 1), (F + 5, 1), (F + 7, 2), (F, 1), (F + 2, 1), (F + 4, 1), (F + 5, 1), (F + 4, 1), (F + 2, 1), (F, 2)]
    chords = [[F - 24, F - 17, F - 12], [F - 19, F - 12, F - 7], [F - 22, F - 15, F - 10], [F - 17, F - 10, F - 5]]
    def bar(k, t0):
        ch = chords[k % 4]; p = [(strings([c + 12 for c in ch], 3 * B + 0.8, 0.6, 0.8), t0, 0.35), (celesta(ch[0] + 12, 1.5), t0, 0.35)]
        p += [(celesta(ch[1] + 24, 0.9), t0 + B, 0.18), (celesta(ch[2] + 24, 0.9), t0 + 2 * B, 0.18)]
        return p
    p = _loop(bar, dur, bpm, beats=3)
    t = 3 * B * 2
    while t + 12 * B < dur:
        q, _ = _seq(mel, bpm, musicbox, t, 0.55); p += q; t += 3 * B * 8
    return _finish(p, dur, 2.0, 1.5)


def tension(dur, key=0):
    """Staring contest / suspense: tremolo strings on a minor chord + a low heartbeat timpani."""
    p = [(strings([50 + key, 53 + key, 57 + key], dur, 0.8, 0.8, trem=11), 0, 0.6), (strings([38 + key], dur, 1.2, 0.8), 0, 0.4)]
    t = 0.5
    while t < dur - 0.5: p.append((timpani(38 + key, 0.6), t, 0.3)); t += 1.6
    return _finish(p, dur, 0.8, 0.6)


def inspire(dur=6.0, key=0):
    """Plan C's coach speech: strings swell + timpani roll + brass chord at the end (cut with a record scratch!)."""
    ch = [48 + key, 55 + key, 60 + key, 64 + key, 67 + key]
    p = [(strings(ch, dur, dur * 0.8, 0.5), 0, 0.8), (timpani(36 + key, 1.2, roll=dur * 0.7), 0, 0.5)]
    p += [(sum(brass(m, 1.6, att=0.04) for m in ch[1:]) / 3, dur - 1.6, 0.6), (cymbal(dur * 0.6, swell=True), dur * 0.4, 0.4)]
    return _finish(p, dur, 0.2, 0.15)


def magic_grow(dur=2.0, key=0):
    """A shimmering upward glissando (the tree grows / sprout pops): glock + celesta arpeggio + soft strings swell."""
    notes = [72, 76, 79, 84, 88, 91, 96, 100]; p = []
    for i, m in enumerate(notes): p.append((glock(m + key, 1.2), i * dur / len(notes) * 0.7, 0.4)); p.append((celesta(m + key - 12, 1.0), i * dur / len(notes) * 0.7, 0.25))
    p.append((strings([60 + key, 64 + key, 67 + key, 72 + key], dur + 0.5, dur * 0.6, 0.6), 0, 0.35))
    return _finish(p, dur, 1.0, 0.8)


def timelapse(dur, key=0):
    """Night time-lapse to dawn: music box arpeggios that speed up, warming into a major string chord at the end."""
    p = []; t = 0.0; F = 65 + key; arp = [0, 4, 7, 12, 16, 12, 7, 4]; i = 0
    while t < dur - 2.5:
        step = 0.32 - 0.2 * (t / dur); p.append((musicbox(F + arp[i % 8] + (5 if (i // 16) % 2 else 0), 1.0), t, 0.45)); t += step; i += 1
    p.append((strings([F - 12, F - 5, F, F + 4], dur, dur * 0.7, 1.5), 0, 0.4))
    p += [(glock(F + 24, 2.0), dur - 2.4, 0.4), (glock(F + 28, 2.0), dur - 2.2, 0.35), (glock(F + 31, 2.0), dur - 2.0, 0.35), (triangle(2.0), dur - 2.4, 0.3)]
    return _finish(p, dur, 2.0, 1.5)


def seasons(dur, bpm=92, key=2):
    """Epilogue: the theme, slower and warm (D major): ukulele arpeggios, glockenspiel melody, upright bass."""
    B = 60 / bpm
    def bar(k, t0):
        ch = [m + key for m in CHORDS_C[k % 4]]; p = [(upright(ch[0], 0.8), t0, 0.5)]
        for s, m in zip((0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5), (ch[1], ch[2], ch[3], ch[2]) * 2): p.append((ukulele(m + 12, 0.8, 0.6), t0 + s * B, 0.3))
        return p
    p = _loop(bar, dur, bpm)
    t = 2 * 4 * B
    while t + 8 * B < dur:
        q, _ = _seq([(m + key, b) for m, b in THEME], bpm, glock, t, 0.4); p += q; t += 4 * 4 * B
    return _finish(p, dur, 1.5, 1.0)


def end_theme(dur=10.0, bpm=116, key=0):
    """End card: the full theme with band (xylophone lead, uke, bass, drums), resolves on C with a button."""
    B = 60 / bpm
    def bar(k, t0):
        ch = [m + key for m in CHORDS_C[k % 4]]
        p = [(kick(), t0, 0.5), (snare(), t0 + B, 0.35), (kick(), t0 + 2 * B, 0.5), (snare(), t0 + 3 * B, 0.35)]
        p += [(upright(ch[0], 0.5), t0, 0.6), (upright(ch[0] + 7, 0.5), t0 + 2 * B, 0.5)]
        p += [(sum(ukulele(m + 12, 0.3, 0.85) for m in ch[1:]) / 2.2, t0 + s * B, 0.4) for s in (0.5, 1.5, 2.5, 3.5)]
        return p
    bars_end = (dur - 1.5)
    p = _loop(bar, bars_end, bpm)
    q, t = _seq([(m + key, b) for m, b in THEME], bpm, xylo, 0, 0.6); p += q
    q, _ = _seq([(m + key, b) for m, b in THEME], bpm, xylo, 4 * 4 * B, 0.6); p += q
    tb = int(bars_end / (4 * B)) * 4 * B
    ch = [60 + key, 64 + key, 67 + key, 72 + key]
    p += [(sum(brass(m, 1.0, att=0.01) for m in ch) / 3, tb, 0.5), (timpani(36 + key, 1.4), tb, 0.6), (glock(96 + key, 1.5), tb, 0.3), (cymbal(1.5), tb, 0.3)]
    return _finish(p, tb + 1.2, 0.5, 0.5)


def sting(kind="dun"):
    """Comedy stingers: "dun" (dramatic dun-dun-DUN), "sad" (sad trombone), "ta-da", "uh-oh", "hit" (orchestral hit)."""
    if kind == "dun":
        p = [(brass(43, 0.35, att=0.01) + brass(31, 0.35, att=0.01), 0, 0.6), (brass(42, 0.35, att=0.01) + brass(30, 0.35, att=0.01), 0.45, 0.6),
             (brass(41, 1.6, att=0.01, vib=0.008) + brass(29, 1.6, att=0.01), 0.9, 0.8), (timpani(29, 1.8), 0.9, 0.9), (strings([53, 56, 59], 1.8, 0.05, 0.8, trem=13), 0.9, 0.4)]
        return _finish(p, 2.5, 0.3, 0.4)
    if kind == "sad":
        p = [(brass(58, 0.5, mute=0.8), 0, 0.7), (brass(57, 0.5, mute=0.8), 0.55, 0.7), (brass(56, 0.5, mute=0.8), 1.1, 0.7), (brass(55, 1.8, bend=-0.8, mute=0.9, vib=0.03), 1.65, 0.8)]
        return _finish(p, 3.4, 0.3, 0.4)
    if kind == "ta-da":
        p = [(brass(67, 0.18, att=0.01), 0, 0.6), (sum(brass(m, 1.2, att=0.01) for m in (60, 64, 67, 72)) / 2.5, 0.2, 0.7), (cymbal(1.2), 0.2, 0.3), (glock(84, 1.2), 0.2, 0.3)]
        return _finish(p, 1.5, 0.2, 0.3)
    if kind == "uh-oh":
        p = [(xylo(76, 0.5), 0, 0.7), (xylo(72, 0.5), 0.18, 0.7), (marimba(67, 1.0), 0.36, 0.6), (upright(43, 1.0), 0.36, 0.6)]
        return _finish(p, 1.2, 0.2, 0.3)
    if kind == "hit":
        ch = [48, 55, 60, 64, 67, 72]
        p = [(sum(brass(m, 1.4, att=0.005) for m in ch) / 3.5, 0, 0.8), (timpani(36, 1.8), 0, 0.9), (cymbal(2.0), 0, 0.45), (strings(ch, 1.5, 0.01, 1.0), 0, 0.5)]
        return _finish(p, 1.8, 0.4, 0.5)
    raise KeyError(kind)


CUES = {"theme": theme_sting, "happy": happy, "scheme": scheme, "sneaky": sneaky, "groove": groove, "lullaby": lullaby,
        "tension": tension, "inspire": inspire, "magic": magic_grow, "timelapse": timelapse, "seasons": seasons, "end": end_theme}


def cue(name, dur=None, **kw):
    """Music cue by name, cut to `dur` seconds (+ a short tail): theme (title sting, fixed length) · happy · scheme ·
    sneaky · groove (boombox) · lullaby · tension · inspire · magic · timelapse · seasons · end."""
    f = CUES[name]
    if name == "theme": return f(**kw)
    return f(dur, **kw) if dur is not None else f(**kw)


# ================================================================== SFX (synthesized cartoon sounds)
def boing(d=0.9, f=220):
    n = _n(d); t = _t(n); fr = f * (1 + 0.5 * np.exp(-t / 0.25) * np.sin(2 * np.pi * 14 * t)) * (1 + 0.3 * np.exp(-t / 0.05))
    ph = 2 * np.pi * np.cumsum(fr) / SR; return fade((np.sin(ph) + 0.3 * np.sin(2 * ph)) * np.exp(-t / 0.35), 0.002, 0.1)


def bonk(d=0.7):
    """Head bonk: hollow wood knock (two modes) + a ringing boing tail."""
    w = modal(70, 0.4, [1, 1.58, 2.9, 4.2], [1, 0.7, 0.35, 0.2], [0.09, 0.06, 0.03, 0.02], click=0.4)
    return norm(mix((w, 0, 1.0), (boing(0.6, 520), 0.02, 0.35), (np.sin(sweep(160, 60, 0.15)) * np.exp(-_t(_n(0.15)) / 0.05), 0, 0.6), dur=d))


def slide_whistle(up=False, d=1.0):
    n = _n(d); t = _t(n); f0, f1 = (500, 2000) if up else (2000, 450)
    fr = (f0 * (f1 / f0) ** (t / d)) * (1 + 0.012 * np.sin(2 * np.pi * 6 * t)); ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.sin(ph) + 0.08 * np.sin(2 * ph) + 0.05 * bp(_r(8).standard_normal(n), 1000, 4000)
    return fade(s * env(n, 0.05, 0.12, d), 0.01, 0.08)


def fall_whistle(d=0.8):
    n = _n(d); t = _t(n); return fade(np.sin(sweep(2400, 900, d)) * env(n, 0.05, 0.1, d) * 0.8, 0.01, 0.05)


def splash(d=1.8, big=True):
    """Bucket of water: a low watery slap, bubbly gurgles and a rain of droplets (little hiss)."""
    n = _n(d); t = _t(n); r = _r(9)
    body = bp(r.standard_normal(n), 250, 2500) * (np.minimum(1, t / 0.015) * np.exp(-t / (0.22 if big else 0.1)))
    low = lp(r.standard_normal(n), 300) * np.exp(-t / 0.12) * 1.2 + 0.5 * np.sin(sweep(140, 60, d)) * np.exp(-t / 0.08)
    bub = np.zeros(n)
    for _ in range(70 if big else 20):
        i = int(r.uniform(0.0, d * 0.6) * SR); m = _n(r.uniform(0.02, 0.05)); f = r.uniform(250, 900)
        ph = sweep(f, f * 2.5, m / SR); m = len(ph); bub[i:i + m] += (r.uniform(0.3, 1) * np.sin(ph) * np.sin(np.pi * _t(m) / (m / SR)))[:len(bub[i:i + m])]
    drops = np.zeros(n)
    for _ in range(110 if big else 30):
        i = int(r.uniform(0.15, d * 0.9) * SR); m = _n(0.03); f = r.uniform(900, 2200)
        ph = sweep(f, f * 1.8, 0.03); m = len(ph); drops[i:i + m] += (r.uniform(0.2, 0.7) * np.sin(ph) * np.exp(-_t(m) / 0.008))[:len(drops[i:i + m])]
    return norm(fade(0.8 * body + low + 0.7 * bub * np.exp(-t / 0.4) + 0.45 * drops * np.exp(-t / 0.9), 0.001, 0.2))


def drips(d=4.0, rate=2.2, seed=10):
    n = _n(d); r = _r(seed); out = np.zeros(n); t = 0.1
    while t < d - 0.1:
        i = int(t * SR); m = _n(0.06); f = r.uniform(700, 1200)
        out[i:i + m] += np.sin(sweep(f, f * 2.2, 0.06)[:m]) * np.exp(-_t(m) / 0.015) * r.uniform(0.4, 1); t += r.exponential(1 / rate) + 0.08
    return norm(out)


def record_scratch(d=0.7):
    n = _n(d); t = _t(n); r = _r(11); x = r.standard_normal(n)
    sp = np.sin(2 * np.pi * 2.6 * t) ; out = np.zeros(n); blk = 256
    for i in range(0, n, blk):
        c = 600 + 2800 * abs(sp[i]); out[i:i + blk] = bp(x[i:i + blk + 2048], c * 0.7, c * 1.4)[:len(out[i:i + blk])]
    tone = np.sin(2 * np.pi * np.cumsum(300 + 250 * sp) / SR) * 0.3
    return norm(fade((out + tone) * env(n, 0.005, 0.1, d), 0.002, 0.05))


def coach_whistle(d=0.7):
    """Pea whistle: ~2.9 kHz with the pea's fast trill."""
    n = _n(d); t = _t(n); fr = 2900 * (1 + 0.04 * np.sin(2 * np.pi * 38 * t)); ph = 2 * np.pi * np.cumsum(fr) / SR
    s = (np.sin(ph) + 0.25 * np.sin(2 * ph)) * (0.75 + 0.25 * np.sin(2 * np.pi * 38 * t)) + 0.15 * bp(_r(12).standard_normal(n), 2000, 6000)
    return fade(s * env(n, 0.02, 0.06, d), 0.003, 0.04) * 0.8


def squeak(d=0.5, f=1500, n_=3, seed=13):
    """Squeaky wheel / hinge: n_ chirpy squeaks."""
    out = np.zeros(_n(d * n_)); r = _r(seed)
    for k in range(n_):
        m = _n(d * 0.6); tt = _t(m); fr = f * r.uniform(0.85, 1.15) * (1 + 0.15 * np.sin(np.pi * tt / (d * 0.6))) * (1 + 0.01 * np.sin(2 * np.pi * 60 * tt))
        s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * tt / (d * 0.6)) ** 2 * (1 + 0.5 * np.sin(2 * np.pi * 90 * tt)) / 1.5
        i = int(k * d * SR); out[i:i + m] += s
    return out * 0.6


def dirt_dump(d=1.4):
    n = _n(d); t = _t(n); r = _r(14)
    return norm(fade(lp(r.standard_normal(n), 1200) * np.minimum(1, t / 0.05) * np.exp(-t / 0.35) + 0.5 * np.sin(sweep(90, 40, d)) * np.exp(-t / 0.2)
                     + 0.3 * bp(r.standard_normal(n), 2000, 7000) * np.exp(-t / 0.5) * (r.random(n) < 0.05), 0.002, 0.2))


def flies(d=4.0, k=3):
    n = _n(d); t = _t(n); out = np.zeros(n); r = _r(15)
    for i in range(k):
        f = r.uniform(170, 260) * (1 + 0.08 * np.sin(2 * np.pi * r.uniform(0.3, 0.9) * t + i)); ph = np.cumsum(f) / SR
        saw = 2 * (ph % 1) - 1; out += bp(saw, 300, 3000) * (0.5 + 0.5 * np.sin(2 * np.pi * r.uniform(0.2, 0.6) * t + i * 2)) ** 2
    return norm(out * env(n, 0.3, 0.4, d)) * 0.7


def power_down(d=1.0):
    n = _n(d); t = _t(n); ph = np.cumsum(220 * (40 / 220) ** (t / d)) / SR; return fade(lp(2 * (ph % 1) - 1, 1500) * env(n, 0.005, 0.2, d), 0.002, 0.1) * 0.8


def sizzle(d=1.6):
    n = _n(d); r = _r(16); x = hp(r.standard_normal(n), 3000) * 0.3; cr = (r.random(n) < 0.002) * r.uniform(-1, 1, n)
    return norm(fade((x + bp(cr, 1500, 8000) * 3) * env(n, 0.05, 0.3, d), 0.01, 0.1))


def steam(d=1.5):
    n = _n(d); t = _t(n); return norm(hp(_r(17).standard_normal(n), 2500) * np.minimum(1, t / 0.03) * np.exp(-t / 0.5)) * 0.8


def buzzer(d=0.6):
    n = _n(d); t = _t(n); sq = np.sign(np.sin(2 * np.pi * 130 * t)) + 0.5 * np.sign(np.sin(2 * np.pi * 137 * t)); return fade(lp(sq, 2500) * 0.4, 0.005, 0.03)


def twinkle(d=1.0, base=84):
    return mix(*[(glock(base + m, 0.9), i * 0.06, 0.6) for i, m in enumerate((0, 7, 12, 16, 19))], dur=d)


def ding(m=88): return glock(m, 1.2)


def pop(d=0.18, f0=400, f1=1400):
    n = _n(d); t = _t(n); return fade(np.sin(sweep(f0, f1, d)) * np.exp(-t / 0.04) + 0.2 * hp(_r(18).standard_normal(n), 2000) * np.exp(-t / 0.004), 0.0005, 0.02)


def bloop(d=0.25): return pop(d, 300, 900) * 0.9


def whoosh(d=0.45, lo=300, hi=3500, seed=19):
    n = _n(d); t = _t(n); x = _r(seed).standard_normal(n); out = np.zeros(n); blk = 512; sh = np.sin(np.pi * t / d) ** 2
    for i in range(0, n, blk):
        c = lo + (hi - lo) * sh[i]; out[i:i + blk] = bp(x[i:i + blk + 1024], c * 0.6, c * 1.6)[:len(out[i:i + blk])]
    return norm(out * sh)


def gulp(d=0.35): n = _n(d); t = _t(n); return fade(np.sin(sweep(700, 180, d)) * np.exp(-t / 0.1) * 0.9 + 0.3 * np.sin(sweep(400, 120, d)), 0.002, 0.05)
def eye_twitch(): return mix((pop(0.06, 2400, 2600), 0, 0.5), (pop(0.06, 2400, 2600), 0.12, 0.5))


def rustle(d=1.2, seed=20, rate=14):
    n = _n(d); t = _t(n); r = _r(seed); x = bp(r.standard_normal(n), 1500, 9000)
    am = np.clip(np.convolve((r.random(n) < rate / SR).astype(float) * r.uniform(0.3, 1, n), np.exp(-np.arange(_n(0.06)) / _n(0.015)), "same"), 0, 1)
    return norm(x * (0.15 + am) * env(n, 0.05, 0.2, d))


def peck(n_=3, gap=0.09):
    return mix(*[(woodblock(96, 0.06), k * gap, 0.7) for k in range(n_)], dur=n_ * gap + 0.1)


def crunch(d=0.5, seed=21):
    n = _n(d); t = _t(n); r = _r(seed); g = (r.random(n) < 0.004) * r.uniform(-1, 1, n)
    x = np.convolve(g, np.exp(-np.arange(_n(0.01)) / _n(0.002)), "same"); return norm(bp(x, 800, 8000) * np.exp(-t / 0.25) + 0.3 * lp(r.standard_normal(n), 500) * np.exp(-t / 0.05))


def beep(f=2000, d=0.12): n = _n(d); return fade(np.sin(2 * np.pi * f * _t(n)) * 0.6, 0.003, 0.01)


def camera_beep(): return mix((beep(1900, 0.09), 0, 1), (beep(2500, 0.12), 0.12, 1))


def snore(d=3.2):
    """One snore cycle: a fluttery inhale rasp, then a soft whistly exhale."""
    n = _n(d); t = _t(n); r = _r(22); ia = _n(d * 0.45)
    inh = lp(r.standard_normal(ia), 700) * (1 + 0.9 * np.sin(2 * np.pi * 28 * _t(ia))) * np.sin(np.pi * _t(ia) / (d * 0.45)) ** 2
    inh += 0.4 * np.sin(2 * np.pi * np.cumsum(90 + 10 * np.sin(2 * np.pi * 28 * _t(ia))) / SR) * np.sin(np.pi * _t(ia) / (d * 0.45)) ** 2
    ex_n = n - ia - _n(0.15); te = _t(ex_n)
    exh = 0.35 * bp(r.standard_normal(ex_n), 500, 2500) * np.sin(np.pi * te / (ex_n / SR)) ** 2 + 0.25 * np.sin(sweep(900, 700, ex_n / SR)) * np.sin(np.pi * te / (ex_n / SR)) ** 2
    out = np.zeros(n); out[:ia] = inh; out[ia + _n(0.15):] = exh; return norm(out) * 0.8


def tree_creak(d=1.6, seed=23):
    n = _n(d); t = _t(n); r = _r(seed); f = 70 * (1 + 0.6 * t / d)
    pulses = np.zeros(n); tt = 0.0
    while tt < d - 0.02: pulses[int(tt * SR)] = r.uniform(0.5, 1); tt += 1 / (f[int(tt * SR)] * r.uniform(0.9, 1.1))
    s = bp(np.convolve(pulses, np.exp(-np.arange(200) / 40), "same"), 300, 3000)
    return norm(s * env(n, 0.15, 0.2, d)) * 0.8


def rumble(d=2.0): n = _n(d); t = _t(n); return norm(lp(_r(24).standard_normal(n), 120, 4) * env(n, d * 0.6, 0.3, d)) * 0.9


def boom(d=2.0):
    n = _n(d); t = _t(n)
    return norm(np.sin(sweep(80, 32, d)) * np.exp(-t / 0.6) + 0.7 * lp(_r(25).standard_normal(n), 300) * np.exp(-t / 0.3) + 0.25 * rustle(d, 26, 30)[:n] * np.exp(-t / 0.6))


def dizzy(d=2.4):
    """Little birds circling a bonked head: a looping 'tweety' figure."""
    out = []; tt = 0.0; k = 0
    while tt < d - 0.2:
        f = (2800, 3400, 3000, 3600)[k % 4]; m = _n(0.11); out.append((np.sin(sweep(f, f * 1.25, 0.11)) * np.sin(np.pi * _t(m) / 0.11) ** 2, tt, 0.6)); tt += 0.16; k += 1
    return mix(*out, dur=d)


def knitting(d=4.0, rate=3.0, seed=27):
    n = _n(d); out = np.zeros(n); r = _r(seed); t = 0.05
    while t < d - 0.05:
        c = modal(r.uniform(100, 104), 0.05, [1, 2.3], [1, 0.4], [0.008, 0.004], click=0.3); i = int(t * SR); out[i:i + len(c)] += c[:n - i] * r.uniform(0.5, 1)
        t += 1 / rate * r.uniform(0.8, 1.2)
    return out * 0.7


def rake(d=1.0, seed=28):
    """One rake stroke through dry leaves: crackly leaf rustle, swelling then fading, plus soft tine scratches."""
    n = _n(d); t = _t(n); r = _r(seed); s = np.sin(np.pi * t / d) ** 1.5
    return norm((0.8 * rustle(d, seed, 40)[:n] + 0.25 * bp(r.standard_normal(n), 800, 3000)) * s)


def clock_tick(d=2.0, rate=2.0):
    return mix(*[(woodblock(91 if k % 2 else 86, 0.05), k / rate, 0.6) for k in range(int(d * rate))], dur=d)


def zipper(d=0.5): n = _n(d); t = _t(n); return norm(bp(_r(29).standard_normal(n), 2000, 8000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * (60 + 80 * t / d) * t))) * env(n, 0.01, 0.05, d)) * 0.6


def owl(d=1.6):
    def hoot(dd):
        m = _n(dd); tt = _t(m); fr = 370 * (1 + 0.06 * np.sin(np.pi * tt / dd)); ph = 2 * np.pi * np.cumsum(fr) / SR
        return (np.sin(ph) + 0.15 * np.sin(2 * ph) + 0.05 * bp(_r(30).standard_normal(m), 300, 1200)) * np.sin(np.pi * tt / dd) ** 2
    return mix((hoot(0.35), 0, 0.8), (hoot(0.22), 0.55, 0.6), (hoot(0.45), 0.85, 0.8), dur=d)


def chirp(k=0, d=0.16):
    n = _n(d); t = _t(n); f0 = 2600 + 350 * (k % 4); fr = f0 * (1 + 0.35 * np.sin(np.pi * t / d)) * (1 + 0.03 * np.sin(2 * np.pi * 70 * t))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * t / d) ** 2


def chirps(n_=2, seed=31):
    r = _r(seed); return mix(*[(chirp(int(r.integers(0, 9)), r.uniform(0.08, 0.16)), k * r.uniform(0.11, 0.17), r.uniform(0.6, 1)) for k in range(n_)])


def wings(d=0.7):
    n = _n(d); t = _t(n); x = bp(_r(32).standard_normal(n), 300, 2500); return norm(x * np.maximum(0, np.sin(2 * np.pi * 14 * t)) ** 2 * env(n, 0.02, 0.3, d)) * 0.6


def birdsong(d=10.0, density=1.2, seed=33):
    """Distant backyard birds (ambience): sparse phrases of chirps, high-passed and soft."""
    r = _r(seed); parts = []; t = 0.3
    while t < d - 1.0:
        k = int(r.integers(2, 6)); parts.append((chirps(k, int(r.integers(0, 999))) * r.uniform(0.3, 1.0), t, 1.0)); t += r.exponential(1 / density) + 0.4
    return hp(mix(*parts, dur=d), 1500) * 0.5


def yard_amb(d=20.0, seed=34):
    """Daytime yard bed: soft breeze + distant birds (loop-safe fades)."""
    n = _n(d); t = _t(n); br = lp(_r(seed).standard_normal(n), 500) * (0.5 + 0.3 * np.sin(2 * np.pi * 0.11 * t) + 0.2 * np.sin(2 * np.pi * 0.047 * t))
    return fade(norm(0.35 * norm(br) + birdsong(d, 0.9, seed)), 1.0, 1.0)


def night_amb(d=20.0, seed=35):
    n = _n(d); t = _t(n); cr = np.zeros(n)
    for k, (f, ph) in enumerate(((4300, 0), (4700, 1.7), (3900, 3.1))):
        c = _crickets(d) if k == 0 else np.roll(_crickets(d), int(ph * SR)); cr += c[:n] * (1 if k == 0 else 0.5)
    br = lp(_r(seed).standard_normal(n), 400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.08 * t))
    return fade(norm(0.6 * norm(cr) + 0.4 * norm(br)), 1.0, 1.0)


def stink(d=1.4):
    """Smell lines rising: a wobbly muted-trombone 'bwuh-wuh-wuhh' falling in pitch (comic disgust)."""
    return mix((brass(50, 0.35, mute=0.9, vib=0.02), 0, 0.7), (brass(49, 0.35, mute=0.9, vib=0.02), 0.38, 0.7),
               (brass(47, d - 0.7, bend=-1.5, mute=0.9, vib=0.04), 0.76, 0.8), dur=d + 0.1)


def bass_thump(d=2.0, bpm=104):
    return norm(small_speaker(mix(*[(kick(0.3), k * 60 / bpm / 2, 1.0) for k in range(int(d * bpm / 30))], dur=d)) + 0.4 * rumble(d)) * 0.9


def rope_creak(d=1.4): return tree_creak(d, 36) * 0.7


def tiptoe(steps=4, gap=0.32, m0=67):
    return mix(*[(pizz(m0 + (0, 3, 7, 3)[k % 4], 0.2), k * gap, 0.8) for k in range(steps)], dur=steps * gap + 0.3)


def sheep_bleat(d=0.6, f=320):
    """A cartoon 'baa' (counting sheep): a nasal buzzy tone with fast vibrato."""
    n = _n(d); t = _t(n); fr = f * (1 + 0.04 * np.sin(2 * np.pi * 9 * t)) * (1 - 0.1 * t / d); ph = np.cumsum(fr) / SR
    s = bp(2 * (ph % 1) - 1, 500, 2500) * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * t))
    return fade(s * env(n, 0.04, 0.2, d), 0.01, 0.08) * 0.7


SFX = {
    "boing": boing, "bonk": bonk, "slide_up": lambda: slide_whistle(True, 0.9), "slide_down": lambda: slide_whistle(False, 1.1),
    "fall_whistle": fall_whistle, "splash": splash, "small_splash": lambda: splash(0.8, False), "drips": drips,
    "record_scratch": record_scratch, "coach_whistle": coach_whistle, "squeak": squeak, "dirt_dump": dirt_dump, "flies": flies,
    "power_down": power_down, "sizzle": sizzle, "steam": steam, "buzzer": buzzer, "twinkle": twinkle, "ding": ding, "pop": pop,
    "bloop": bloop, "whoosh": whoosh, "whoosh_big": lambda: whoosh(0.9, 150, 2500, 40), "gulp": gulp, "eye_twitch": eye_twitch,
    "rustle": rustle, "peck": peck, "crunch": crunch, "camera_beep": camera_beep, "snore": snore, "tree_creak": tree_creak,
    "rumble": rumble, "boom": boom, "dizzy": dizzy, "knitting": knitting, "rake": rake, "clock_tick": clock_tick, "zip": zipper,
    "owl": owl, "chirp": lambda: chirp(1), "chirps": chirps, "wings": wings, "birdsong": birdsong, "yard_amb": yard_amb,
    "night_amb": night_amb, "crickets": lambda: _crickets(4.0), "wind": lambda: _wind(6.0), "stink": stink, "bass_thump": bass_thump,
    "rope_creak": rope_creak, "tiptoe": tiptoe, "baa": sheep_bleat,
    "sting_dun": lambda: sting("dun"), "sad_trombone": lambda: sting("sad"), "ta_da": lambda: sting("ta-da"),
    "uh_oh": lambda: sting("uh-oh"), "orch_hit": lambda: sting("hit"),
}
_cache = {}


def sfx(name, **kw):
    """A synthesized SFX by name (see SFX keys; kwargs go to the generator, e.g. sfx('drips', d=6))."""
    key = (name, tuple(sorted(kw.items())))
    if key not in _cache:
        f = SFX[name]; _cache[key] = norm(f(**kw) if kw else f(), 1.0)
    return _cache[key].copy()


# ================================================================== CC0 Foley (Kenney packs)
def foley_list():
    return sorted({os.path.splitext(os.path.basename(p))[0] for p in glob.glob(os.path.join(KENNEY, "**", "*.ogg"), recursive=True)})


def foley(name, k=None, rate=1.0):
    """A Kenney CC0 sound by file stem: foley('footstep_grass_002') or foley('footstep_grass', 2) (the k-th variant).
    rate != 1 resamples (pitch + speed). Useful stems: footstep_grass/_snow/_wood, impactWood_light/_medium/_heavy (knocks),
    impactSoft_medium/_heavy (body falls), impactPunch_*, impactPlank_medium, cloth1-4, creak1-3, bookFlip1-3, drop_00x,
    glass_00x (mug clink), click_00x, tick_00x, pluck_00x, metalPot1-3, jingles_PIZZI00-16 / jingles_STEEL / jingles_SAX /
    jingles_HIT / jingles_NES (short CC0 stingers)."""
    files = sorted(glob.glob(os.path.join(KENNEY, "**", name + ("*" if k is not None else "") + ".ogg"), recursive=True))
    if not files: raise FileNotFoundError(f"no Kenney sound '{name}' (see toon.foley_list())")
    p = files[(k or 0) % len(files)]
    x = load_audio(p)
    if rate != 1.0: x = np.interp(np.arange(0, len(x), rate), np.arange(len(x)), x)
    return norm(x, 1.0)


# ================================================================== demo reel
def demo(out):
    import wave
    items = [(k, sfx(k)[:_n(6)]) for k in SFX] + [(f"cue:{k}", cue(k, 8.0) if k != "theme" else cue(k)) for k in CUES]
    gap = _n(0.6); buf = []; marks = []; t = 0.0
    for name, x in items:
        marks.append((round(t, 2), name, round(len(x) / SR, 2))); buf += [x * 0.8, np.zeros(gap)]; t += len(x) / SR + 0.6
    y = np.concatenate(buf); y = np.clip(y, -1, 1)
    with wave.open(out, "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((y * 32767).astype(np.int16).tobytes())
    for m in marks: print(f"{m[0]:8.2f}  {m[1]:16} {m[2]:5.2f}s")
    print("wrote", out, f"{len(y) / SR:.1f} s")


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "demo": demo(sys.argv[2])
    elif len(sys.argv) > 2 and sys.argv[1] == "one":
        import wave
        x = cue(sys.argv[2], float(sys.argv[3])) if sys.argv[2] in CUES else sfx(sys.argv[2])
        with wave.open(sys.argv[-1], "wb") as f:
            f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    else: print(__doc__)
