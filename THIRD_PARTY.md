# Third-party material

| What | Where | License / terms |
|---|---|---|
| CMU Graphics Lab Motion Capture Database (index + motions fetched at build time) | `tools/mocap/cmu_index.txt`, `film_clips.js` | Free for all uses — http://mocap.cs.cmu.edu ; BVH conversion: github.com/una-dinosauria/cmu-mocap ; index compiled by B. Hahne |
| Aref Ruqaa font | `assets/fonts/ArefRuqaa-*.woff2` | SIL Open Font License 1.1 — `assets/fonts/OFL-ArefRuqaa.txt` |
| Caveat font | `assets/fonts/Caveat-latin.woff2` | SIL Open Font License 1.1 — `assets/fonts/OFL-Caveat.txt` |
| Whiteboard reveal technique (serpentine mask + hand on stroke tip) | `templates/whiteboard/` | Adapted from brandonvant/claude-skill-whiteboard-explainer (MIT, © 2026 brandonvant) |
| Rhubarb Lip Sync 1.14.0 | downloaded at first use into `~/.cache/create/rhubarb` by `tools/voice/lipsync.py` (not bundled) | MIT — github.com/DanielSWolf/rhubarb-lip-sync (its LICENSE.md: the lip-sync data you generate is yours) |
| edge-tts (Python package) + Microsoft neural voices | dependency in `requirements.txt`; example voices in `examples/*/assets/voice` | edge-tts: LGPL-3.0 (used as a library, unmodified); voices via Microsoft's Edge read-aloud service, subject to its terms |
| CMU takes 82_10 (walk) and 13_01 (sit) | `examples/hiwar/film_clips.js` | CMU Graphics Lab Motion Capture Database — free for all uses (row above) |
| Arabic letter → mouth-shape rules | `tools/voice/lipsync.py`, `skills/talking-characters/references/arabic-visemes.md` | our synthesis of published research (Damien & Wakim 2009, IEEE ACTEA; Ouni 2007, Interspeech); no code copied |
| Kenney audio packs (Impact Sounds, RPG Audio, Interface Sounds, UI Audio, Music Jingles) | `films/film1/common/sfx/kenney/` | CC0 1.0 — kenney.nl (License.txt in each pack folder) |
| film1 voices (Sam = Liam, Layla = Sarah) | `films/film1/parts/*/voice_src`, `assets/voice` | generated with ElevenLabs v4 for this repo |
| GSAP | loaded from jsDelivr CDN at render time (not bundled) | GSAP standard "no charge" license — gsap.com |
| HyperFrames | run via `npx` (not bundled) | see github.com/heygen-com/hyperframes |
| Example art, hand photo, narration | `examples/*/art`, `examples/*/assets` | AI-generated for this repo (image model / ElevenLabs / edge-tts); free to reuse here |

`engine/`, `tools/` and `skills/` are original work (MIT); the skills cite their sources and copy no third-party text. No code from OpenMontage / Ink Theater (AGPL-3.0) is included:
the stick-figure engine and the BVH converter were written from scratch (the converter reproduces the same 2D clips).
