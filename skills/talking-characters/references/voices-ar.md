# الأصوات العربية للشخصيات

مرجع للمهارة `talking-characters`. الصوت يُحدَّد في `cast.json`:
`"voice": {"provider": "edge", "voice": "ar-SA-HamedNeural", "rate": "+10%", "pitch": "+2Hz"}`.
تحقّق من القائمة وقت التشغيل: `edge-tts --list-voices | grep "^Name.*ar-"`.

## edge-tts (مجاني، أصوات Microsoft العصبية) — 32 صوتاً في 16 لهجة

| البلد | أنثى | ذكر |
|---|---|---|
| ar-AE الإمارات | FatimaNeural | HamdanNeural |
| ar-BH البحرين | LailaNeural | AliNeural |
| ar-DZ الجزائر | AminaNeural | IsmaelNeural |
| ar-EG مصر | SalmaNeural | ShakirNeural |
| ar-IQ العراق | RanaNeural | BasselNeural |
| ar-JO الأردن | SanaNeural | TaimNeural |
| ar-KW الكويت | NouraNeural | FahedNeural |
| ar-LB لبنان | LaylaNeural | RamiNeural |
| ar-LY ليبيا | ImanNeural | OmarNeural |
| ar-MA المغرب | MounaNeural | JamalNeural |
| ar-OM عُمان | AyshaNeural | AbdullahNeural |
| ar-QA قطر | AmalNeural | MoazNeural |
| ar-SA السعودية | ZariyahNeural | HamedNeural |
| ar-SY سوريا | AmanyNeural | LaithNeural |
| ar-TN تونس | ReemNeural | HediNeural |
| ar-YE اليمن | MaryamNeural | SalehNeural |

أغلبها يقرأ الفصحى بلكنة البلد. كتابة الكلمة العامية كما تُنطق تساعد. الصيغ: `<locale>-<Name>`، مثل `ar-EG-SalmaNeural`.
المستخدم في «حوار»: سامي `ar-SA-HamedNeural +10% +2Hz`، وليلى `ar-SA-ZariyahNeural -4%`.

## تمييز الشخصيات
- لهجة أو جنس مختلف أولاً، ثم `rate` ±10–25٪ و`pitch` (مثل `+15Hz`).
- **طفل:** صوت أنثى `pitch +40Hz` و`rate +10%`؛ أفضل منه رفع الطبقة بعد التوليد:
  `ffmpeg -i in.mp3 -af "asetrate=48000*1.18,aresample=48000,atempo=0.85" out.mp3`.
- **مسنّ:** صوت ذكر `rate -15%` و`pitch -10Hz`، مع ارتعاش خفيف: `ffmpeg -i in.mp3 -af "vibrato=f=5:d=0.08" out.mp3`.
- لا أصوات أطفال أو مسنّين عربية أصلية في edge-tts. بعد أيّ معالجة بـ ffmpeg أعد مزامنة الشفاه (`dialogue.py --force --only <id>`).

## ElevenLabs (مدفوع، اختياري)
- في `cast.json`: `"voice": {"provider": "elevenlabs", "voice": "<voice id>", "model": "eleven_v3"}` (يحتاج `ELEVENLABS_API_KEY`؛
  الافتراضي `eleven_multilingual_v2`). `dialogue.py` يأخذ أزمنة الحروف من الواجهة فتعمل مزامنة الشفاه كما مع edge-tts.
  هذا المسار مكتوب لكنه لم يُختبر في المستودع بمفتاح حقيقي بعد.
- **Text to Dialogue** (`POST /v1/text-to-dialogue`) يولّد حواراً كاملاً بتناوب طبيعي، ونسخة البثّ بالأزمنة تعطي محاذاة لكل متكلّم
  (غير مدمج في `dialogue.py` بعد؛ فكرة للتطوير).
- **وسوم الأداء** بين أقواس مربّعة داخل النص: `[sighs]`، `[laughs]`، `[whispers]`، `[shouts]` (بالإنجليزية داخل النص العربي؛
  جودتها بالعربية غير مختبرة هنا).
- المصادر: https://elevenlabs.io/docs/overview/capabilities/text-to-dialogue

## بدائل مفتوحة (افحص الترخيص قبل أيّ استعمال تجاري)
| النموذج | الترخيص | تجاري؟ |
|---|---|---|
| Piper `ar_JO-kareem` | المحرّك MIT (الإصدار الجديد GPL-3.0)؛ ترخيص الصوت في بطاقته على Hugging Face | حسب البطاقة |
| facebook/mms-tts-ara | CC-BY-NC 4.0 | **لا** |
| Coqui XTTS-v2 | Coqui Public Model License (غير تجاري) | **لا** |

الافتراضي: edge-tts. بلا إنترنت: Piper kareem (بعد فحص البطاقة). الأفضل جودة: ElevenLabs v3.
