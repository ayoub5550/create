# film1 — "Grow Faster!" · Sam & Layla, Episode 1 (our first YouTube video)

> **تحديث 2026-10-24 (المالك):** الحلقة صارت **فيلماً طويلاً ~9:45** (عشرة أجزاء، 124 سطراً بأصوات ElevenLabs v4).
> البناء يتبع `PRODUCTION.md` و`parts/pNN/`؛ هذا الملف يبقى مرجع الشخصيات والأسلوب والنكات.

> **للمالك:** هذه الحلقة الأولى التي ستُنشر على يوتيوب. قصة كوميدية إنجليزية (~95 ثانية) بشخصيتَي «حوار» نفسيهما
> وبأسلوبه المعتمد: سام يريد أن تصبح بذرته شجرة **الآن**، فيصرخ عليها ويغرقها بالماء ويكتب للطبيعة تقييم «نجمة واحدة»،
> ثم تنمو الشجرة كلّما أدار ظهره، حتى تسقط تفاحة على رأسه. الوكيل القادم لا يحتاج إلا أن تقول له: **«ابدأ film1»**.
>
> **Agent:** the owner says "start film1" (or «ابدأ film1»). Produce this episode end to end, alone, following this file,
> `AGENTS.md` and the skills. Do not ask questions this file already answers. Script, voices, on-screen text, captions:
> English (owner decision 2026-10-24). Style reference: `examples/hiwar` (approved; do not modify it).

## 0. "Start film1" — the run, step by step
1. Read `AGENTS.md` completely, then this file, `scene.json`, `cast.json`, `YOUTUBE.md`, and the skills in the order
   you use them (`cartoon-writer` → `character-design` → `talking-characters` → `film-director` → `film-editor` →
   `stickman-animation`). Read `docs/lessons.md` and `examples/hiwar/film.js` (the API in real use).
2. Environment (AGENTS.md §9): `bash tools/doctor.sh`, `pip install -r requirements.txt faster-whisper`,
   `playwright install chromium`, `npx hyperframes@0.8.190 --version`. CPU-heavy steps (render) want ≥ 4 cores.
3. Work on a branch `film/film1`. Bring the dialogue-film files from the approved example **without overwriting** the
   script and cast that are already here:
   `cp -n examples/hiwar/{build.sh,clips.json,score.py,template.html,film.js} films/film1/` (then `README.md` of your own).
4. Mocap: the example has walk `82_10` and sit `13_01`. Find the rest with `python tools/mocap/search.py <word>`
   (kneel, crouch, carry / lift, throw, jump / celebrate, look around, turn) and check candidates on a contact sheet
   (`tools/mocap/sheet.py`) before adding them to `clips.json`. The faint, the bucket heave and the head whips may be
   procedural poses (`M.pose`, `Talk.act`) instead of mocap.
5. `bash films/film1/build.sh` (voices, timeline, lip sync, shot list, mix, build), then
   `python tools/voice/stt_check.py films/film1/scene.json --dir films/film1/assets/voice` — every line OK.
   Listen to both voices on l7 and l12: if they are hard to tell apart, recast (`voices-en.md`). If an
   `ELEVENLABS_API_KEY` exists, ElevenLabs (`eleven_v3`, tags like `[sighs]`) is allowed for better acting.
6. Check `timeline.json`: the total should land at 90–100 s. Tune `gap`s (they hold the silent gags, §5) before animating.
7. Shots: `python tools/direct/shotlist.py auto films/film1`, then rewrite `shots.json` by hand from §7, then `check`.
8. `film.js`: write the acting beat by beat (§5, §6), anchored to word times (`word("l12", 3).t0`), never to raw seconds.
   Look at a contact sheet (`tools/render/snap.py`) after every scene block; fix before moving on.
9. `score.py`: music and sound effects from §8; master to −14 LUFS, true peak ≤ −1.5 dBTP.
10. Quality gate (AGENTS.md §5): an independent critic subagent (one that did not build it) scores ≥ 8/10 with no P0/P1,
    plus the film1 checks in §10. Iterate until it passes.
