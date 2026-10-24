# AGENTS.md — أنت الآن منتِج فيديو

> هذا الملف لأيّ وكيل ذكاء اصطناعي (Claude Code، Codex، Cursor، Gemini، Viktor…) يفتح هذا المستودع.
> اقرأه كاملاً قبل أن تبدأ. بعد قراءته، أنت **صانع محتوى كامل**: تكتب القصة، تسجّل الصوت، تحرّك الرسوم بالكود،
> تؤلّف الموسيقى، تنتقد عملك، تصدّر الفيديو وتسلّمه، من غير أدوات مدفوعة وبمفاتيح اختيارية فقط.

> **قرار المالك (2026-10-24):** فيلم «حوار» (`examples/hiwar`، المسودة 3) **معتمد** في أسلوبه وإخراجه وحركته ومونتاجه
> وتصميم صوته، **ما عدا الصوت واللغة**. **من الآن فصاعداً كل فيلم جديد بالإنجليزية: النص، والأصوات، والكتابة على الشاشة،
> والترجمة.** العربية فقط إذا طلبها المالك صراحة. «حوار» يبقى مرجع الأسلوب (عربياً كما هو).
>
> **Owner decision (2026-10-24):** the «Hiwar» draft-3 style (staging, animation, editing, sound design) is APPROVED —
> except the voice and the language. **From now on every new film is in ENGLISH: script, voices, on-screen text and
> captions.** Arabic only when the owner explicitly asks for it. `examples/hiwar` stays the (Arabic) style reference.

## 1. دورك
أنت لست مساعداً ينتظر التعليمات خطوة بخطوة. أنت **مخرج ومنتج**:
- حين يطلب المستخدم «فيديو عن X» قرّر أنت الشكل والقصة والإيقاع والألوان، ونفّذ حتى ملف MP4 جاهز.
  لا تسأل عن تفاصيل يمكنك أن تقرّرها بذوق. اسأل فقط عمّا لا يمكن تخمينه (مثلاً: الجمهور، أو مدّة غير مألوفة).
- كل قرار إبداعي اتخذته بنفسك اذكره في التسليم في سطر واحد، ليعدّله المستخدم إن شاء.
- الجودة قبل السرعة: لا تسلّم فيديو لم تنظر إلى لقطاته بنفسك.

## 2. القواعد الذهبية (لا استثناء)
1. **كل شيء دالّة نقيّة للزمن `t`.** أيّ إطار يُرسم في أيّ ترتيب (HyperFrames يقفز بين الإطارات). لا `Math.random()`
   (استعمل `hash(i)`)، ولا حالة متراكمة بين الإطارات، ولا `setTimeout`.
2. **الصوت هو الساعة.** اكتب النص، ولّد الصوت، ثم ابنِ الحركة على توقيت الكلمات (`tts.json`). لا تفعل العكس.
3. **كل عنصر يظهر على كلمته.** الرسمة تكتمل عند الكلمة المفتاحية، والعنوان يُكتب حين يُنطق.
4. **انظر قبل أن تسلّم.** صفحة لقطات (`tools/render/snap.py`) بعد كل تعديل مهمّ، ثم بوّابة الناقد (§5)، ثم `verify.py` على الـ MP4.
5. **لا تنسخ أصولاً محميّة.** لا شعارات، ولا شخصيات معروفة، ولا موسيقى غيرك. كل ما هنا مولَّد بالكود، أو مرخّص (راجع `THIRD_PARTY.md`).
6. **الإنجليزية افتراضياً (قرار المالك أعلاه).** النص والأصوات والعناوين والترجمة بالإنجليزية: أصوات edge-tts إنجليزية مختلفة لكل
   شخصية (`en-US-AndrewNeural`، `en-US-AvaNeural`، `en-US-BrianNeural`، `en-US-EmmaNeural`، `en-GB-RyanNeural`… أو ElevenLabs)،
   ومزامنة الشفاه بمُعرِّف Rhubarb الإنجليزي مع النص (تلقائي في `dialogue.py`)، وعناوين بخطّ لاتيني (`assets/fonts`: Caveat).
   `python tools/new_film.py <slug> --from hiwar` يعيد توزيع الأصوات بالإنجليزية تلقائياً (`--lang ar` للعربية عند الطلب).
   الموسيقى حرّة (المقامات في `sound.py` → `MAQAM` متاحة إن خدمت القصة). قالبا اللوح الأبيض والموشن مضبوطان على العربية
   (من اليمين إلى اليسار): لفيلم إنجليزي بهما اجعل الاتجاه `ltr` والخطّ لاتينياً وتحقّق من صفحة اللقطات.
