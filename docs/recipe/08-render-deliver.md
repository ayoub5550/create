# 08 · التصدير والتحقّق والتسليم

```bash
cd <film_dir>/proj && npx hyperframes@0.8.190 lint     # 0 errors (التحذيرات مقبولة)
bash tools/render/render.sh <film_dir>/proj out/film.mp4 6
python tools/render/verify.py out/film.mp4 --expect 60 --tile check.png
python tools/voice/captions.py tts.json starts.json out/film.srt
```
- التصدير ثقيل على المعالج: 60 ث بدقّة 1080p تستغرق نحو 23 ث على 8 أنوية، وأكثر بكثير على حاسوب صغير.
  استعمل آلة كبيرة إن توفّرت (`--workers` = عدد الأنوية - 2).
- **انظر إلى `check.png`**: التصدير قد يختلف عن المتصفّح (الخطوط، الفلاتر، الشفافية).
- الاسم النهائي وصفيّ: `albidhra_seed_ar.mp4`، `whiteboard_sky_ar.mp4`.

## رسالة التسليم (نموذج)
1. الفيلم (MP4) + الترجمة (SRT).
2. سطر القصة، والشكل والمقام والصوت التي اخترتها.
3. ما الجديد مقارنة بالنسخة السابقة (إن وُجدت).
4. العيوب المعروفة بصدق (ما بقي من P2).
5. عرضان للخطوة التالية (نسخة 9:16، قصّة من اختيار المستخدم، لغة أخرى…).

بعد موافقة المالك: النشر على يوتيوب ← `09-publish-youtube.md`.
