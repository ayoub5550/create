# مخطّط `cast.json` (كتاب الشخصيات)

مرجع للمهارة `character-design`. الملف في `films/<slug>/cast.json`، ويقرؤه `tools/voice/dialogue.py` و`tools/render/model_sheet.py`
و`tools/build/build.py` (يدمجه في الصفحة: `window.FILM_CAST`).

## 1. البنية
```json
{
  "characters": {
    "<id>": {
      "name": "الاسم بالعربية",
      "voice": {"provider": "edge", "voice": "ar-SA-HamedNeural", "rate": "+0%", "pitch": "+0Hz"},
      "look": {"ink": "#2b2a28", "color": "#c4453b", "scale": 0.74, "head": 46, "accessories": ["scarf", "tuft"]},
      "personality": {"gesture": 1.0, "energy": 1.0},
      "notes": "الرغبة، العيب، اللازمة — للكاتب والمخرج، لا تقرؤه الأدوات"
    }
  }
}
```

## 2. الحقول
| الحقل | المعنى | قيم مقترحة |
|---|---|---|
| `<id>` | معرّف ascii صغير، ثابت في كل الملفات | `salim`, `huda` |
| `name` | الاسم المعروض (الترجمة، ورقة النموذج) | عربي |
| `voice.provider` | محرّك الصوت | `edge` (مجاني) أو `elevenlabs` (+ `model`) |
| `voice.voice` | معرّف الصوت عند المحرّك | صوت عربي مختلف لكل شخصية إن أمكن (`talking-characters/references/voices-ar.md`) |
| `voice.rate` / `voice.pitch` | تمييز الصوت (edge) | السرعة ±10–25٪، الطبقة بفارق واضح بالـ Hz |
| `look.ink` | لون الخطّ (مشترك عادة) | داكن واحد للطاقم |
| `look.color` | اللون المميّز (الإكسسوارات تأخذه افتراضياً) | مشبع، متباعد عن بقية الطاقم |
| `look.scale` | مقياس الجسم = الطول | 0.62–0.82 (الافتراضي 0.72؛ ±15٪ بين الشخصيات) |
| `look.head` | نصف قطر الرأس بالبكسل عند المقياس 1 | 40–56 (الافتراضي 46) |
| `look.stroke` | سماكة الخطّ عند المقياس 1 (اختياري) | 10 افتراضياً، ~13 للبطل |
| `look.headFill` | لون الرأس (اختياري) | ورق افتراضياً |
| `look.accessories` | ظلّ مميّز | من: `cap, fez, hijab, bun, bow, tuft, glasses, beard, mustache, scarf`، أو `{"type": "cap", "color": "#..."}` |
| `personality.gesture` | حجم الإيماءات (سعة الضربات) | 0.5 خجول … 1.5 منطلق |
| `personality.energy` | الطاقة | 0.5 هادئ … 1.5 متحمّس |
| `notes` | ملاحظات الكاتب (رغبة، عيب، إيماءة مفضّلة) | نصّ حرّ لا تقرؤه الأدوات |

لا تخترع حقولاً أخرى تقرؤها الأدوات دون تعديل الأدوات نفسها.

## 3. مثال: طاقم من ثلاثة يجتاز اختبار المحاور الثلاثة
```json
{"characters":{
 "salim":{"name":"سليم",
  "voice":{"provider":"edge","voice":"ar-EG-ShakirNeural","rate":"+10%","pitch":"+0Hz"},
  "look":{"ink":"#2b2a28","color":"#E4572E","scale":0.74,"head":46,"accessories":["cap"]},
  "personality":{"gesture":1.3,"energy":1.3},"notes":"متحمّس، يشرح بيديه (explain)"},
 "huda":{"name":"هدى",
  "voice":{"provider":"edge","voice":"ar-SA-ZariyahNeural","rate":"+0%","pitch":"+0Hz"},
  "look":{"ink":"#2b2a28","color":"#2E86AB","scale":0.66,"head":52,"accessories":["hijab","glasses"]},
  "personality":{"gesture":0.9,"energy":0.9},"notes":"هادئة، تكتّف ذراعيها حين تنتظر (crossArms)"},
 "jaddi":{"name":"الجدّ",
  "voice":{"provider":"edge","voice":"ar-SA-HamedNeural","rate":"-15%","pitch":"-4Hz"},
  "look":{"ink":"#2b2a28","color":"#7A9E3B","scale":0.8,"head":42,"accessories":["fez","beard"]},
  "personality":{"gesture":0.6,"energy":0.6},"notes":"بطيء وحكيم، يده على ذقنه (chin)"}
}}
```
| الزوج | لون | طول/رأس | ظلّ إكسسوار | حركة | صوت |
|---|---|---|---|---|---|
| سليم / هدى | برتقالي / أزرق | 0.74 / 0.66، رأس أكبر | قبّعة / حجاب | 1.3 / 0.9 | ذكر / أنثى |
| سليم / الجدّ | برتقالي / أخضر | 0.74 / 0.8، رأس أصغر | قبّعة / طربوش+لحية | 1.3 / 0.6 | سرعة +10٪ / −15٪ |
معرّفات الأصوات أمثلة؛ تحقّق من الأصوات المتاحة فعلاً قبل الاستعمال (`docs/recipe/02-voice.md`).

## 4. مراجعة ورقة النموذج (model sheet)
`python tools/render/model_sheet.py films/<slug>/cast.json sheet.png` ثم انظر إلى الصورة واسأل:
1. **الاصطفاف:** هل فروق الطول والرأس واضحة والطاقم واقف على أرض واحدة؟
2. **الظلال:** هل تسمّي كل شخصية من ظلّها الأسود؟ صغّر الصورة إلى ~64 بكسل للشخصية وأعد.
3. **الألوان:** هل تتمايز؟ جرّب تدرّج الرمادي: هل يبقى فرق في السطوع؟
4. **الأفواه:** هل الأشكال `A`..`H` و`X` مقروءة على حجم الرأس الفعلي؟ الإغلاق (A) واضح؟
5. **الإكسسوارات:** هل تتعارض مع الفم أو العينين أو الإيماءات (لحية تغطّي الفم)؟
6. **التناغم:** هل يبدو الطاقم من عالم واحد (حبر واحد، سماكة متقاربة)؟

## 5. قواعد الاتساق
- المشهد يشير إلى `id` فقط؛ لا ألوان ولا أطوال ولا إكسسوارات في ملفات المشهد.
- تعديل الشكل = تعديل `cast.json` ثم `bash build.sh` (يعيد البناء؛ الأصوات لا تُعاد إلا إن تغيّر الصوت أو النص).
- مقياس الكاميرا وارتفاع خطّ النظر ثابتان داخل التتابع الواحد حتى لا «تكبر» الشخصية بين المشاهد.
- `film.js` يأخذ القيم من `FILM_CAST.characters.<id>.look` فقط، لا أرقام مكتوبة باليد.

## مصادر
- https://github.com/DanielSWolf/rhubarb-lip-sync
- https://github.com/rany2/edge-tts
- https://github.com/dsauce/stickman-kino
- https://github.com/bassimeledath/stix