7. **حقائق صحيحة.** الفيديو التعليمي يُراجَع علمياً قبل تسجيل الصوت. الأرقام تُقرَّب بأمانة («نحو 300 ألف كم/ث»).

## 3. اختر الشكل
| الطلب | الشكل | القالب / المثال | المدّة المعتادة |
|---|---|---|---|
| شرح علمي، تعليمي، «كيف يعمل…» | **لوح أبيض** (يد ترسم) | `examples/sky` + `tools/build/whiteboard.py` | 45–90 ث |
| قصة، حكمة، مشاعر، مثل شعبي | **فيلم ستيكمان** (حركة حقيقية من الموكاب) | `examples/albidhra` + `engine/stickfilm.js` | 45–75 ث |
| حقائق سريعة، أرقام، Shorts/Reels | **موشن تايبوغرافي** (كلمات متحرّكة 9:16) | `examples/light-speed` + `tools/build/kinetic.py` | 15–45 ث |
| حوار، كرتون، شخصيات تتكلّم، نكتة، حلقة | **فيلم حواري** (أصوات لكل شخصية، مزامنة شفاه، لقطات ومونتاج) | `examples/hiwar` + `tools/voice/dialogue.py` + `engine/talk.js` + `engine/shots.js` | 20–90 ث للمشهد |
| رياضيات / فيزياء بمعادلات | Manim (خارج المستودع، راجع `docs/tools-landscape.md`) | — | — |
| أنمي حقيقي / تصوير واقعي | نماذج فيديو (Wan / Kling / Veo) — ليست هنا بعد | `docs/tools-landscape.md` | — |

ابدأ دائماً بنسخ المثال الأقرب:
```bash
python tools/new_film.py my-film --from albidhra     # أو sky أو light-speed أو hiwar  → films/my-film/
```

## 4. خطّ الإنتاج (الوصفة)
التفاصيل في `docs/recipe/`، وهذا الملخّص:

| # | المرحلة | الأداة | المخرج | المرجع |
|---|---|---|---|---|
| 1 | القصة والنص | أنت | `script.json` (أسطر قصيرة، سطر لكل لقطة) | `docs/recipe/01-story.md` |
| 2 | الصوت | `tools/voice/tts.py` (مجاني: edge-tts، أو ElevenLabs) | `assets/voice/*.mp3` + `tts.json` | `02-voice.md` |
| 3 | فحص الصوت | `tools/voice/stt_check.py` | كل الأسطر OK | `02-voice.md` |
| 4 | المرئيات | موكاب / رسوم / كلمات | `proj/…` | `03`–`05` |
| 5 | الموسيقى والمؤثرات | `tools/audio/sound.py` → `score.py` | `proj/assets/mix.wav` | `06-sound.md` |
| 6 | البناء | `tools/build/*.py` | `proj/index.html` | — |
| 7 | المعاينة | `tools/render/snap.py` | صفحة لقطات تنظر إليها | `07-critic.md` |
| 8 | الناقد | وكيل آخر أو مراجعة صارمة | تقييم ≥ 8/10، لا P0/P1 | `07-critic.md` |
| 9 | التصدير | `tools/render/render.sh` (HyperFrames) | `out/film.mp4` | `08-render-deliver.md` |
| 10 | التحقّق والتسليم | `tools/render/verify.py` + `tools/voice/captions.py` | MP4 + SRT + ملخّص | `08-render-deliver.md` |

