"""P07 score + Foley (common/toon.py on the repo mixer tools/audio/sound.py). Run from this folder after dialogue.py.
Beats use the same formulas as film.js. Lunch on a light "happy" bed (rip, CRUNCH, chewing, Pip's wings + pecks); "sneaky"
for the camera plan (camera beep, tiptoes); a ticking clock under the card; a soft happy bed for the huddle; l6 is heard
through the phone speaker (T.small_speaker); dry beat + crickets after "Very... you."; "sneaky" again for the mirror with a
"magic" swell on every growth spurt and a glock hit on every freeze; "scheme" under the string, rope creaks; the music
DROPS OUT for Layla's quiet "you'll pull it out" and his answer; the "lullaby" from the golden hour to the end; night
ambience creeps in under the HOLD; the fade. Mastered to -16 LUFS (assembly goes to -14)."""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, "..", "..", "..", "..", "tools", "audio"), os.path.join(HERE, "..", "..", "common")]
from sound import Score, load_audio
import toon as T

os.chdir(HERE)
TL = json.load(open("timeline.json", encoding="utf-8"))
L = {l["id"]: l for l in TL["lines"]}; DUR = TL["total"]
def w(i, k): ws = L[i]["words"]; return ws[k if k >= 0 else len(ws) + k]

# ---- beats (same formulas as film.js)
t_rip = w("l1", 2)["t0"] - 0.12
t_cr1 = L["l2"]["end"] + 0.32; t_cr2 = L["l3"]["end"] + 0.12
t_pip_in = t_cr2 + 0.35; t_pip_grab = t_pip_in + 0.45; t_pip_head = t_pip_grab + 0.5
t_upA = L["l4"]["start"] - 0.05; t_pip_off = t_upA + 0.25; t_pip_home = t_pip_off + 1.3
t_phone = w("l4", 4)["t0"] - 0.35
t_plant = L["l4"]["end"] + 0.02; t_rec = t_plant + 0.75; t_tip0 = t_rec + 0.45; t_tip1 = t_tip0 + 1.8; t_peek = t_tip1 + 0.35
t_card0 = t_tip1 + 0.6; t_card1 = L["l5"]["start"] - 0.5
t_in = L["l5"]["end"] + 0.15; t_out = L["l6"]["end"] + 0.45
W6 = L["l6"]["words"]; pops = [W6[0]["t0"] - 0.28, W6[3]["t0"] - 0.22, W6[4]["t0"] - 0.22]
t_m = L["l8"]["end"] + 0.35
t_mir_up0 = L["l9"]["words"][5]["t0"] - 0.25
T0 = L["l9"]["end"]
CYC = [(T0 + 0.45, T0 + 1.5), (T0 + 2.3, T0 + 3.2), (T0 + 3.85, T0 + 4.45)]
GROW = [(a + 0.15, b - 0.06) for a, b in CYC]
W12 = L["l12"]["words"]
t_upC = L["l12"]["start"] - 0.1; t_tie0 = W12[2]["t0"] - 0.1; t_tie1 = W12[6]["t1"] + 0.05
t_back0 = t_tie1 + 0.15; t_back1 = t_back0 + 0.75; t_pull = W12[8]["t0"] - 0.05; t_yank = W12[10]["t0"] - 0.05
t_stop_knit = L["l13"]["start"] - 0.45; t_crack = w("l13", -1)["t0"] + 0.05
t_letgo = L["l13"]["end"] + 0.9; t_spring = t_letgo + 0.05
t_fwd0 = L["l14"]["start"] - 0.65
t_untie0 = w("l14", 1)["t0"] - 0.2; t_untie1 = L["l14"]["end"] + 0.35; t_pat = t_untie1 + 0.25
t_resume = L["l14"]["end"] + 0.5
t_standL = w("l15", 2)["t1"] + 0.05; t_pack0 = t_standL + 0.95; t_pack1 = t_pack0 + 1.4
t_fold0 = L["l16"]["end"] + 0.1; t_fold1 = t_fold0 + 0.9
t_turnL = L["l17"]["end"] + 0.12; t_walkL = t_turnL + 0.35
W19 = L["l19"]["words"]; t_eyes = W19[0]["t0"] - 0.3; t_point = W19[2]["t0"] - 0.12
t_blink = L["l19"]["end"] + 1.5; t_tick = t_blink + 0.12; t_snap = t_tick + 0.5

S = Score(DUR)
# ---- ambience (Foley bus): the yard by day, the night creeping in under the HOLD
S.sfx_add(T.sfx("yard_amb", d=DUR), 0.0, 0.06)
nd = DUR - (L["l18"]["start"])
S.sfx_add(T.sfx("night_amb", d=nd) * np.linspace(0, 1, len(T.sfx("night_amb", d=nd))), L["l18"]["start"], 0.07)

