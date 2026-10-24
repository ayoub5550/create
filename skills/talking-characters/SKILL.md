---
name: talking-characters
description: Makes stick-figure characters talk and act in dialogue films (English by default, Arabic on request) - casting distinct voices (edge-tts / ElevenLabs), lip sync with Rhubarb (English recogniser, Arabic letter rules), listening and reaction acting, gestures on stressed words, comic beats - with the repo pipeline cast.json + scene.json -> dialogue.py -> shots -> film.js -> score -> render. Use for any film where characters speak. Arabic: شخصيات تتكلم، حوار، مزامنة الشفاه، أصوات، تمثيل، ردود فعل
license: MIT
---

# مهارة الشخصيات المتكلّمة (talking-characters)

أنت مخرج التمثيل الصوتي والحركي: كل شخصية لها صوت يُعرف، وفم يطابق كلامها، وجسد **يستمع** حين يتكلّم غيرها.
الصوت هو الساعة: كل شيء (اللقطات، الإيماءات، الموسيقى) يُربط بأزمنة الكلمات في `timeline.json`، لا بأرقام ثابتة.
المثال الكامل: `examples/hiwar` (سامي وليلى، 29 ث).

## متى تستعمل هذه المهارة
- أيّ فيلم فيه شخصيتان تتحاوران أو شخصية تتكلّم أمام الكاميرا (بدل الراوي).
- حين يبدو الحوار «ميتاً»: فم يتحرّك ووجه وجسد جامدان، أو مستمع متجمّد.
- عند اختيار الأصوات، أو حين يخلط المشاهد بين المتكلّمين.

## خطّ الإنتاج
1. **النص والشخصيات:** `cartoon-writer` ثم `character-design` ← `cast.json` و`scene.json` (انسخ البداية: `python tools/new_film.py <slug> --from hiwar`).
   افحص الطاقم: `python tools/render/model_sheet.py films/<slug>/cast.json sheet.png` (ظلال، أفواه، تعابير).
2. **الأصوات والتوقيت ومزامنة الشفاه:** `python tools/voice/dialogue.py films/<slug>` ← `assets/voice/*.mp3` و`tts.json`
   و`timeline.json` و`lipsync.json` و`film_data.js` (أفواه، رمش، إيماءات، إيماء رأس لكل شخصية). مخزَّن: سطر لم يتغيّر لا يُعاد.
   ثم `python tools/voice/stt_check.py scene.json`: هل نطق المحرّك كل كلمة؟ شكّل الكلمة الملتبسة فقط وأعد.
3. **اللقطات:** `python tools/direct/shotlist.py auto films/<slug>` مسودة أولى، ثم عدّل `shots.json` بيدك بأزمنة مربوطة بالكلمات
   (`"l4.end-0.1"`، `"l1@4"`) ثم `check`. القواعد في `film-director` و`film-editor`.
4. **التمثيل في `film.js`:** جدول إيماءات لكل شخصية على كلماتها، ومفاتيح تعابير، وردود فعل، وطبقات `Talk` (§القواعد).
5. **الصوت:** `score.py` (موسيقى + مؤثرات بنفس صيغ الأزمنة) ← `bash build.sh` ← `snap.py` ← `render.sh` ← `verify.py`
   ← `captions.py tts.json timeline.json out.srt --speakers cast.json`.
6. **الناقد:** `docs/recipe/07-critic.md` (+ قائمة الحوار فيه). لا تسليم قبل ≥ 8/10 وصفر P0/P1.

## القواعد
1. **أصوات متمايزة، بالإنجليزية افتراضياً** (قرار المالك 2026-10-24: النص والأصوات بالإنجليزية في كل فيلم جديد): محرّك أو لهجة
   أو جنس مختلف أولاً، ثم `rate` و`pitch`. لا صوتان بنفس الإعدادات (`references/voices-en.md`؛ العربية عند الطلب: `voices-ar.md`).
2. **الفم يسبق الصوت** بإطار تقريباً (`--lead 0.04`) ويثبت ≥ إطارين؛ م/ب تغلقه دائماً، ف = شفة على أسنان، و/الضمّة = تدوير
   (`references/arabic-visemes.md`). بين الجمل (> 0.25 ث) فم الراحة X، وتعبير الوجه يعود.
3. **المستمع حيّ:** ينظر إلى المتكلّم، يتنفّس، يومئ عند نهايات الجمل، ويتفاعل **بعد** الكلمة المفاجئة بـ 0.2–0.4 ث، لا قبلها.
   لا ثبات تامّ > 1 ث لأيّ شخصية على الشاشة (`Talk.idle`).
4. **الإيماءة على الكلمة المشدّدة** (`*كلمة*` في النص): ذروتها على بداية الكلمة أو قبلها بـ 0–0.1 ث، وتحضيرها قبلها بـ 0.2–0.3 ث.
   ≤ إيماءة كبيرة كل 1.5 ث، ثم تعود اليدان للراحة. إيماءة على كل كلمة = ضجيج.
5. **قاعدة الثلاث بالجسد:** ثلاث كلمات متصاعدة = ثلاث وضعيات متصاعدة (هزّ كتفين ← يد ← يدان) مع ميل متزايد، ثم الكسر.
   بدايات الكلمات الثلاث على بعد 0.7–1.0 ث (`"max_pause": 0.35` في السطر يقصّر سكتات TTS). يد مرفوعة قرب الوجه تبقى
   ≥ 60 وحدة عن مركز الرأس (`[11, -61]` من الرقبة) وإلا قُرئت «يداً في الوجه».