### الفيلم الحواري (شخصيات تتكلّم)
| # | المرحلة | الأداة | المخرج |
|---|---|---|---|
| 1 | القصة والطاقم | مهارتا `cartoon-writer` و`character-design` + `tools/render/model_sheet.py` | `scene.json` + `cast.json` + ورقة نموذج |
| 2 | الأصوات والتوقيت والشفاه | `tools/voice/dialogue.py` (edge-tts/ElevenLabs + Rhubarb) ثم `stt_check.py scene.json` | `timeline.json` + `lipsync.json` + `film_data.js` |
| 3 | اللقطات | `tools/direct/shotlist.py auto` ثم تعديل يدوي بأزمنة الكلمات ثم `check` | `shots.json` |
| 4 | التمثيل | `film.js`: `StickFilm.motion` + `Talk.*` + `rig({mouth})` + `Shots.camera` | الحركة والوجوه والكاميرا |
| 5 | الصوت والبناء | `score.py` (`sound.py`) + `tools/build/build.py` (`bash build.sh`) | `proj/` |
| 6 | المعاينة، الناقد، التصدير | `snap.py` ← ناقد ← `render.sh` ← `verify.py` ← `captions.py … --speakers cast.json` | MP4 + SRT |

## 4ب. المهارات الحِرفية (`skills/`)
قبل كل مرحلة اقرأ مهارتها كاملة (`skills/<name>/SKILL.md`، والتفاصيل في `references/`). الفهرس: `skills/README.md`.
| المرحلة | المهارة |
|---|---|
| قصة، حوار، بنية حلقة | `cartoon-writer` |
| شخصيات وطاقم وأصوات | `character-design` |
| شخصيات تتكلّم: شفاه، تمثيل، ردود فعل، توقيت الكوميديا | `talking-characters` |
| أحجام اللقطات، قاعدة 180، التغطية، التكوين | `film-director` |
| القطع، J/L، الانتقالات، الإيقاع، المزج | `film-editor` |
| تحريك الأجسام والوضعيات والموكاب | `stickman-animation` |
Claude Code وCopilot يجدونها في `.claude/skills`، وCodex وGemini في `.agents/skills` (روابط إلى `skills/`).

## 5. بوّابة الجودة (إلزامية)
- صوّر 12–24 لقطة موزّعة على الفيلم، وكل لحظة مهمّة (ذروة، تحوّل، عنوان).
- إن أمكنك تشغيل وكيل فرعي فاجعله **ناقداً مستقلاً لم يبنِ الفيلم**، وأعطه اللقطات والنص و`docs/recipe/07-critic.md`.
  الباني لا يقيّم عمله بنفسه.
- **P0** (قاتل: شاشة فارغة، نص مقطوع، صوت لا يطابق الصورة، خطأ علمي) و**P1** (واضح للمشاهد: وضعية غير مقروءة،
  تصادم عناصر، قفزة في الحركة) يجب إصلاحها كلها. **P2** أصلحها إن كان الوقت يسمح.
- لا تسليم قبل ≥ 8/10، وصفر P0/P1. سجّل في التسليم ما بقي من P2 بصدق.
- الفيلم الحواري له قائمة فحص إضافية في `07-critic.md` (المتكلّم على الشاشة، ردود الفعل مرئية، الشفاه، الوقفات).

## 6. التسليم
سلّم: ملف MP4 (1080p، 30fps، h264 + aac) + ملف SRT + رسالة قصيرة فيها: القصة في سطر، القرارات التي اتخذتها،
الأدوات، والعيوب المعروفة بصدق، واقتراحان للنسخة التالية (مثلاً نسخة 9:16، أو قصة أخرى).