# ---- music
S.music_add(T.cue("happy", t_upA - 0.2, busy=0.7), 0.0, 0.7)                             # lunch
S.music_add(T.cue("sneaky", t_card0 - t_upA + 0.2), t_upA, 0.75)                          # the camera plan, tiptoes
S.music_gap(t_card0 - 0.05, t_card1 - 0.1, 0.1)
S.music_add(T.cue("happy", t_in - t_card1 + 0.2, busy=0.4), t_card1 - 0.1, 0.55)          # the huddle
S.music_gap(t_in + 0.1, L["l7"]["end"] + 1.0, 0.25)                                        # footage on the tiny speaker, dry beat
S.music_add(T.cue("happy", t_m - L["l7"]["end"] - 0.5, busy=0.4), L["l7"]["end"] + 0.6, 0.45)
S.music_gap(t_m - 0.05, t_m + 0.02, 0.04)
S.music_add(T.cue("sneaky", L["l10"]["start"] - t_m), t_m, 0.65)                           # the mirror
for a, b in GROW: S.music_add(T.cue("magic", 0.9), a - 0.05, 0.4)
S.music_gap(L["l10"]["start"] - 0.4, L["l10"]["end"] + 0.2, 0.2)
S.music_add(T.cue("magic", 2.0), L["l11"]["start"] - 0.1, 0.35)
S.music_add(T.cue("scheme", L["l13"]["start"] - L["l12"]["start"] + 0.5), L["l12"]["start"] - 0.2, 0.6)
S.music_gap(L["l13"]["start"] - 0.25, L["l14"]["end"] + 0.25, 0.2)                         # quiet: the music drops out
t_lull = L["l14"]["end"] + 0.3
S.music_add(T.cue("lullaby", DUR - t_lull), t_lull, 0.6)

# ---- Foley / gags
S.sfx_add(T.foley("cloth", 1), 0.4, 0.06)
S.sfx_add(T.sfx("zip", d=0.25), t_rip, 0.22)                                             # rips the lid
S.sfx_add(T.sfx("whoosh"), t_rip + 0.05, 0.12)
S.sfx_add(T.foley("drop", 1), t_rip + 0.8, 0.12)
for k in range(5): S.sfx_add(T.rustle(0.35, seed=40 + k, rate=10), L["l2"]["start"] + 0.2 + k * 0.55, 0.05)   # the wrapper, slowly
S.sfx_add(T.sfx("crunch"), t_cr1, 0.55); S.sfx_add(T.sfx("crunch", seed=5), t_cr1 + 0.32, 0.3)
for k in range(5): S.sfx_add(T.crunch(0.18, seed=60 + k), t_cr1 + 0.6 + k * 0.22, 0.12)   # chewing
S.sfx_add(T.sfx("crunch", seed=8), t_cr2, 0.55); S.sfx_add(T.sfx("crunch", seed=9), t_cr2 + 0.3, 0.28)
S.sfx_add(T.sfx("wings"), t_pip_in, 0.22); S.sfx_add(T.sfx("whoosh"), t_pip_grab - 0.1, 0.16)
S.sfx_add(T.crunch(0.15, seed=70), t_pip_grab, 0.2); S.sfx_add(T.sfx("wings"), t_pip_grab + 0.05, 0.16)
S.sfx_add(T.foley("click", 1), t_pip_head, 0.1); S.sfx_add(T.sfx("peck"), t_pip_head + 0.3, 0.2); S.sfx_add(T.sfx("peck"), t_pip_head + 0.8, 0.16)
S.sfx_add(T.chirp(2), t_pip_head + 1.3, 0.16)
S.sfx_add(T.sfx("wings"), t_pip_off, 0.22); S.sfx_add(T.chirp(3), t_pip_home + 0.3, 0.18)
S.sfx_add(T.sfx("whoosh"), t_upA, 0.1)
S.sfx_add(T.sfx("twinkle"), w("l4", 4)["t0"], 0.18)                                      # "technology"
S.sfx_add(T.foley("impactWood_light", 1), t_plant + 0.38, 0.2)
S.sfx_add(T.sfx("camera_beep"), t_rec, 0.22)
S.sfx_add(T.sfx("tiptoe", steps=6, gap=0.3), t_tip0 + 0.05, 0.25)
S.sfx_add(T.foley("cloth", 2), t_tip1 + 0.1, 0.12)
S.sfx_add(T.sfx("clock_tick", d=t_card1 - t_card0), t_card0, 0.22)
S.sfx_add(T.xylo(84, 0.5), t_card1 - 0.3, 0.2)
S.sfx_add(T.foley("click", 3), w("l5", -1)["t0"] - 0.05, 0.16)                          # taps play
S.sfx_add(T.sfx("pop"), t_in, 0.18)
for p in pops: S.sfx_add(T.sfx("whoosh", d=0.25), p - 0.05, 0.1)
S.sfx_add(T.sfx("crickets"), L["l7"]["end"] + 0.05, 0.08)
S.sfx_add(T.sfx("whoosh"), t_m - 0.1, 0.12); S.sfx_add(T.foley("cloth", 3), t_m + 0.1, 0.08)
S.sfx_add(T.sfx("whoosh", d=0.3), t_mir_up0, 0.08)
for i, (a, b) in enumerate(CYC):
    S.sfx_add(T.sfx("whoosh", d=0.3), a, 0.07)                                          # mirror down
    S.sfx_add(T.sfx("whoosh", d=0.25), b - 0.04, 0.14 if i < 2 else 0.22)                # mirror UP
    S.sfx_add(T.glock(91 if i < 2 else 96, 1.0), b, 0.2 if i < 2 else 0.28)             # FREEZE
