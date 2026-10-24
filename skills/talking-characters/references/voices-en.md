# English voices for characters (the default since 2026-10-24)

Reference for the `talking-characters` skill. Owner decision: every new film is in English (script, voices, on-screen text,
captions). The voice is set per character in `cast.json`:
`"voice": {"provider": "edge", "voice": "en-US-AndrewNeural", "rate": "+0%", "pitch": "+0Hz"}`.
Check the live list: `edge-tts --list-voices | grep "^Name.*en-"` (the table below was checked on 2026-10-24).

## edge-tts (free, Microsoft neural voices)

| Locale | Female | Male | Character fit |
|---|---|---|---|
| en-US (conversational) | AvaNeural (expressive, caring), EmmaNeural (cheerful, clear) | AndrewNeural (warm, confident), BrianNeural (casual, sincere) | best for dialogue: natural, unforced |
| en-US (news / narration) | AriaNeural, JennyNeural, MichelleNeural | GuyNeural (passion), ChristopherNeural, EricNeural, RogerNeural (lively), SteffanNeural | narrator, a pompous or "announcer" character |
| en-US child | AnaNeural (cute, cartoon) | — | kids; or raise pitch on Ava/Emma (+15–25 Hz, rate +10%) |
| en-GB | SoniaNeural, LibbyNeural, MaisieNeural | RyanNeural, ThomasNeural | a contrasting accent in a duo |
| en-AU / en-IE / en-CA | NatashaNeural / EmilyNeural / ClaraNeural | WilliamMultilingualNeural / ConnorNeural / LiamNeural | more contrast for 3+ characters |

The *MultilingualNeural* variants (Andrew, Ava, Brian, Emma, William) can also speak other languages with the same timbre.

## Casting rules
- Two characters must never share a voice; change the voice first (gender, accent), then fine-tune: `rate` ±5–20 %,
  `pitch` ±2–20 Hz. An impatient, excited character: rate +8–12 %; a calm, dry one: rate −4 to −8 %.
- Test both voices on the same line, eyes closed: if you cannot tell who speaks, recast.
- edge-tts does not act emotions: carry emotion with `expr` keys, timing and the body (`acting-rules.md`). For acted
  lines (sighs, whispers, laughs) use ElevenLabs (`"provider": "elevenlabs"`, `eleven_v3` accepts tags like `[sighs]`).
- Punctuation shapes delivery: "…" and "?" make 0.6–0.9 s pauses; trim them with `"max_pause"` in `scene.json`.
- Write numbers and names as they should be spoken; run `python tools/voice/stt_check.py scene.json` after voicing.

## Lip sync in English
`dialogue.py` gives each English line to Rhubarb's English recogniser together with its transcript (more precise than the
language-independent "phonetic" mode used for Arabic). The Arabic letter rules (م ب ف و) do not apply to English lines.

`tools/new_film.py <slug> --from hiwar` recasts the copied `cast.json` with English voices automatically
(male → Andrew, Brian, Ryan, Guy; female → Ava, Emma, Sonia, Jenny). `--lang ar` keeps Arabic voices (`voices-ar.md`).
