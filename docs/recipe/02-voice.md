# 02 · الصوت (السرد)

```bash
python tools/voice/tts.py script.json                         # مجاني: ar-SA-HamedNeural عبر edge-tts
python tools/voice/tts.py script.json --voice ar-SA-ZariyahNeural --rate=-10%
python tools/voice/tts.py script.json --provider elevenlabs --voice <voice_id>   # ELEVENLABS_API_KEY
python tools/voice/stt_check.py script.json                   # بوّابة: كل سطر OK (faster-whisper محلياً)
```
- الناتج: `assets/voice/<id>.mp3` و`tts.json` (مدّة كل سطر، وتوقيت كل كلمة `timestamp: [start, end]`).
- **ولّد بالتتابع لا بالتوازي** (الاستدعاءات المتوازية تتصادم في أسماء الملفات أو حدود الخدمة).
- القصّ الدرامي: لتقسيم سطر عند وقفة طويلة (مثل s4 في «البذرة» عند 2.54 ث):
  `ffmpeg -i s4.mp3 -t 2.54 s4a.mp3 && ffmpeg -ss 2.54 -i s4.mp3 s4b.mp3`. الجزء الثاني يبدأ متأخّراً
  ليتّسع للحركة («ثمّ جلسَ ينتظر» بعد أن يمشي إلى الصخرة).
- **جدول البدايات** `VO_START = {"s1": 1.0, …}` يقرّره المخرج: فجوة 0.4–0.8 ث بين الأسطر، وفجوات أطول قبل التحوّلات.
  الجدول نفسه يُستعمل في الفيلم وفي `score.py` وفي `captions.py`، فاحفظه في مكان واحد.
- الأصوات العربية الجيّدة: edge مجاناً (Hamed أو Shakir للراوي الرجل، Zariyah أو Salma للمرأة)، أو ElevenLabs
  (أكثر تعبيراً، مع `previous_text` و`next_text` لتتّصل النغمة بين الأسطر).
- `stt_check` محلياً: استعمل نموذج `small` على الأقلّ للعربية (`base` ضعيف). الأرقام تُكتب أرقاماً («300.000km»)
  فتنخفض النسبة، فاستمع إلى هذه الأسطر بنفسك قبل أن تحكم عليها.
- إذا فشل سطر في `stt_check`: أعد توليده وحده (`--only s3`)، أو غيّر الصياغة أو التشكيل.
