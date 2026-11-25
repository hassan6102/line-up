# دليل إعداد وتشغيل واختبار ونشر Line Up

## 1) إعداد Firebase
1. من https://console.firebase.google.com أنشئ مشروعاً.
2. **Authentication > Get started** وفعّل **Email/Password**.
3. **Firestore Database > Create database** (Production mode).
4. **Storage > Get started** (قد يتطلب خطة Blaze حسب سياسة Firebase الحالية).
5. **Project settings > General > Your apps > Web (</>)**: سجّل تطبيقاً وانسخ القيم.

## 2) متغيرات البيئة
```bash
cp .env.example .env.local
```
| المتغير | مطلوب | ملاحظة |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` / `AUTH_DOMAIN` / `PROJECT_ID` / `STORAGE_BUCKET` / `MESSAGING_SENDER_ID` / `APP_ID` | نعم | من إعدادات تطبيق الويب |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | موصى به | مفتاح reCAPTCHA v3 لـ App Check (البند 5) |
| `NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN` | للتطوير فقط | لا تضعه في الإنتاج |

مفاتيح الويب ليست أسراراً؛ الحماية الفعلية من القواعد وApp Check. لا ترفع `.env.local` ولا `serviceAccountKey.json` إلى Git (مستثنيان في `.gitignore`).

## 3) إنشاء أول حساب Admin
1. Authentication > Users > **Add user** (بريد + كلمة مرور قوية).
2. Project settings > Service accounts > **Generate new private key** واحفظه كـ `serviceAccountKey.json` في الجذر.
3. شغّل:
```bash
pnpm install
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/set-admin.mjs admin@example.com
```
4. احذف ملف المفتاح، ثم سجّل الدخول من `/admin/login`. إن ظهرت «لا يملك صلاحية» فسجّل الخروج وادخل مجدداً بعد تشغيل السكربت.

## 4) نشر قواعد Firestore و Storage
```bash
firebase login && firebase use --add
firebase deploy --only firestore:rules,storage
```
ما تفرضه القواعد:
- **الزوار:** يقرؤون العناصر المنشورة فقط (`visible == true`) والتقييمات المعتمدة والظاهرة فقط. العناصر المخفية **محجوبة على مستوى الخادم**.
  لذلك يجب أن تحتوي استعلامات الزوار على نفس الشرط (مطبّق في `listPublic`).
- **المدير (claim `admin`):** كل الكتابة، مع تحقق من الحقول المسموحة والأنواع والأطوال وصيغة الروابط (`https://`) حتى لو كان المدير نفسه.
- **الحجوزات:** الزائر ينشئ فقط، بحقول محددة، وحالة `new`، ووقت من الخادم، وخدمة منشورة موجودة وعنوانها مطابق، ورقم بصيغة E.164.
  والمدير فقط يقرأ ويغيّر `status` ويحذف.
- **حد الإرسال:** حجز واحد لكل رقم هاتف كل 10 دقائق (مستند `rateLimits/{phone}` يُكتب في نفس الدفعة). مستندات `rateLimits` صغيرة؛ يمكن حذفها دورياً من Console.
- **Storage:** قراءة عامة، رفع للمدير فقط في مجلدات محددة، أسماء ملفات مولّدة، `webp/png/jpg` فقط، أقل من 5MB، ولا يُستبدل ملف موجود.

## 5) App Check (موصى به ضد الإرسال الآلي)
قواعد Firestore وحدها لا تمنع روبوتاً يستخدم أرقام هواتف مختلفة؛ App Check يتحقق أن الطلب يأتي من موقعك.
1. https://www.google.com/recaptcha/admin: أنشئ مفتاح **reCAPTCHA v3** لنطاق موقعك (وlocalhost للتجربة).
2. Firebase Console > **App Check** > تطبيق الويب > **reCAPTCHA** وأدخل **Secret key**.
3. ضع **Site key** في `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`. للتطوير المحلي: أنشئ Debug token من Console وضعه في `NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN`.
4. راقب الطلبات في App Check > APIs، ثم فعّل **Enforce** لـ Firestore وStorage بعد التأكد.
> تنبيه: عند تفعيل Enforce على Firestore ستُرفض قراءة REST من الخادم لإعدادات SEO (لا تحمل App Check token)، فيعود الموقع لقيم SEO الافتراضية.
> إن كان SEO المخصص مهماً فاترك Firestore في وضع المراقبة وفعّل Enforce على Storage فقط، أو انقل SEO إلى متغيرات البيئة.

## 6) التشغيل والاختبار
```bash
pnpm install        # يحدّث pnpm-lock.yaml (انظر البند 8)
pnpm dev            # http://localhost:3000 ، اللوحة /admin
pnpm typecheck      # tsc --noEmit
pnpm lint           # ESLint
pnpm test           # اختبارات الوحدات (هاتف، صور، SEO، تحقق الحجز)
pnpm test:rules     # اختبارات القواعد على Firebase Emulator (Java + firebase-tools)
pnpm build
```

## 7) النشر (Vercel)
ارفع إلى GitHub، استورد في Vercel، أضف متغيرات البيئة، ثم Deploy. أضف نطاقك في Authentication > Settings > **Authorized domains**.

## 8) ملف القفل pnpm-lock.yaml
الملف المرفق قديم (لا يحتوي firebase وeslint وغيرها). شغّل **مرة واحدة** `pnpm install` عندك ثم ارفع الملف المحدّث.
إن استخدمت Vercel قبل ذلك فاجعل Install Command: `pnpm install --no-frozen-lockfile`.

## 9) الإدارة اليومية
- **محتوى الموقع:** الهوية، الـ Hero وصورته، شريط المبادئ، النبذة والقيم، التواصل، المواعيد، الدفع، سياسة الخصوصية (`/privacy`).
- **الإعدادات:** SEO (عنوان/وصف/صورة مشاركة تُطبَّق في HTML من الخادم وتتحدث خلال ~5 دقائق) وإظهار الأقسام.
- **الصور:** تُفحص (التوقيع الفعلي للملف) وتُصغَّر لأقصى 1600px وتُحوَّل WebP قبل الرفع. القديمة تُحذف فقط بعد نجاح الحفظ.
- **الترتيب:** أسهم أعلى/أسفل؛ يُعاد الترقيم تلقائياً بعد الحذف.
- الموقع بالعربية فقط حالياً.
