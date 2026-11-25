# Line Up Physiotherapy Clinic
موقع عيادة علاج طبيعي (Next.js 16 + Tailwind 4) مع لوحة تحكم `/admin` على Firebase (Auth + Firestore + Storage).
الإعداد والاختبار والنشر: [docs/SETUP.md](docs/SETUP.md)

```
lib/firebase     تهيئة Firebase (+ App Check اختياري)
lib/services     طبقة البيانات (crud، حجوزات، تخزين، صور، مصادقة، SEO) بمعزل عن الواجهة
lib/utils        منطق نقي قابل للاختبار (تطبيع الهاتف، التحقق من الحجز)
lib/types        الأنواع والقيم الافتراضية
components/admin مكونات اللوحة     components/site  مكونات الموقع
firestore.rules / storage.rules    قواعد الأمان      tests/  اختبارات الوحدات والقواعد
```
