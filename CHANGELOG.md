# CHANGELOG

## 2026-10-24 — film1 long cut (~9:45): script, voices, shared set, sound kit, reference part
- Owner request: a ~10-minute film with excellent English voices, better backgrounds and lots of content. `films/film1/`
  is now ten parts (`parts/p01..p10`, 124 lines) built and rendered separately, then assembled — guide: `PRODUCTION.md`.
- Voices: ElevenLabs v4 (Sam = Liam, Layla = Sarah) recorded with audio tags, every take checked by speech-to-text;
  `tools/voice/dialogue.py` gains `provider: "file"` (takes in `<part>/voice_src/<id>.mp3 + .json`, cache keyed by the take).
- `films/film1/common/`: `set.js` (layered backyard with parallax, continuous time of day + seasons, world tint at night),
  `props.js` (mound, rock, continuously growing tree, Pip, knitting + scarf, stool, mug, apple), `kit.js` (line/word
  helpers, face presets, IK squat, cards, cartoon emanata, Layla's tote, speech/thought bubble, Pip's birdhouse),
  `toon.py` (code-made cartoon band, 12 named music cues on one theme, ~60 synthesized SFX, Kenney CC0 Foley loader),
  `sfx/kenney/` (CC0), `template.html`, `build_part.sh`.
- `parts/p01` (cold open + title, 50 s) is the reference part. `tools/render/frames.py` (full-res frames at given times)
  and `tools/render/jsdebug.py` (page errors at a seek time).

## 2026-10-24 — film1: the first YouTube episode, ready to produce
- `films/film1/`: "Grow Faster!" (Sam & Layla, Ep. 1), an English ~95 s stick-figure comedy with the «حوار» characters.
  `BRIEF.md` (what US audiences watch now, beat sheet, staging map, how to animate each gag, camera, sound, acceptance
  checks, deliverables), `scene.json` (28 lines; the gaps hold the silent gags), `cast.json` (English voices),
  `YOUTUBE.md` (titles, description, tags, thumbnail, Shorts cut). The next agent starts it with "start film1" (AGENTS.md).

## 2026-10-24 — talking characters («حوار») + owner decision: English from now on
- **Owner decision:** the «حوار» draft-3 style (staging, animation, editing, sound design) is approved — except the voice
  and the language. **From now on every new film is in English: script, voices, on-screen text, captions** (top of
  `AGENTS.md`, golden rule 6, `CLAUDE.md`, `GEMINI.md`, `README.md`). Arabic only when the owner asks for it.
- English by default: `tools/new_film.py --lang en` (default) recasts `cast.json` with distinct English edge-tts voices;
  `tts.py` / `dialogue.py` default to `en-US-AndrewNeural`; `lipsync.py` gives English lines to Rhubarb's English recogniser
  with the transcript (`rhubarb-en`); `stt_check.py` auto-detects the language; `skills/talking-characters/references/voices-en.md`
  (28 English voices, checked live). Known gap: the kinetic and whiteboard templates are still RTL/Arabic-tuned.
- Dialogue films: `engine/talk.js` (named gestures incl. `pointDown`, beats, nods, accents, idle, `fromLines`, `easeOut`),
  `engine/shots.js` (word-anchored hard cuts; per-shot `zoom` that keeps the feet line / head top, `top`, `frameAt`,
  anchored `shake`; `fx`: fades, dip, flash, iris with hold), `engine/stickfilm.js` talking rig (Rhubarb mouths A–H/X,
  accessories, `[t, dur]` blinks, the near forearm drawn over the head, an open stick hand for `palm` gestures, hijab
  outline that covers the head), `tools/voice/dialogue.py` (cast + scene -> voices, timeline, lip sync, acting tracks;
  `max_pause` trims TTS pauses), `tools/voice/lipsync.py`, `tools/direct/shotlist.py` (auto coverage + editing linter),
  `tools/render/model_sheet.py`, `tools/sync_skills.py`; `tools/audio/sound.py`: `music_gap`, `slap`, smoother `crickets`,
  `render(lufs=...)` mastering with a look-ahead peak limiter (dual-mono measurement).
- `examples/hiwar` (28.7 s): independent critics scored draft 1 5.5/10 and draft 2 6/10; draft 3 restaged the button (the
  mound between the characters, one close two-shot), fixed every arm-through-face pose, the hijab crescent, the stern
  "hope" brows, the WS framing and the mix, added a sting and a title card — and was approved by the owner.
