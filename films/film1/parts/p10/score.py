"""P10 score + Foley (common/toon.py on the repo mixer tools/audio/sound.py). Run from this folder after dialogue.py.
Beats use the same formulas as film.js. Sound plan: the "Years later..." card scribbles on while calendar pages flip; the
"seasons" cue (warm D-major theme) carries the montage. SUMMER: knock, tree rustle, falling whistle -> BONK, Pip giggles,
crunch. AUTUMN: three rake strokes, a proud xylophone ding, the GUST (big whoosh + wind + leaves), then the music DROPS
OUT for the glare (wind tail, a leaf plinks onto his head, eye twitch). WINTER: a wind bed instead of the yard, teeth
chatter, the snow cap thumps off, a mug clink + sip. SPRING: birds; egg cracks -> pops -> chick peeps (the third egg
late), a cartoon slide-whistle INHALE, the music stops, a soft "Grow.", two soft pats, footsteps walking away, pop +
twinkle for the sprout, Pip's wings + chirps, the iris closes on a pizzicato button; the END card plays "end", which
resolves on its final hit before the last frame. Mastered to -16 LUFS (assembly goes to -14)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, "..", "..", "..", "..", "tools", "audio"), os.path.join(HERE, "..", "..", "common")]
from sound import Score, scribble, thud, SR
import toon as T

os.chdir(HERE)
TL = json.load(open("timeline.json", encoding="utf-8"))
L = {l["id"]: l for l in TL["lines"]}; DUR = TL["total"]
def w(i, k): ws = L[i]["words"]; return ws[k if k >= 0 else len(ws) + k]

# ---- beats (same formulas as film.js)
T1 = L["l1"]["start"]
t_win = T1 - 6.0; t_aut = t_win - 5.0; t_sum = t_aut - 3.5
t_spr = L["l2"]["end"] + 0.1
t_lookup = t_sum + 0.3; t_knock = t_sum + 1.0; t_drop = t_knock + 0.15; t_bonk = t_drop + 0.42; t_catch = t_bonk + 0.55; t_bite = t_catch + 0.6
RP = 0.72; NSTROKE = 3; t_rake0 = t_aut + 0.35; t_rake1 = t_rake0 + RP * NSTROKE; t_proud = t_rake1 + 0.05
t_gust = t_proud + 0.55; t_glare = t_gust + 0.7; t_leaf = t_glare + 0.45
t_shiver = t_win + 3.3; t_sip = T1 - 1.7
t_plant = t_spr + 0.8; t_nest = L["l3"]["start"] - 7.6; t_h = [t_nest + 1.1, t_nest + 1.7, t_nest + 3.2]
t_inhale = L["l3"]["start"] - 2.1; t_brace = L["l3"]["start"] - 1.25
t_pat = L["l3"]["end"] + 0.25; t_stand = L["l5"]["start"] - 0.15
t_turn = L["l5"]["end"] + 0.25; t_ws = L["l5"]["end"] + 0.75; t_cu = L["l5"]["end"] + 2.75; t_pop = t_cu + 0.6
t_pip_in = t_pop + 0.45; t_pip_land = t_pop + 1.0
t_card = DUR - 10; t_iris = t_card - 2.5
t_flip0, FLIP = 0.75, 0.16
t_cp = [t_card + 2.0, t_card + 3.1, t_card + 4.3, t_card + 5.5]

S = Score(DUR)
# ---- ambience (Foley bus, low): yard -> autumn breeze -> winter wind -> spring yard + birds
S.sfx_add(T.sfx("yard_amb", d=t_aut - t_sum + 0.4), t_sum, 0.09)
S.sfx_add(T._wind(t_win - t_aut + 0.3) * 0.6, t_aut, 0.07)
S.sfx_add(T._wind(t_spr - t_win + 0.3), t_win, 0.11)
S.sfx_add(T.sfx("yard_amb", d=t_card - t_spr, seed=7), t_spr, 0.09)
S.sfx_add(T.sfx("birdsong", d=t_card - t_spr - 0.5), t_spr + 0.3, 0.05)

# ---- music: "seasons" across the montage, with comic drop-outs; "end" on the end card
S.music_add(T.cue("seasons", t_iris + 1.0), 0.15, 0.6)
S.music_gap(t_glare - 0.05, t_win - 0.05, 0.08)                   # the glare plays in a windy silence
S.music_gap(t_inhale + 0.5, L["l5"]["end"] + 0.3, 0.25)            # the huge breath... and a soft "Grow."
S.music_gap(t_iris + 2.1, DUR, 0.3)
end = T.cue("end", 9.8); S.music_add(end, max(t_card + 0.05, DUR - len(end) / SR - 0.02), 0.9)

# ---- CARD: "Years later..." scribbles on; the calendar sheds pages
S.sfx_add(scribble(0.9, 3), 0.1, 0.22)
k = 0; t = t_flip0
while t < t_sum - 0.2:
    S.sfx_add(T.foley("bookFlip", k % 3 + 1), t, 0.14); t += FLIP; k += 1

# ---- SUMMER
S.sfx_add(T.foley("impactWood_medium", 1), t_knock - 0.02, 0.4)
S.sfx_add(T.foley("impactWood_light", 3), t_knock + 0.14, 0.25)
S.sfx_add(T.sfx("rustle", d=0.6), t_knock, 0.18)
S.sfx_add(T.fall_whistle(t_bonk - t_drop + 0.05), t_drop, 0.16)
S.sfx_add(T.sfx("bonk"), t_bonk, 0.42)
S.sfx_add(T.sfx("dizzy", d=1.0), t_bonk + 0.15, 0.1)
for i, c in enumerate([t_bonk + 0.35, t_bonk + 0.55, t_bonk + 0.75]): S.sfx_add(T.chirp(i + 1), c, 0.2)   # Pip giggles
S.sfx_add(T.foley("impactSoft_medium", 2), t_catch, 0.22)
S.sfx_add(T.sfx("crunch"), t_bite + 0.15, 0.4)
S.sfx_add(T.sfx("crunch", d=0.3), t_bite + 0.55, 0.15)

# ---- AUTUMN
for n in range(NSTROKE): S.sfx_add(T.sfx("rake", seed=40 + n), t_rake0 + n * RP, 0.45)
S.music_add(T.xylo(79, 0.7), t_proud, 0.5); S.music_add(T.xylo(84, 0.7), t_proud + 0.12, 0.45)
S.sfx_add(T.sfx("whoosh_big"), t_gust - 0.2, 0.5)
S.sfx_add(T._wind(1.6), t_gust - 0.1, 0.35)
S.sfx_add(T.sfx("rustle", d=1.2, seed=22), t_gust, 0.35)
S.sfx_add(T.foley("impactSoft_medium", 0), t_gust + 0.3, 0.15)
S.sfx_add(T.foley("pluck_001"), t_leaf, 0.25)
S.sfx_add(T.sfx("eye_twitch"), t_leaf + 0.15, 0.2)

# ---- WINTER
for k in range(10): S.sfx_add(T.woodblock(84 + (k % 2) * 3, 0.06), t_shiver + k * 0.06, 0.12)    # teeth chatter
for k in range(4): S.sfx_add(T.woodblock(86, 0.06), t_win + 1.6 + k * 0.07, 0.07)
S.sfx_add(T.sfx("whoosh", d=0.35), t_shiver + 0.12, 0.1)
S.sfx_add(T.foley("impactSoft_heavy", 1), t_shiver + 0.55, 0.3)
S.sfx_add(T.foley("glass_002"), t_sip - 0.25, 0.12)
S.sfx_add(T.sfx("gulp"), t_sip + 0.35, 0.08)
S.sfx_add(T.foley("cloth", 2), L["l2"]["start"], 0.08)

# ---- SPRING
S.sfx_add(T.sfx("bloop"), t_plant + 0.05, 0.18)
S.sfx_add(T.foley("impactSoft_medium", 3), t_plant + 1.3, 0.12); S.sfx_add(T.foley("impactSoft_medium", 4), t_plant + 1.65, 0.1)
for k, th in enumerate(t_h):
    if k == 2:
        for j in range(5): S.sfx_add(T.woodblock(90, 0.05), th - 1.1 + j * 0.2, 0.1)              # the late egg rocks...
    S.sfx_add(T.sfx("crunch", d=0.2), th - 0.3, 0.12)
    S.sfx_add(T.sfx("pop", f0=500 + 120 * k, f1=1600 + 200 * k), th, 0.3)
    S.sfx_add(T.chirp(k), th + 0.2, 0.22); S.sfx_add(T.chirp(k + 2), th + 0.55, 0.2)
S.sfx_add(T.chirps(), t_h[2] + 0.5, 0.2)
S.sfx_add(T.sfx("slide_up"), t_inhale + 0.05, 0.4)
S.sfx_add(T.sfx("whoosh", d=0.9, lo=200, hi=1800, seed=5)[::-1].copy(), t_inhale + 0.1, 0.3)                          # the gasp (a reversed whoosh)                                                  # the HUGE breath
S.sfx_add(T.foley("cloth", 1), t_brace, 0.1)
S.sfx_add(T.foley("impactSoft_medium", 1), t_pat, 0.14); S.sfx_add(T.foley("impactSoft_medium", 2), t_pat + 0.38, 0.12)
S.sfx_add(T.foley("cloth", 3), t_stand, 0.12)
t = t_turn + 0.3
while t < t_cu:
    S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.14 if t < t_ws else 0.08); t += 0.55
S.sfx_add(T.sfx("pop", f0=380, f1=1500), t_pop, 0.4); S.sfx_add(T.sfx("twinkle"), t_pop + 0.05, 0.25)
S.sfx_add(T.sfx("wings"), t_pip_in, 0.18)
S.sfx_add(T.foley("click", 2), t_pip_land, 0.1)
S.sfx_add(T.chirp(0), t_pip_land + 0.3, 0.25); S.sfx_add(T.chirp(4), t_pip_land + 0.62, 0.22)
for k in range(3): S.sfx_add(T.chirp(k + 1), t_pop + 0.3 + k * 0.1, 0.07)                        # the chicks answer, far off
S.sfx_add(T.sfx("whoosh", d=0.6), t_iris, 0.12)
S.sfx_add(T.foley("jingles_PIZZI", 4), t_iris + 2.05, 0.35)

# ---- END CARD
S.sfx_add(scribble(0.9, 5), t_card + 0.1, 0.2)
S.sfx_add(scribble(0.6, 6), t_card + 0.9, 0.15)
S.sfx_add(T.sfx("pop"), t_card + 1.15, 0.3)
S.sfx_add(T.sfx("wings"), t_cp[0] + 0.2, 0.18); S.sfx_add(T.sfx("wings"), t_cp[0] + 0.7, 0.14)
for k, c in enumerate([t_cp[1] + 0.35, t_cp[2] + 0.55, t_cp[3] + 0.3, t_cp[3] + 0.6, t_cp[3] + 2.2]): S.sfx_add(T.chirp(k), c, 0.22)
for c in (t_cp[1], t_cp[2] + 0.4, t_cp[3] + 0.4): S.sfx_add(T.foley("click", 1), c, 0.08)
S.sfx_add(T.sfx("twinkle"), t_cp[3] + 0.3, 0.15)

S.voice({k: v["start"] for k, v in L.items()}, "assets/voice/{}.mp3")
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav", music_gain=0.3, duck=0.6, fade_in=0.3, fade_out=0.6, lufs=-16)
