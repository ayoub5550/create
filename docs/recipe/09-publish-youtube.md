# 09 · النشر على يوتيوب

> **الحلقة الأولى نُشرت بهذه الوصفة نفسها:** [He Tried to Speedrun a Tree 🌱 | Sam & Layla Ep. 1](https://youtu.be/max4KYAPTv0)
> (`https://youtu.be/max4KYAPTv0`، قناة **Decreeface**، عامّة، مع ترجمة إنجليزية، يوم 2026-10-24). المرجع: `films/film1/youtube.json` و`films/film1/published.json`.
> قائمة كل الحلقات المنشورة: `films/EPISODES.md`.

الأداة: `tools/publish/youtube.py`، بمكتبة بايثون القياسية فقط، فلا تحتاج أيّ حزمة إضافية. تعمل بعميل OAuth يملكه صاحب القناة في Google Cloud،
لذلك لها حصّتها اليومية الخاصة ولا تتقاسمها مع أحد.

## الخلاصة: 4 أوامر
```bash
python tools/publish/youtube.py auth                         # 1) يطبع رابط السماح، يفتحه صاحب القناة
python tools/publish/youtube.py auth '<الرابط الذي وصل إليه>'  # 2) خلال 10 دقائق، والرمز يُستعمل مرّة واحدة
python tools/publish/youtube.py upload films/<slug> --dry-run # 3) يفحص youtube.json والملفات والقناة بلا رفع
python tools/publish/youtube.py upload films/<slug>           # 4) رفع ← ترجمة ← صورة مصغّرة ← published.json
```
ثم أضف سطر الحلقة إلى `films/EPISODES.md`، وارفع `published.json` في commit.

## 0. الأسرار خارج المستودع (المستودع عامّ!)
| الملف | من أين | أين يوضع |
|---|---|---|
| `client_secret.json` | Google Cloud ← Google Auth Platform ← Clients ← تنزيل JSON (يعطيك إيّاه المالك) | `~/.config/create/youtube/` |
| `token.json` | يكتبه `youtube.py auth` | المجلد نفسه (صلاحية 600) |

غيّر المجلد بمتغيّر البيئة `YT_SECRETS_DIR`. **لا ترفع هذين الملفّين أبداً**، ولا تطبعهما ولا تلصقهما في محادثة (`.gitignore` يمنعهما احتياطاً).

## 1. إعداد Google Cloud، مرّة واحدة لكل قناة (منجز لقناتنا)
هذا الإعداد تمّ لقناة Decreeface. أعِده فقط لقناة جديدة، أو إن ضاع العميل:
1. **مشروع:** console.cloud.google.com ← Select project ← New project.
2. **تفعيل الـ API:** APIs & Services ← Library ← **YouTube Data API v3** ← Enable. إذا ظهر زر **Manage** فهو مفعّل أصلاً.
3. **Google Auth Platform ← Branding:** اسم التطبيق، وبريد الدعم، وبريد المطوّر.
4. **Audience:** نوع المستخدم External، والحالة **Testing**.
   - أضف بريد **حساب Google المالك للقناة** في **Test users** ← Add users ← Save.
   - زر **Publish app** قد يكون رمادياً ما دامت صفحة Branding ناقصة. **لا تحتاجه:** المستخدم التجريبي يكفي.
5. **Clients ← Create client ← Web application:**
   - في Authorized redirect URIs أضف بالضبط `https://developers.google.com/oauthplayground`.
   - نزّل ملف JSON واحفظه باسم `client_secret.json` في مجلد الأسرار.
   - عميل Desktop يعمل أيضاً: الأداة تستعمل معه `http://localhost`. الصفحة لن تفتح، لكن الرابط في شريط العنوان يحمل الرمز.

## 2. الربط (`auth`): أوّل مرّة، ثم كل ~7 أيام
تطبيقات Testing تعطي رمز تحديث صالحاً 7 أيام فقط. إذا ظهر `invalid_grant` عند الرفع فأعِد الربط:
1. `python tools/publish/youtube.py auth`: يطبع رابطاً. أرسله للمالك إن لم تكن تملك متصفّحاً بحسابه.
2. يفتحه المالك ويختار **حساب القناة نفسه**. عنده حسابات Google كثيرة، والاختيار الخاطئ يعطي `access_denied`.
3. تظهر رسالة «Google hasn't verified this app» ← **Advanced** ← **Go to <app> (unsafe)** ← Continue. إن ظهر مربّع صلاحية YouTube فيفعّله، ثم يختار القناة إن سُئل.
4. يصل إلى صفحة OAuth Playground. **لا يضغط شيئاً فيها**، بل ينسخ **الرابط كاملاً** من شريط العنوان (فيه `code=`) ويرسله.
5. `python tools/publish/youtube.py auth '<الرابط>'` فوراً، فالرمز يموت بعد ~10 دقائق.
   - تقبل الأداة الرابط كما يأتي من Slack، بما فيه `&amp;` و`<…|…>`، وتطبع القناة التي يستطيع الرمز النشر عليها.

## 3. تجهيز الحلقة: `films/<slug>/youtube.json`
انسخ `films/film1/youtube.json` وعدّله. المسارات فيه نسبية إلى جذر المستودع.
| الحقل | المعنى |
|---|---|
| `channel_id` | قناة الهدف. الأداة **ترفض** الرفع إن كان الرمز لقناة أخرى. قناتنا: `UCF5ZcuTkK3McKDMUv3ksdaw` |
| `video` | الـ MP4 النهائي، مثل `out/<slug>/<slug>.mp4` (مجلد `out/` غير مرفوع، ابنِه أولاً) |
| `captions` / `captions_name` | ملف SRT واسم المسار (`English`) |
| `thumbnail` | PNG/JPG بمقاس 1280×720 وحجم **≤ 2 MB**. ارفعه في `films/<slug>/` |
| `title` | ≤ 100 حرف (الأفضل ≤ 60)، بلا `<` أو `>` |
| `description` (أو `description_file`) | ≤ 5000 بايت. الفصول: أوّلها `0:00`، و3 فصول على الأقل، وكل فصل ≥ 10 ث |
| `tags` | مجموعها ≤ 500 حرف |
| `category_id` | `1` = Film & Animation |
| `language` | `en` |
| `privacy` | `public` أو `unlisted` أو `private` (مع `publish_at` بصيغة ISO للجدولة، ويلزمها `private`) |
| `made_for_kids` / `synthetic_media` | **قرار المالك.** اتركهما `null` ما لم يقل المالك صراحة، ثم يضبطهما هو في Studio أو بأمر `set` |
| `playlist_id` | قائمة تشغيل للسلسلة (اختياري) |

## 4. الرفع
- ابدأ بـ `--dry-run` دائماً: يفحص الحقول والملفات والحجم، ويتأكّد أن الرمز يملك القناة، وأن الحلقة لم تُرفع من قبل.
- ثم `upload` بلا خيارات. الأداة تفعل بالترتيب:
  1. تتحقّق من القناة.
  2. تمنع التكرار: إن وُجد `published.json`، أو فيديو بنفس العنوان على القناة، تتخطّى الرفع.
  3. ترفع بأجزاء 16MB قابلة للاستئناف: إن انقطع الرفع فأعِد الأمر نفسه ليكمل من حيث توقّف.
  4. تكتب `published.json` **قبل** الإضافات، حتى لا يتكرّر الرفع بعد عطل.
  5. تضيف الترجمة، ثم الصورة المصغّرة، ثم قائمة التشغيل، ثم تطبع الحالة.
- الرفع على الإنترنت العادي ~7 MB/ث: فيلم 400MB يأخذ نحو دقيقة ونصف. بعده يعالج يوتيوب الفيديو بضع دقائق، ويتحقّق من ذلك أمر `status`.
- إصلاح جزئي بلا رفع جديد: `thumbnail` و`captions` و`set --kids no --ai no --privacy public`.

## 5. بعد الرفع: التسليم
1. `status films/<slug>`: يجب أن ترى `processing: succeeded` و`privacyStatus: public` ومسار الترجمة `serving`.
2. أضف سطراً إلى `films/EPISODES.md` وارفع `published.json` وأيّ تعديل على `youtube.json`.
3. أرسل للمالك الرابط وما نجح وما لم ينجح، وذكّره بما في Studio فقط:
   - Audience والإفصاح عن المحتوى المعدَّل أو الاصطناعي، إن تُركا `null`.
   - شاشة النهاية.
   - التعليق المثبّت: الـ API لا يثبّت التعليقات.

## 6. الأخطاء وحلولها
| ما يظهر | السبب | الحلّ |
|---|---|---|
| `access_denied` / «developer hasn't given you access» | الحساب ليس Test user، أو اختير حساب آخر | أضِف بريد حساب القناة في Audience ← Test users، وأعِد فتح الرابط واختر الحساب الصحيح |
| `redirect_uri_mismatch` | عنوان Playground غير مضاف للعميل | أضِفه في Clients، وانتظر دقائق |
| `invalid_grant` | رمز مستعمل أو تجاوز 10 دقائق، أو انتهت مدّة الـ 7 أيام | `auth` من جديد |
| `accessNotConfigured` / `SERVICE_DISABLED` | YouTube Data API v3 غير مفعّل | فعّله (الخطوة 1.2) |
| `ABORT: … does not own channel` | الرمز لحساب بلا القناة | `auth` من جديد بحساب القناة |
| `thumbnails.set 403` | القناة غير موثّقة بالهاتف | المالك يفتح youtube.com/verify، ثم `youtube.py thumbnail films/<slug>` |
| `quotaExceeded` / 429 «Video Uploads per day» | انتهت الحصّة اليومية | تتجدّد عند منتصف الليل بتوقيت المحيط الهادئ (07:00 أو 08:00 UTC) |

**الحصّة:** لكل مشروع حصّة يومية (10,000 وحدة افتراضياً، والرفع من أغلى العمليات)، وحدّ منفصل لعدد الرفعات «Video Uploads per day». لا تُعِد المحاولة في اليوم نفسه بعد خطأ الحصّة.

**الخصوصية:** توثيق `videos.insert` (راجعناه في 2026-10-24) يقول إن رفع المشاريع غير المُراجَعة لم يعد يُقيَّد بالوضع الخاص، والحلقة الأولى نُشرت عامّة فعلاً.
إن وجدت فيديو مقفلاً على Private رغم `privacy: public`، فالحلّ نموذج تدقيق الـ API عند Google، ولا يحلّه تغيير الأداة.

## ملاحظة لوكلاء Viktor
تكامل YouTube المدمج في Viktor (Composio) يستطيع الرفع أيضاً، لكنه يتقاسم حصّة مشروع واحد مع الجميع.
في 2026-10-24 فشل مرّتين بالخطأ 429 «Video Uploads per day»، فاستعمل هذه الأداة أوّلاً. يبقى التكامل مفيداً للقراءة: الإحصاءات والتعليقات وقوائم التشغيل.