- Six craft skills in `skills/` (`.claude/skills`, `.agents/skills` links); `docs/lessons.md` updated with what the critics found.
- Fixes: kinetic `#bar` lint error, whiteboard initial hides, `captions.py` ms rounding, «البذرة» s4a/s4b + `starts.json`,
  the iris mask folding inwards.

### Test status (2026-10-24)
- `examples/hiwar`: `hyperframes lint` 0 errors (1 nested-structure warning), snap without console errors, render 28.74 s
  1080p30 in 13.3 s, -15.8 LUFS integrated, true peak -1.5 dBTP, 5 SRT cues; `gallery/hiwar.mp4` (720p) + `hiwar.jpg`.
- `albidhra` / `sky` / `light-speed` rebuilt: lint 0 errors; `new_film.py --from hiwar` (English recast) smoke-tested.
- English pipeline: 3 English lines -> Andrew / Ava voices, `max_pause`, `rhubarb-en` lip sync, `stt_check` 0.95–1.00.
- Not exercised (no keys here): the ElevenLabs paths.

## 2026-10-24 — rig v2: one connected, smooth figure
- Owner feedback on «البذرة»: the figure looked disconnected and its edges were rough.
- `engine/stickfilm.js` `rig()`: arms now grow from the top of the spine and legs from the hips (CMU shoulder joints sit
  25–60 units off the spine in a side projection, so arms floated beside or above the body); the neck meets the head
  circle edge; hands and feet stay exactly on the mocap/pose positions (props still fit) while elbows/knees shift half the
  root offset (linear, so no pops); rounded elbows/knees/neck (`round`); optional lighter far-side limbs (`backInk`);
  `geometricPrecision`. `connect: false` keeps the old drawing.
- `examples/albidhra`: the hero no longer uses the displacement (boil) filter (it made strokes jagged); the jump pose
  is anchored on the neck as a wide V so the raised arms clear the head; re-rendered `gallery/albidhra.mp4`
  (60.0 s, 1080p, -20.2 LUFS, true peak -1.2 dBTP; HyperFrames 0.8.190 lint clean, rendered in 20.7 s).
- Docs: `docs/recipe/03-stickman.md` §5 (+ `gallery/rig-v2-before-after.png`), `docs/lessons.md`.

## 2026-10-23 — v1: the video factory
- `AGENTS.md`: the producer role, golden rules, format chooser, 10-step pipeline, quality gate, delivery.
- `engine/stickfilm.js` + `engine/ink.js`: MIT stick-figure engine (mocap playback + planner, cross-fade blending,
  procedural pose layers, face expressions, camera, draw-ons, seek-safe line boil). Verified: re-renders «البذرة» with
  identical joint positions (max diff 1e-13) to the original film code.
- `tools/mocap/`: clean-room `bvh2clip.py` (matches the previous converter frame-for-frame on 7 CMU takes),
  `prep_clips.py` (manifest), `search.py` (CMU index, 2,600+ takes), `fetch.py`, `sheet.py`.
- `tools/voice/`: `tts.py` (free edge-tts with word timings, or ElevenLabs), `stt_check.py` (faster-whisper / Scribe),
  `captions.py` (SRT).
- `tools/audio/sound.py`: oud (Karplus-Strong) in 7 maqamat incl. quarter tones, ney, frame drum, pads, Foley
  (rain, thunder, wind, crickets, birds, steps, digging, pencil, whoosh, pop), ducking mixer with level report.
- `tools/build/`: `build.py` (stickman), `whiteboard.py` (declarative `board.json`; reproduces the «السماء» page byte-for-byte),
  `kinetic.py` (new: kinetic typography 9:16 / 16:9 with keyword accents and number counters).
- `tools/render/`: `snap.py` (contact sheets), `render.sh`, `verify.py` (streams, duration, LUFS, frame tile).
- Examples: `albidhra` (stickman, 60 s), `sky` (whiteboard, 63 s), `light-speed` (kinetic, 28 s, rendered in 9.6 s).

### Test status (2026-10-23)
- Tested end-to-end: bvh2clip/prep_clips (exact match), stickfilm engine (exact joints), whiteboard build (byte-identical),
  kinetic build + HyperFrames render (28 s in 9.6 s), sound.py mixes, edge-tts narration, faster-whisper stt_check,
  captions, snap, verify, all three examples rebuilt on a clean machine, `hyperframes lint` 0 errors.
- Written to the public API docs but NOT exercised here (no keys in the build environment): the ElevenLabs paths of
  `tts.py` / `stt_check.py` and `tools/art/gen_art.py` (OpenAI Images). Report issues in CHANGELOG when first used.
