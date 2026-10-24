# أفلام متعدّدة اللقطات في HyperFrames 0.8.190

مرجع للمهارة `film-editor`. HTML يقول **ماذا يُعرض ومتى**، والسكربت يقول **كيف يتحرّك**.

## 1. ثلاث طرق للقطع، من الأبسط
1. **مشهد واحد، كاميرا مقطّعة:** صفحة واحدة، `Shots.camera(shots, {...}).apply(worldEl, t)`. القطع = تغيّر تحويل العالم
   في إطار واحد. الأنسب للحوار: المسرح واحد، والشخصيات وحركاتها مستمرّة عبر القطعات تلقائياً.
2. **جذر + مكوّن فرعي لكل مشهد/لقطة (الشكل القانوني للأفلام الطويلة):** `index.html` رفيع يركّب `compositions/scene-XX.html`.
3. **ريندر لكل مشهد ثم ffmpeg concat:** للأفلام > 3–5 دقائق أو الأجهزة غير المستقرّة؛ أعد ريندر ما تغيّر فقط.

## 2. المكوّنات الفرعية (sub-compositions)
```html
<div data-composition-id="scene-02" data-composition-src="compositions/scene-02.html"
     data-start="12" data-duration="18" data-playback-start="0"></div>
```
- ملف الابن يلفّ محتواه في `<template>`، ويسجّل خطّه الزمني باسمه: `window.__timelines["scene-02"] = tl` (GSAP بـ `{paused:true}`).
- المسارات من **جذر المشروع** حتى داخل الابن: `compositions/x.html`، لا `../`.
- زمن الابن محلّي: مقطع عند 2 ث داخل مضيف يبدأ عند 10 ث يُعرض عند 12 ث.
- `data-playback-start` يقصّ رأس اللقطة دون تعديلها.
- `data-start` يقبل مراجع: `"intro"` (عند نهاية intro) أو `"intro - 0.5"` (تداخل لانتقال). الأرقام المطلقة أسهل في التصحيح.
- قالب واحد لعدّة لقطات: `data-composition-variables` على الابن، و`data-variable-values='{...}'` على المضيف،
  وتُقرأ بـ `window.__hyperframes.getVariables()`.
- `data-track-index` للعرض في الاستوديو فقط؛ ترتيب الرسم من CSS `z-index`. ضع التداخلات (المزج) على مسارات منفصلة للوضوح.
- المعاينة: الأبناء الملفوفون بـ `<template>` يُرسمون عبر جذر؛ أنشئ جذراً صغيراً `preview/scene-07.html` للمعاينة السريعة.

## 3. الصوت في HyperFrames
- `<audio>` يقبل `data-start` و`data-duration` و`data-volume` (1 = 0 dB، حتى 3.98) و`data-fade-in`/`data-fade-out`.
- القصّ من الملف: `data-media-start` (المازج يقرأه وحده). للمكوّنات المتداخلة: `data-playback-start`.
- الأنظف: `mix.wav` واحد مبنيّ بـ Python/ffmpeg من الخطّ الزمني، يُركّب كـ `<audio>` وحيد في الجذر `data-start="0"`.
  هكذا لا تقطع حدود اللقطات الصوت أبداً، وتأتي قطعات J/L مجاناً.
- لا تشغّل ولا توقف ولا تقفز بالوسائط من السكربت، ولا تُظهر/تخفي المقاطع بالزمن في JS: الإطار يفعل ذلك.

## 4. معدّل الإطارات
- المستودع يسلّم بـ 30 إطاراً/ث افتراضياً (`AGENTS.md`). 24 اختياري لمظهر سينمائي: `data-fps="24"` على الجذر أو
  `--fps 24` (23.976 = `24000/1001`)، وكل القواعد بالثواني لا بالإطارات فلا يتغيّر شيء آخر.
- ثبّت الجودة صراحة (`--quality high` أو `--crf 16`)؛ الوثائق غير متّفقة على الافتراضي.
- ضبابية الحركة (اختيارية لمشاهد الحركة): `data-motion-blur="on"` و`data-motion-blur-events="on"` (ضروري لأن وضعياتنا تُحسب في دالّة render(t))،
  وغالق 180° للإحساس السينمائي.

