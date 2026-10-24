# مهارات الوكلاء (Agent Skills)

مهارات حِرفية لإنتاج أفلام ستيكمان احترافية، بصيغة [Agent Skills](https://agentskills.io): مجلّد لكل مهارة فيه `SKILL.md`
(متى تُستعمل، الخطوات، القواعد، قائمة الفحص، التطبيق في المستودع) و`references/` للتفاصيل.
Craft skills for producing professional stick-figure films (Arabic bodies, English descriptions for discovery).

| المهارة | متى تُستعمل |
|---|---|
| [`cartoon-writer`](cartoon-writer/SKILL.md) | أوّل أيّ فيلم قصصي: الفكرة، الشخصيات، البنية، الحوار ← `scene.json` |
| [`character-design`](character-design/SKILL.md) | طاقم يُميَّز من ظلّه: لون، طول، رأس، إكسسوار، صوت ← `cast.json` + ورقة نموذج |
| [`talking-characters`](talking-characters/SKILL.md) | شخصيات تتكلّم: أصوات، مزامنة شفاه عربية، تمثيل المستمع، ردود فعل، توقيت الكوميديا |
| [`film-director`](film-director/SKILL.md) | الإخراج: أحجام اللقطات، قاعدة 180، التغطية، التكوين ← `shots.json` |
| [`film-editor`](film-editor/SKILL.md) | المونتاج: متى وكيف نقطع، J/L، الانتقالات، الإيقاع، المزج ← الفيلم النهائي |
| [`stickman-animation`](stickman-animation/SKILL.md) | التحريك: مبادئ التحريك الاثنا عشر للستيكمان، الوضعيات، الموكاب، الطبقات الإجرائية |

## الترتيب في فيلم حواري
`cartoon-writer` ← `character-design` ← `talking-characters` (الأصوات والشفاه والتمثيل) ← `film-director` ← `stickman-animation`
← `film-editor` ← بوّابة الناقد (`docs/recipe/07-critic.md`). المثال الكامل: `examples/hiwar`.

## كيف يجدها وكيلك
- **Claude Code / Copilot:** `.claude/skills` (رابط رمزي إلى هذا المجلّد) — تعمل تلقائياً عند فتح المستودع.
- **Codex / Gemini CLI:** `.agents/skills` (رابط رمزي).
- **أداة skills:** `npx skills add ayoub5550/create` تثبّت من مجلّد `skills/`.
- **ويندوز** (الروابط الرمزية قد تصل ملفات نصّية): `python tools/sync_skills.py` ينسخ المجلّد بدل الروابط.

## قواعد كتابة مهارة جديدة
- اسم المجلّد = `name` في الواجهة (أحرف صغيرة وشرطات، ≤ 64)، و`description` إنجليزي ≤ 1024 حرفاً ينتهي بكلمات مفتاحية عربية.
- الجسم ≤ 500 سطر، بالعربية، والتفاصيل في `references/`. كل أمر أو دالّة مذكورة يجب أن تكون موجودة فعلاً في المستودع.
- الأرقام «قواعد عملية» ما لم يُذكر مصدرها. لا نصوص منسوخة من مصادر بترخيص غير مفتوح.