6. **الوقفة قبل الضربة:** `gap` 1–1.5 ث قبل سطر النكتة، والموسيقى تصمت (`Score.music_gap`)، وعين المستمع ترمش ببطء.
   ثم لقطة ردّ فعل تثبت 1–2 ث (شهقة: فم مفتوح ثم «o»، عينان ×1.6–1.7، ارتداد، رمشة مزدوجة).
7. **الزمن من النص:** كل توقيت في `film.js` و`score.py` يُحسب من `LN.l4.end` أو كلمة (`L3.words[2].t0`)، وبنفس الصيغ في الملفّين،
   فإعادة التسجيل لا تكسر شيئاً.
8. **أحجام اللقطات للحوار:** MS للإيماءات، MCU للعاطفة، CU للسطر المفتاح وردّ الفعل. المتكلّم على الشاشة معظم سطره.
   أعلى الرأس في الإطار يشمل الشعر والحجاب (`top = hy − 1.38·HR` في `resolve`).
9. **العاطفة في التعبير لا في الصوت:** edge-tts لا يمثّل العاطفة؛ ارسمها بمفاتيح `expr` [t, فم، حاجب، عين] وبالجسد.
   ElevenLabs v3 يقبل وسوماً مثل `[sighs]` (اختياري، مدفوع).

## قائمة فحص قبل التسليم
- [ ] `stt_check.py scene.json` ناجح لكل الأسطر، والأصوات تُعرف مغمض العينين.
- [ ] في صفحة اللقطات: كل متكلّم فمه مفتوح في كلامه ومغلق في صمته، والمستمع ينظر ويتحرّك.
- [ ] السطر المفتاح بلقطة قريبة، وردّ الفعل مرئي ومقروء (لا يد خارج الإطار، لا شعر مقطوع).
- [ ] `shotlist.py check` نظيف، و`hyperframes lint` بلا أخطاء، و`snap.py` بلا أخطاء console.
- [ ] الترجمة `.srt` بأسماء المتكلّمين، والصوت النهائي −14..−16 LUFS (`render(lufs=-15)`) وذروة ≤ −1 dBTP.

## التطبيق في هذا المستودع
- `engine/stickfilm.js`: `rig(g, {scale, head, ink, color, accessories, mouth, mouthFill, expr, blinks, lineComp: 0.6, seed})`؛
  `mouth` = `Talk.mouth(C.mouth)` أو دالّة تغلّفه (فم مفروض في لحظة: شهقة). `blinks` تقبل `[t, مدّة]` (رمشة بطيئة، عينان مغمضتان).
  حين ترتفع اليد فوق الرقبة يُرسم **الساعد** فوق الرأس (العضد يبقى خلف الحجاب والوشاح)؛ إيماءة بـ `palm: 1` ترسم يداً مفتوحة.
- `engine/talk.js`: `Talk.act(M, J, t, [{g, t0, t1, amp, side, ease, easeOut}])` بالإيماءات `rest explain palmsUp point pointDown
  shrug crossArms hips chin wave celebrate handChest facepalm stop pointBack raise1 raise2`؛ `Talk.fromLines(DATA.lines, id)`؛
  `Talk.beats` و`Talk.nods` و`Talk.accents` و`Talk.idle`؛ `C = FILM_DATA.chars.<id>`.
- `engine/shots.js`: `Shots.camera(FILM_SHOTS.shots, {resolve})` قطع حادّ وتأطير من الشخصيات (`zoom` يحفظ خطّ الأقدام أو أعلى
  الرأس، `top` للهامش العلوي، `frameAt` لتأطير لقطة على وضع لاحق)؛ `Shots.fx` (fadeIn/Out، dip، flash، irisOut بـ `to`/`from`).
- الأدوات: `tools/voice/{dialogue,lipsync,captions,stt_check}.py` (`max_pause`)، `tools/direct/shotlist.py`، `tools/render/model_sheet.py`،
  `tools/audio/sound.py` (`Score.music_gap`، `render(lufs=-15)`)، `tools/build/build.py` (يدمج `film_data.js` و`cast.json` و`shots.json`).

## أخطاء شائعة (من «حوار»)
- ملفات TTS تنتهي بنحو 0.8 ث صمت: التوقيت من نهاية آخر كلمة (`dialogue.py` يفعل ذلك)، لا من طول الملف.
- لقطة «فوق الكتف» في 2D مع شخصيتين متباعدتين = لقطة ثنائية رديئة: لقطة مفردة نظيفة أفضل (`over` يتراجع تلقائياً).
- ردّ فعل في لقطة واسعة لا يُرى (لطمة الجبين في WS = P0، والقفلة في WS = P1): أعطِ ردّ الفعل MCU، وضع شيء النكتة **بين**
  الشخصيتين لتتّسع القفلة كلّها في لقطة ثنائية قريبة.
- الكاميرا تترك المتكلّم في منتصف سطره بلا سبب: القطع إلى المستمع قرب نهاية السطر فقط (L-cut) أو لردّ فعل مقصود.
- صمت رقمي تامّ في الوقفة يبدو عطلاً: صوت خافت جداً (صرصور، ريح) يبقي المكان حيّاً ويصنع النكتة.

التفاصيل: `references/arabic-visemes.md` و`references/voices-ar.md` و`references/acting-rules.md`.