11. Render (`tools/render/render.sh`), `verify.py`, captions (`captions.py … --speakers cast.json`), thumbnail, Shorts cut
    if time allows, `gallery/film1.mp4` (720p) + `gallery/film1.jpg`, CHANGELOG, PR. Deliver as in §11.

## 1. Why this story (research on what US audiences watch, 2026-10-24)
- The biggest US 2D channels are built on exactly this: **Pencilmation** (American; 20.4 M subscribers, 12.1 B views in
  its Wikipedia infobox, mid-2025) — stick figures and doodles, slapstick and situational comedy, classic cartoon sound
  effects, energetic music. **Alan Becker** (stick figures, ~27 M subscribers, ~7 B views on "Animator vs." per Bloop
  Animation, 2024). **TheOdd1sOut** and **Jaiden Animations** (talking simple characters, relatable everyday stories,
  billions of views).
- 2026 comedy Shorts that break out: a simple setup with a **reveal / time-jump payoff** (a sketch with an on-screen date
  jump opened at 12× its channel's normal first-day views, Trari, Oct 2026) and **cartoon timing** (a chase "that plays
  like a cartoon" passed a million views).
- Retention guides: the first 5–15 s must show the conflict — no slow intros or logos; thumbnails with bold colours,
  expressive faces and minimal text; short, accurate titles (longstories.ai; Kidscreen, Nov 2025).
- So: a **recurring duo** (series potential), a conflict in the first second (Sam yelling at dirt), universal and very
  American humour about **instant gratification** (speedrun, life hacks, "one-star review"), slapstick with physical
  payoffs (splash, bonk, faint), **dramatic irony** (the tree grows only when he is not looking — the audience sees it,
  he doesn't), a time-jump card, and a callback ending ("Years."). Family-friendly, no dialogue that needs culture
  context, works muted with captions.

## 2. The episode
- **Logline:** Impatient Sam planted a seed yesterday and wants a tree today; every hack fails until he finally stops
  watching.
- **Theme:** good things take time (and stop staring at them). **Tone:** warm slapstick + deadpan. **Audience:** general,
  family-friendly. **Format:** 16:9, 1920×1080, 30 fps, 90–100 s, English voices and captions. Title on screen:
  "SAM & LAYLA" / "Episode 1: Grow Faster!".
- **Continuity:** a fresh start for an English series using the «حوار» characters and set (mound, rock, sun, paper sky);
  no prior knowledge needed.

## 3. Characters (`cast.json`)
| | Sam | Layla |
|---|---|---|
| Look | «حوار» Sami: ink figure, red scarf, hair tuft, scale 0.74 | «حوار» Layla: teal hijab, scale 0.68 |
| Voice | edge `en-US-BrianNeural`, rate +10 %, pitch +2 Hz | edge `en-US-AvaNeural`, rate −5 % |
| Acting | big, fast, overshoots; anticipation before every action; falls hard | small, precise, still; moving holds (breathing, blinks); one smile only (l25) |
| Wants | a tree NOW | Sam to learn patience (and to stay dry) |

Rules: Layla is never a statue — she reacts to every Sam beat (nods, blink, tiny head tilt, `react`). Hands stay clear of
the face (≥ 60 units from the head centre; `talk.js` header). Never ALL CAPS in `scene.json` text (a TTS can spell
"IT" as "I-T"); loudness comes from the acting and the mix.

## 4. Set and staging map (keep the screen direction for the whole film)
- One location: the «حوار» yard — paper sky, ground line, screen-space sun, a small **mound** (the seed) at ~35 % of
  the width, the **rock** at ~52 % (between the mound and Layla). Sam works frame-left of centre, **Layla always on the
  right**, facing left. Camera never crosses the line between them.
- The irony gag (l19–l22) needs the **mound visible behind Sam** while he faces Layla: Sam on the rock, body turned
  right, the mound over his left shoulder, all three in one WS.
- Props (ink SVG drawn in `film.js`, attached to `haR`/`haL`): giant bucket (taller than Sam's torso), phone (small
  rounded rectangle, screen glow), apple, the tree in stages (sprout → sapling → full apple tree with 5–7 apples; reuse
  the tree growth of `examples/albidhra`).

## 5. Beat sheet (≈ times; the real ones come from `timeline.json`)
| ≈t | Lines | Beat | Picture |
|---|---|---|---|
| 0–5 s | l1–l3 | COLD OPEN: Sam yells "Grow" at a mound; Layla: "why are you yelling at dirt?" | CU ground level → WS reveal (Layla walks in) → MS |
| 5–7 s | — | Title sting 1.8 s | ink draw-on "SAM & LAYLA", "Episode 1: Grow Faster!" (Caveat), pop + whoosh |
| 7–17 s | l4–l8 | Planted yesterday; "How much time? An hour? Two hours?" — "Years." | two-shot; raise1/raise2; MCU Layla deadpan; CU Sam frozen + crickets |
| 17–30 s | l9–l11 | Plan B: maximum water — splash drenches Layla | smash cut WS giant bucket; splash arc; MCU Layla dripping |
| 30–40 s | l12 | Coach pep talk to the seed | MS low angle; swell → record scratch → WS nothing; crickets |
| 40–50 s | l13–l16 | Googles "how to grow a tree fast": "be patient?! One star!" — "Nature needs feedback." | MCU phone glow; one-star bubble; CU smug |
| 50–58 s | l17 | "Fine. I'll sit right here and watch it." | WS stomp, sit on rock (13_01), cross arms |
| 58–61 s | — | "5 minutes later..." card 1.6 s + CU twitching eye 1 s | paper card, Caveat, clock tick |
| 61–75 s | l18–l20 | "A watched pot never boils." He lectures with his back to the mound → it POPS up; Layla's eyes widen; he whips round → frozen | WS, all three visible |
| 75–80 s | — (gap of l21) | Silent rule of three: he turns away → it grows (whoosh); whips back → frozen, innocent wiggle | WS; quick push-in on the frozen sprout |
| 80–86 s | l21–l23 | Layla: "Look! A bird!" — "Where?!" → tree BOOM, apple BONK; "It... grew." | MCU Layla sly → WS boom + anchored shake → MS dazed, orbiting stars |
| 86–92 s | l24–l27 | "It grew!" jump; Layla smiles "It just needed time"; "Next: a whole forest! ...How long?" | MS celebrate; MCU Layla smile; CU Sam hopeful |
| 92–95 s | l28 | "Years." | MCU Layla deadpan |
| 95–103 s | — (tail) | Sam faints backwards stiff, THUD + dust; iris on his twitching foot; sting; end card 6 s | WS; iris (`shots.js` fx); end card with empty zones for YouTube end-screen elements |

## 6. Gags — how to animate them (pure functions of `t`, seek-safe)
- **Freeze-when-watched tree:** growth advances only inside the "unwatched" windows (Sam facing away):
  `g(t) = min(1, Σ rate_k · clamp(t − a_k, 0, b_k − a_k))` with windows from his head-turn times; each window starts
  with a squash-and-stretch pop (`easeOutBack`) and a POP/whoosh; while watched it holds still with a tiny "innocent"
  wiggle (±2°, 0.4 s). Stages: sprout (window 1), sapling (window 2), full tree with apples (window 3, l22, 1.2 s, rumble).
- **Splash:** anticipation (Sam leans back 0.3 s) → heave → a thick ink water arc that draws on toward Layla + 12
  droplets (`U.hash(i)` for size/angle, parabolic paths) → Layla darker/wet for ~4 s with 6 drips falling from the hijab
  and hands (period ~0.4 s). Bucket stays in frame, upside down.
- **Phone:** small rounded rectangle in `haR`, pale glow on the near side of the face; taps (small hand dips) on each
  typed word of l13; on "One star!" a speech bubble pops (`easeOutBack`) with ★☆☆☆☆ drawn as SVG stars.
- **Head whips:** 0.12–0.15 s turns with a 1-frame overshoot (`U.easeOutBack`), scarf follows ~2 frames later.
- **Apple bonk:** `y = y0 + ½·g·(t − t0)²` until the head, a small bounce into his hand; head dips (accent), anchored
  shake (`shots.js`), 3 stars orbit the head for 1.5 s.
- **Faint:** body rigid in the rest pose, rotates backwards about the feet: `θ = 90° · easeIn((t − tf)/0.35)`, a
  damped 6° bounce, THUD, dust puff (3–5 expanding ink circles), one foot twitches twice inside the iris.
- **Cards:** title sting and "5 minutes later..." are full-frame paper cards with Caveat lettering drawn on with
  `D.path`/text reveal, 1.6–1.8 s, whoosh in/out. Never a static frame: keep the paper boil or a slow scale (1.00→1.02).

## 7. Camera and editing (`shots.json`, `film-director` + `film-editor` skills)
- Open on the CU (hook), establishing WS by ~2 s (shotlist rule: a WS within the first 3 s).
- Hard cuts on word onsets; punchlines in singles (MCU/CU), physical gags in WS (the audience must see cause and effect
  in one frame: splash, irony gag, bonk, faint). Reaction shots after every punchline (Layla after Sam, Sam after "Years.").
- Rhythm: average shot 2.5–4 s in dialogue, longer holds for deadpan (1.2–1.5 s of silence after "Years." both times).
- Smash cut into l10 (bucket), match the screen direction everywhere (Layla right). Iris-out ending, then end card.

## 8. Sound and music (`score.py` with `tools/audio/sound.py`)
- Music: a light plucked motif in a major scale (`MAQAM["ajam"]` = major; oud Karplus-Strong reads as a bright pluck,
  `bright` ~0.75), 100–110 bpm; a sneaking pizzicato-like figure under the irony gag; full stops (`music_gap`) on both
  "Years." beats and on the record scratch. Ducking under dialogue (default mixer).
- SFX map: whoosh + pop (title, cards) · crickets (after l8 and after l12) · bucket slosh, big splash (filtered noise
  burst), drips · swell + record scratch (pitch-dropping noise sweep) · phone taps (short clicks), "bonk" buzzer on the
  one-star bubble · thud (sit) · clock tick (card) · pop + glint (sprout) · whoosh (growth) · low rumble (tree boom) ·
  falling whistle + BONK + birds tweeting (stars) · thud + dust (faint) · sting on the iris · short jingle on the end card.
- Master: −14 LUFS integrated, true peak ≤ −1.5 dBTP (YouTube's reference level).

## 9. Text on screen and captions
- All on-screen text in a Latin font (`assets/fonts/Caveat-latin.woff2`), left-to-right, ≥ 64 px at 1080p, high contrast.
- Captions: `python tools/voice/captions.py films/film1/tts.json films/film1/timeline.json out/film1.srt --speakers films/film1/cast.json`
  (speaker names; ≤ 7 words per cue). Not burned in for the 16:9 upload.
- End card (6 s): "SAM & LAYLA", "New episode soon!", empty areas bottom-left and right for YouTube's subscribe and
  next-video elements; music tail under it.

## 10. Film1 acceptance checks (on top of AGENTS.md §5)
- The hook works muted: the first frame already shows Sam's face at the mound; conflict clear by 3 s.
- The irony gag reads: in a still from the gag, a viewer can see the sprout growing behind Sam's back and Layla's eyes.
- Every gag has anticipation → action → reaction; no limb passes through the head; scarf/hijab never detach.
- Layla reacts on screen to every Sam beat; she smiles only at l25.
- Duration 90–100 s; −14 LUFS ±1; true peak ≤ −1.5 dBTP; `hyperframes lint` 0 errors; snap without console errors;
  SRT cues match the voices; all text readable on a phone (check a 360p downscale).

## 11. Deliverables (`films/film1/out/` + PR)
`film1.mp4` (1080p30, h264 + aac) · `film1.srt` · `thumbnail.png` (1280×720, concept in `YOUTUBE.md`) ·
optional `film1-short.mp4` (1080×1920, the irony gag l17–l24 reframed, ≤ 45 s) · `gallery/film1.mp4` (720p) +
`gallery/film1.jpg` · README for the film · CHANGELOG entry · PR from `film/film1`. The delivery message to the owner:
the story in one line, the creative decisions you made, the tools, the critic score and the remaining P2 issues
honestly, the YouTube title/description from `YOUTUBE.md`, and two ideas for episode 2.