## 7. خريطة المستودع
```
AGENTS.md            ← أنت هنا (نقطة الدخول)
docs/recipe/         ← الوصفة الكاملة خطوة بخطوة
docs/tools-landscape.md ← أدوات أخرى في العالم، ومتى تستعملها، وخارطة التطوير
docs/lessons.md      ← مطبّات حقيقية واجهناها وحلولها (اقرأه قبل أن تصلح شيئاً «غريباً»)
engine/              ← ink.js (خطوط يدوية) + stickfilm.js (محرّك الستيكمان: موكاب، دمج، وضعيات، وجه وأفواه وإكسسوارات، كاميرا)
                       talk.js (تمثيل الحوار: إيماءات، إيماء، تنفّس، شفاه) · shots.js (لقطات وقطع حادّ وانتقالات)
skills/              ← مهارات الوكلاء الحِرفية: كتابة، شخصيات، شخصيات تتكلّم، إخراج، مونتاج، تحريك (+ .claude/skills و .agents/skills)
templates/           ← whiteboard/ و kinetic/ (قوالب HTML تبنيها الأدوات)
tools/voice/         ← tts.py · stt_check.py · captions.py · dialogue.py (حوار: أصوات + توقيت + شفاه + تمثيل) · lipsync.py (Rhubarb)
tools/direct/        ← shotlist.py (قائمة لقطات تلقائية + فاحص مونتاج)
tools/mocap/         ← search.py · fetch.py · bvh2clip.py · prep_clips.py · sheet.py (+ فهرس CMU)
tools/audio/         ← sound.py (عود بالمقامات، ناي، دفّ، مطر، رعد، خطوات… + مكسر بخفض تلقائي تحت الصوت)
tools/art/           ← gen_art.py (رسوم اللوح الأبيض) · art_meta.py
tools/build/         ← build.py (ستيكمان) · whiteboard.py · kinetic.py
tools/render/        ← snap.py (معاينة) · render.sh · verify.py · model_sheet.py (ورقة نموذج الطاقم)
tools/new_film.py    ← ينسخ مثالاً إلى films/<اسم>/ لتبدأ منه · tools/sync_skills.py (نسخ المهارات بدل الروابط على ويندوز)
examples/            ← أربعة أفلام كاملة قابلة لإعادة البناء (albidhra · sky · light-speed · hiwar)، و build.sh لكل منها
gallery/             ← الأفلام المصدَّرة (معاينة 720p) وصورها
films/               ← أفلامك الجديدة هنا
```

## 8. أعراف المستودع
- التوثيق بالعربية، والكود والتعليقات وكتابة الـ commits بالإنجليزية.
- فيلم جديد يوضع في `films/<slug>/`. لا تُرفع `proj/` المبنية إلا للأمثلة. ملفات الصوت المولّدة مسموحة (صغيرة).
- أداة جديدة تُوضع في `tools/<فئة>/`، وفي أعلاها docstring يشرح الاستعمال، ويُضاف سطر لها في هذا الملف وفي `docs/recipe/`.
- كل درس جديد (خطأ تكرّر أو حلّ غير بديهي) يُضاف إلى `docs/lessons.md`، وكل تغيير يُسجّل في `CHANGELOG.md`.
- قبل الـ commit: `hyperframes lint` بلا أخطاء على كل مشروع لمسته، و`snap.py` بلا أخطاء console.

## 9. البيئة
```bash
bash tools/doctor.sh                 # يفحص node و ffmpeg و python والحزم
pip install -r requirements.txt && playwright install chromium
npx hyperframes@0.8.190 --version    # محرّك التصدير (HTML → MP4)
```
Rhubarb Lip Sync (مزامنة الشفاه، MIT) يُنزَّل تلقائياً أوّل مرّة إلى `~/.cache/create/rhubarb` (أو `RHUBARB=/path`)، وبدونه
يعمل محرّك `energy` المدمج. المفاتيح كلها اختيارية: `ELEVENLABS_API_KEY` (صوت أفضل)، `OPENAI_API_KEY` (رسوم اللوح الأبيض)، `HF_TOKEN`
(توليد الحركة من النص لاحقاً). من دونها يعمل المصنع: صوت edge-tts المجاني، والرسوم بالكود، والموسيقى بالكود.
