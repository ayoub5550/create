---
name: youtube-publish
description: Publish a finished, owner-approved film to the channel's YouTube (Decreeface) with tools/publish/youtube.py — owner's own OAuth client, consent link + paste-back code, youtube.json metadata, resumable upload, captions, thumbnail, published.json, EPISODES.md. Use when asked to upload, publish or post an episode to YouTube, or to fix a published video's thumbnail, captions or status. Keywords: نشر، رفع، يوتيوب، حلقة، قناة، صورة مصغّرة، ترجمة.
---

# النشر على يوتيوب

الوصفة الكاملة: `docs/recipe/09-publish-youtube.md`. اقرأها قبل أوّل رفع. هذه المهارة هي الخلاصة وقائمة الفحص.

## متى
- بعد أن **يشاهد المالك النسخة النهائية ويوافق** فقط. لا رفع قبل الموافقة.
- لإصلاح فيديو منشور: الصورة المصغّرة، أو الترجمة، أو الخصوصية، أو Audience.

## الخطوات
1. **الأسرار:** يجب أن يوجد `~/.config/create/youtube/client_secret.json` (أو المجلد في `YT_SECRETS_DIR`).
   إن لم يوجد فاطلبه من المالك، ولا تضعه في المستودع أبداً.
2. **الرمز:** شغّل `python tools/publish/youtube.py whoami`.
   - إذا ظهر `No token` أو `invalid_grant`: شغّل `python tools/publish/youtube.py auth` وأرسل الرابط للمالك.
   - المالك يختار حساب القناة، ثم Advanced، ثم Go to … (unsafe)، ثم Allow، ثم يرسل لك رابط صفحة Playground كاملاً.
   - شغّل `python tools/publish/youtube.py auth '<الرابط>'` فوراً (أقلّ من 10 دقائق).
3. **البيانات:** انسخ `films/film1/youtube.json` إلى `films/<slug>/youtube.json` وعدّل العنوان والوصف (مع الفصول) والوسوم والمسارات.
   اترك `made_for_kids` و`synthetic_media` بقيمة `null` ما لم يقرّر المالك.
4. **الفحص:** `python tools/publish/youtube.py upload films/<slug> --dry-run`.
5. **الرفع:** `python tools/publish/youtube.py upload films/<slug>`. إن انقطع فأعِد الأمر نفسه ليستأنف.
6. **التحقّق:** `python tools/publish/youtube.py status films/<slug>`. المطلوب: `processing: succeeded`، و`public`، والترجمة `serving`.
7. **التوثيق:** أضف سطراً في `films/EPISODES.md`، ثم commit لـ `films/<slug>/published.json`.
8. **التسليم:** أرسل الرابط للمالك، مع ما نجح وما فشل وما بقي له في Studio: Audience، والإفصاح، وشاشة النهاية، والتعليق المثبّت.

## قائمة الفحص
- [ ] `channel_id` = `UCF5ZcuTkK3McKDMUv3ksdaw` (Decreeface)، والأداة ترفض غيره.
- [ ] العنوان ≤ 100 حرف بلا `<>`، والوصف يبدأ فصوله بـ `0:00`، والوسوم ≤ 500 حرف.
- [ ] الصورة المصغّرة 1280×720 وحجمها ≤ 2 MB، والترجمة SRT بالإنجليزية.
- [ ] لا أسرار في `git status`.
- [ ] `published.json` و`EPISODES.md` في الـ commit.

## مطبّات معروفة
- `access_denied`: الحساب ليس Test user، أو اختير حساب آخر غير حساب القناة.
- `thumbnails.set 403`: القناة غير موثّقة بالهاتف. المالك يفتح youtube.com/verify، ثم شغّل `youtube.py thumbnail films/<slug>`.
- خطأ 429 أو `quotaExceeded`: انتظر منتصف الليل بتوقيت المحيط الهادئ. تكامل YouTube المشترك في Viktor يصطدم بهذا كثيراً، فهذه الأداة أوّلاً.
