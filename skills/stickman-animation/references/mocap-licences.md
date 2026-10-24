# تراخيص بيانات الحركة (mocap): ما يُسمح وما يُمنع

مرجع للمهارة `stickman-animation`. المستودع MIT ومخرجاته قد تُستعمل تجارياً، فلا نقبل إلا بيانات تجارية الاستعمال.
هذا ملخّص عملي وليس استشارة قانونية؛ عند الشكّ لا تستعمل، وسجّل كل مصدر في `THIRD_PARTY.md`.

## قائمة المسموح (ALLOW)
| المصدر | ما فيه | الترخيص | الشرط |
|---|---|---|---|
| **CMU Graphics Lab Motion Capture** | آلاف المقاطع؛ **الموضوعان 18 و19** مقاطع لشخصين يتفاعلان ويتحادثان (الطرف أ والطرف ب لنفس اللقطات): «حديث وشرح بالإيماءات»، حديث مع مشي، قيادة شخص من ذراعه. يُضاف مواضيع تمثيل إيمائي أخرى (تحقّق منها في صفحة البحث). | مجاني لأيّ استعمال | سطر شكر للمختبر |
| **100STYLE** | 100 نمط مشي وتنقّل (متكبّر، متسلّل، عجوز…) بصيغة BVH | CC BY 4.0 | إسناد إلزامي |

استعمال مقترح: CMU 18/19 أساساً لأذرع المتحاورين؛ 100STYLE لمشيات الشخصيات المميّزة.

## قائمة المنع (BLOCK)
| المصدر | السبب |
|---|---|
| **Bandai Namco Research Motion Dataset** | CC BY-NC-SA 4.0: غير تجاري. للأفكار فقط (مشاهدة)، لا بيانات. |
| **ZeroEGGS (Ubisoft)** | ترخيص غير تجاري ومن دون اشتقاق. |
| **LAFAN1 (Ubisoft)** | CC BY-NC-ND 4.0: غير تجاري ومن دون اشتقاق. |
| **BEAT / BEAT2 (EMAGE)** | غير تجاري، للبحث فقط. |
| **Motion-X** | CC BY-NC-SA 4.0: غير تجاري. |
| **مخرجات مشتقّة من AMASS / HumanML3D** | البيانات ترث شروط AMASS غير التجارية؛ ومخرجات نماذج مدرّبة عليها (MDM، MoMask) وضعها القانوني غير محسوم. إن استُعملت يوماً فوسمها `"license_risk":"NC-upstream"` ولا تدخل المستودع. |
| **ملفات Mixamo** | شروط Adobe تمنع إعادة توزيع الملفات الخام وأيّ استعمال في الذكاء الاصطناعي/التعلّم الآلي. لا تُرفع إلى المستودع أبداً. |

## قواعد العمل
1. قبل `tools/mocap/fetch.py` لأيّ مصدر جديد: أين الترخيص؟ هل يسمح بالتجاري؟ هل يسمح بالاشتقاق؟ ما الإسناد؟
2. لا تخلط مقطعاً ممنوعاً حتى «للاختبار» في مشروع قد يُنشر.
3. الكود مفتوح المصدر شيء والبيانات أو الأوزان شيء آخر: كود MIT لنموذج مدرّب على بيانات غير تجارية لا يجعل مخرجاته تجارية.
4. مصادر غير مذكورة هنا (AIST++، HY-Motion، Kimodo…) = غير محسومة؛ اسأل قبل الاستعمال.
5. الإيماءات الحوارية التجارية الآمنة نادرة، فاجعل الإيماءات **إجرائية** (`Talk.GESTURES`) فوق أساس CMU.

## مصادر
- http://mocap.cs.cmu.edu/
- http://mocap.cs.cmu.edu/search.php?subjectnumber=18
- https://zenodo.org/records/8127870
- https://ianxmason.github.io/100style/
- https://github.com/BandaiNamcoResearchInc/Bandai-Namco-Research-Motiondataset
- https://github.com/ubisoft/ubisoft-laforge-ZeroEGGS/blob/main/License.md
- https://github.com/ubisoft/ubisoft-laforge-animation-dataset/blob/master/license.txt
- https://www.emergentmind.com/topics/beat2-dataset
- https://pantomatrix.github.io/EMAGE/
- https://motion-x-dataset.github.io/static/license/Motion-X%20License.pdf
- https://github.com/EricGuo5513/HumanML3D
- https://uthana.com/resources/human-motion-datasets
- https://wwwimages2.adobe.com/content/dam/cc/en/legal/servicetou/Mixamo-Addl-Terms-en_US-20210623.pdf
- https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html
