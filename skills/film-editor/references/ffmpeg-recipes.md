# وصفات ffmpeg للمونتاج والتشطيب

مرجع للمهارة `film-editor`. شغّل من جذر المستودع. القاعدة: **الصورة تُقطع، والصوت يُبنى من خطّ الحوار الزمني** في مسار واحد.

## 1. ربط اللقطات بلا إعادة ترميز (concat demuxer)
كل المدخلات بنفس الترميز والحجم والمعدّل وقاعدة الزمن وتخطيط الصوت (أي نفس أوامر الريندر):
```bash
printf "file 'shot01.mp4'\nfile 'shot02.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4
```
قطعات حادّة فقط، على حدود الإطارات. أيّ اختلاف في الإعدادات ← استعمل مرشّح concat (يعيد الترميز):
```bash
ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" out.mp4
```

## 2. انتقال صورة (xfade)
```bash
ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=4.5[v]" -map "[v]" out.mp4
```
- `offset` = زمن بداية الانتقال في الناتج = مدّة الأولى − مدّة الانتقال. في السلاسل: `offset_n = مجموع المدد − n·d`.
- المعنى قبل الشكل: `fade`/`dissolve` لمرور الزمن، `fadeblack` لنهاية فصل، `circleclose`/`circleopen` لنبرة الكرتون.
  القائمة تختلف حسب إصدار ffmpeg؛ تحقّق بـ `ffmpeg -h filter=xfade`.

## 3. تداخل صوتي (acrossfade)
```bash
[0:a][1:a]acrossfade=d=0.5:c1=tri:c2=tri[a]        # كلام
[0:a][1:a]acrossfade=d=1.0:c1=qsin:c2=qsin[a]      # موسيقى (قدرة متساوية)
```

## 4. قطع J/L بمسار صوتي واحد (adelay + amix)
ضع كل سطر في زمنه المطلق (ميلي ثانية) مستقلاً عن قطعات الصورة:
```bash
ffmpeg -i music.wav -i l1.mp3 -i l2.mp3 -filter_complex "
[1:a]atrim=0:2.4,asetpts=PTS-STARTPTS,adelay=11700:all=1[l1];
[2:a]adelay=13950:all=1[l2];
[0:a]volume=0.25[mus];
[mus][l1][l2]amix=inputs=3:normalize=0:dropout_transition=0[mix]" -map "[mix]" mix.wav
```
- `normalize=0` ضروري (ffmpeg ≥ 4.4) وإلا انخفض كل مدخل بنسبة 1/N.
- قطع J = صوت السطر التالي يبدأ قبل قطع الصورة بـ 0.3–1 ث. قطع L = صوت الحالي يستمرّ بعد القطع.
- الأزمنة تأتي من `timeline.json` (start/end لكل سطر)، لا من قائمة اللقطات.

## 5. خفض الموسيقى تحت الكلام (sidechain ducking)
```bash
[voice]asplit=2[vmix][vkey];
[mus][vkey]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[duck];
[duck][vmix]amix=inputs=2:normalize=0[mix]
```
قاعدة عملية: release 250–400 ms حتى لا «تتنفّس» الموسيقى بين الكلمات.

## 6. توحيد الجهارة بمرحلتين (two-pass loudnorm)
للمنصّات: I=−14 LUFS وTP=−1 dBTP (للبثّ التلفزيوني −23).
```bash
ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null -
# اقرأ input_i, input_tp, input_lra, input_thresh, target_offset من JSON ثم:
ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=..:measured_TP=..:measured_LRA=..:measured_thresh=..:offset=..:linear=true -ar 48000 final.wav
```

## 7. تركيب الصوت النهائي على الصورة
```bash
ffmpeg -i video.mp4 -i final.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest film.mp4
```

## 8. التشطيب البصري (اختياري، بخفّة)
- **LUT:** `-vf lut3d=file=grade.cube:interp=tetrahedral`. ملف .cube نصّ عادي؛ ولّده بسكربت Python (دافئ، سيبيا…) فلا مشكلة ترخيص.
  بديل أرخص: `eq=contrast=1.05:saturation=0.9,colorbalance=rs=.05:bs=-.05`.
- **تظليل الحواف (vignette):** `vignette=angle=PI/5` (زاوية أصغر = أخفّ).
- **حبيبات (grain):** `noise=alls=8:allf=t+u` (بين 4 و12)، بعد أيّ تحجيم، ومع CRF أقلّ (16–18) لأن الحبيبات مكلفة في الترميز.
- لا تستعمل `minterpolate` على رسوم خطّية: يشوّه الأطراف الرفيعة.

## 9. مظهر «على اثنين» (on twos)
الأفضل في الكود: `t_q = Math.floor(t*15)/15` لجسم الشخصية (على اثنين عند 30 إطاراً/ث؛ `12` عند 24) مع كاميرا ناعمة.
بديل للإطار كله: `-vf "fps=15,fps=30"`.

## 10. ترميز التسليم
```bash
-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k -ar 48000
```
إزالة وسوم البيانات الوصفية للمحرّك: `ffmpeg -i in.mp4 -map_metadata -1 -c copy out.mp4`.

## 11. اختبار الحتمية
ريندر مرتين وقارن: `ffmpeg -i a.mp4 -f framemd5 -` (نفس الجهاز ونفس Chrome).

## مصادر
- https://ffmpeg.org/ffmpeg-filters.html
- https://trac.ffmpeg.org/wiki/Concatenate
