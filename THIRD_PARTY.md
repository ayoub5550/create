# Third-party material

| What | Where | License / terms |
|---|---|---|
| CMU Graphics Lab Motion Capture Database (index + motions fetched at build time) | `tools/mocap/cmu_index.txt`, `film_clips.js` | Free for all uses — http://mocap.cs.cmu.edu ; BVH conversion: github.com/una-dinosauria/cmu-mocap ; index compiled by B. Hahne |
| Aref Ruqaa font | `assets/fonts/ArefRuqaa-*.woff2` | SIL Open Font License 1.1 — `assets/fonts/OFL-ArefRuqaa.txt` |
| Caveat font | `assets/fonts/Caveat-latin.woff2` | SIL Open Font License 1.1 — `assets/fonts/OFL-Caveat.txt` |
| Whiteboard reveal technique (serpentine mask + hand on stroke tip) | `templates/whiteboard/` | Adapted from brandonvant/claude-skill-whiteboard-explainer (MIT, © 2026 brandonvant) |
| GSAP | loaded from jsDelivr CDN at render time (not bundled) | GSAP standard "no charge" license — gsap.com |
| HyperFrames | run via `npx` (not bundled) | see github.com/heygen-com/hyperframes |
| Example art, hand photo, narration | `examples/*/art`, `examples/*/assets` | AI-generated for this repo (image model / ElevenLabs / edge-tts); free to reuse here |

`engine/` and `tools/` are original code (MIT). No code from OpenMontage / Ink Theater (AGPL-3.0) is included:
the stick-figure engine and the BVH converter were written from scratch (the converter reproduces the same 2D clips).