for a, b in GROW: S.sfx_add(T.sfx("rustle", d=0.5), a, 0.08); S.sfx_add(T.sfx("twinkle"), a, 0.12)
S.sfx_add(T.sfx("eye_twitch"), CYC[2][1] + 0.7, 0.18)
S.sfx_add(T.sfx("crickets"), L["l10"]["end"] + 0.1, 0.06)
S.sfx_add(T.foley("cloth", 4), t_upC, 0.12)
for k in range(3): S.sfx_add(T.foley("cloth", k), t_tie0 + 0.4 + k * 0.3, 0.08)          # tying
S.sfx_add(T.sfx("rope_creak"), t_pull, 0.3); S.sfx_add(T.sfx("rope_creak"), t_yank, 0.4)
S.sfx_add(T.sfx("tree_creak"), t_yank + 0.2, 0.18)
S.sfx_add(T.sfx("dirt_dump", d=0.8), t_crack, 0.18)
S.sfx_add(T.sfx("gulp"), t_crack + 0.6, 0.18)
S.sfx_add(T.boing(0.7, 260), t_spring, 0.22); S.sfx_add(T.sfx("whoosh", d=0.3), t_letgo - 0.02, 0.12)
t = t_fwd0
while t < t_fwd0 + 0.6: S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.12); t += 0.3
for k in range(3): S.sfx_add(T.foley("cloth", k + 1), t_untie0 + 0.4 + k * 0.4, 0.06)
for k in range(3): S.sfx_add(T.foley("impactSoft_medium", k), t_pat + k * 0.33, 0.06)       # pat pat pat
S.sfx_add(T.sfx("knitting", d=t_stop_knit - t_card1), t_card1, 0.035)
S.sfx_add(T.sfx("knitting", d=L["l15"]["start"] - t_resume, seed=2), t_resume, 0.035)
S.sfx_add(T.foley("cloth", 2), t_standL, 0.14)
for k in range(3): S.sfx_add(T.foley("cloth", k + 2), t_pack0 + k * 0.45, 0.1)
S.sfx_add(T.sfx("zip"), t_pack1 - 0.1, 0.22)
S.sfx_add(T.foley("creak", 1), t_fold0 + 0.1, 0.15); S.sfx_add(T.foley("impactWood_light", 2), t_fold1 - 0.15, 0.2)
t = t_walkL
while t < t_walkL + 3.5: S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.16 * max(0.2, 1 - (t - t_walkL) / 3.5)); t += 0.5
S.sfx_add(T.chirp(1), L["l18"]["end"] + 0.2, 0.1)
S.sfx_add(T.sfx("whoosh", d=0.3), t_eyes, 0.1); S.sfx_add(T.sfx("whoosh", d=0.3), t_point, 0.12)
S.sfx_add(T.sting("dun"), t_point + 0.05, 0.25)
S.sfx_add(T.sfx("pop", f0=500, f1=1500), t_tick, 0.25); S.sfx_add(T.sfx("twinkle"), t_tick + 0.02, 0.12)
S.sfx_add(T.sfx("eye_twitch"), t_snap - 0.05, 0.2); S.sfx_add(T.sfx("whoosh", d=0.25), t_snap, 0.12)
S.sfx_add(T.sfx("owl"), t_snap + 0.9, 0.08)

# ---- voices: every line as recorded, except l6 which is heard through the phone's tiny speaker
S.voice({k: v["start"] for k, v in L.items() if k != "l6"}, "assets/voice/{}.mp3")
raw6 = load_audio("assets/voice/l6.mp3"); v6 = np.tanh(3.0 * T.bp(raw6, 420, 3400, order=3)) / 2.0
slap = int(0.045 * 44100); v6 = v6 + 0.22 * np.concatenate([np.zeros(slap), v6[:-slap]])   # tinny phone speaker + a little slapback
ref = np.median([np.sqrt(np.mean(load_audio("assets/voice/%s.mp3" % k) ** 2)) for k in L if k != "l6"])
v6 *= ref / (np.sqrt(np.mean(v6 ** 2)) + 1e-12) * 0.9          # as loud as the other takes (it was whispered)
S._add(S.vo, v6, L["l6"]["start"], 1.0); S.vo_spans.append((L["l6"]["start"], L["l6"]["start"] + len(v6) / 44100))
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav", music_gain=0.3, duck=0.6, fade_in=0.3, fade_out=0.6, lufs=-16)