## 5. الحتمية (كل إطار دالّة نقيّة لـ t)
- الزمن = `floor(frame)/fps`، والإطارات تُطلب **بأيّ ترتيب** وعلى عدّة عمّال.
- ممنوع: `Date.now` و`requestAnimationFrame` و`Math.random` غير المبذور و`setTimeout` والجلب أثناء الريندر.
- مسموح: `hash(i)` وPRNG مبذور، وتحليل الموكاب وقياس أطوال المسارات **قبل** تسجيل الخطّ الزمني، وخطوط عربية محلّية.

## 6. قواعد lint وإصلاحها
| القاعدة | المعنى | الإصلاح |
|---|---|---|
| `composition_file_too_large` | الملف كبير جداً (صفحات الستيكمان الطويلة) | قسّمه مكوّنات فرعية بـ `data-composition-src` |
| `nested_structure_needs_subcomposition` | عنصر زمني في الجذر يحوي بنية متداخلة | انقله إلى `compositions/<x>.html` وركّبه |
| `gsap_callback_dom_measurement` | استدعاء يقيس DOM (`getBoundingClientRect`، `getTotalLength`) | قِس مرّة واحدة وقت البناء أو استعمل إحداثيات ثابتة |
| `gsap_timeline_set_initial_hide` | `tl.set(el,{opacity:0},0)` لا يُطبّق عند الإطار 0 | `gsap.set(...)` خارج الخطّ الزمني أو أخفِه في CSS |
| `gsap_css_transform_conflict` | CSS يضع `transform` وGSAP يحرّكه | انقل الإزاحة إلى `xPercent:-50, yPercent:-50` |
| `missing_data_no_timeline` | لا خطّ زمني مسجّل ولا `data-no-timeline` | سجّل الخطّ الزمني أو أضف السمة للمقطع الثابت |
أخرى: لا `repeat:-1` بلا حدّ، أضف `opacity:1` للوجهة في `from`، وأضف `isolation: isolate` مع z-index سالب.
الحلقة: `npx hyperframes lint` ← `tools/render/snap.py` ← `tools/render/render.sh` (يشغّل lint ثم render ويتوقّف عند أيّ خطأ)؛
عند الفشل `npx hyperframes doctor`. `gsap_css_transform_conflict` صار **خطأً** في 0.8.190: أيّ عنصر يحرّكه GSAP بـ x/y/scale
يجب ألّا يحمل `transform` في CSS (أصلحناه في قالب kinetic بـ `tl.fromTo`).

## 7. انتقالات الشيدر (shader transitions)
- الحزمة `@hyperframes/shader-transitions` (Apache-2.0): `init({scenes:[...], transitions:[{time, shader, duration}]})`.
- أمثلة أسماء: `whip-pan`، `sdf-iris`، `flash-through-white`، `cross-warp-morph`، `light-leak`. القائمة الرسمية من تصدير `SHADER_NAMES`.
- **لتغيير المشهد فقط**، لا داخل الحوار. أبسط بديل عندنا: `Shots.fx` (fadeIn/fadeOut، dip، flash، irisOut/irisIn).
- لا تنسخ كود `@remotion/transitions` (ترخيص غير مفتوح). شيدرات gl-transitions مسموحة بعد فحص ترويسة كل ملف.

## 8. مخطّط عمل مقترح لفيلم متعدّد المشاهد
```
films/<slug>/scene.json, cast.json → dialogue.py → timeline.json, lipsync.json, film_data.js
shotlist.py auto → shots.json → (إخراج يدوي) → shotlist.py check
proj/index.html  (جذر رفيع، 30 إطاراً/ث، <audio src="assets/mix.wav">)
proj/compositions/scene-01.html …  (كل مشهد: Shots.camera + StickFilm + Talk)
snap.py → ناقد → render.sh → verify.py
```

## مصادر
- https://github.com/heygen-com/hyperframes
- https://github.com/heygen-com/hyperframes/blob/main/docs/concepts/compositions.mdx
- https://github.com/heygen-com/hyperframes/blob/main/docs/reference/html-schema.mdx
- https://github.com/heygen-com/hyperframes/tree/main/skills
- https://github.com/gl-transitions/gl-transitions
- https://github.com/remotion-dev/remotion/blob/main/LICENSE.md
