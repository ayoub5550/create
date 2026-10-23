# CHANGELOG

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
