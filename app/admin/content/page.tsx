'use client'
import { SingletonForm, type SField } from '@/components/admin/singleton-form'
import { defaultContent } from '@/lib/types/defaults'
import type { SiteContent } from '@/lib/types'

const T = (key: string, label: string, extra: Partial<SField> = {}): SField => ({ key, label, type: 'text', ...extra })
const A = (key: string, label: string, extra: Partial<SField> = {}): SField => ({ key, label, type: 'textarea', ...extra })
const TT: [string, string] = ['title', 'text']

const groups = [
  { title: 'الهوية', fields: [T('clinicName', 'اسم العيادة'), { key: 'logoUrl', label: 'الشعار', type: 'image' as const }] },
  { title: 'الصفحة الرئيسية (Hero)', fields: [
    T('heroKicker', 'العبارة الصغيرة فوق العنوان'), T('heroTitle', 'العنوان الرئيسي'), A('heroSubtitle', 'النص التسويقي أسفل العنوان'),
    T('marketingText', 'شريط الإعلان العلوي (اتركه فارغاً لإخفائه)'), T('heroNote', 'الجملة أسفل الأزرار'),
    { key: 'heroImageUrl', label: 'صورة الـ Hero (إن تُركت فارغة تُستخدم الصورة الافتراضية)', type: 'image' as const },
    T('heroBadgeTitle', 'عنوان الشارة على الصورة'), T('heroBadgeText', 'نص الشارة على الصورة')] },
  { title: 'شريط المبادئ', fields: [
    { key: 'trustItems', label: 'العناصر', type: 'pairs' as const, pair: TT, hint: 'سطر لكل عنصر: العنوان | الوصف' }, T('trustCtaLabel', 'نص الزر')] },
  { title: 'عن العيادة', fields: [
    A('about', 'نبذة عن العيادة'), T('aboutCtaLabel', 'نص زر النبذة'),
    { key: 'valueItems', label: 'القيم', type: 'pairs' as const, pair: TT, hint: 'سطر لكل قيمة: العنوان | الوصف' },
    A('vision', 'الرؤية'), A('mission', 'الرسالة'), { key: 'features', label: 'مميزات العيادة', type: 'lines' as const, hint: 'سطر لكل ميزة' }] },
  { title: 'التواصل', fields: [
    T('phone', 'رقم الهاتف', { ltr: true }), T('whatsapp', 'رقم واتساب (مع كود الدولة)', { ltr: true }), T('email', 'البريد الإلكتروني', { ltr: true }),
    T('instagram', 'رابط Instagram', { ltr: true, url: true }), T('facebook', 'رابط Facebook', { ltr: true, url: true }), T('tiktok', 'رابط TikTok', { ltr: true, url: true })] },
  { title: 'الموقع والمواعيد والدفع', fields: [
    A('address', 'عنوان العيادة'), T('mapUrl', 'رابط Google Maps', { ltr: true, url: true }),
    { key: 'workingHours', label: 'مواعيد العمل', type: 'pairs' as const, hint: 'سطر لكل فترة: السبت - الخميس | 10 ص - 9 م' },
    { key: 'paymentMethods', label: 'طرق الدفع', type: 'lines' as const, hint: 'سطر لكل طريقة' }] },
  { title: 'الحجز والتذييل', fields: [
    T('bookingSideNote', 'عبارة قسم الحجز'), T('footerTagline', 'جملة التذييل'), T('footerDisclaimer', 'تنويه التذييل')] },
  { title: 'سياسة الخصوصية (صفحة /privacy)', fields: [A('privacyText', 'النص (افصل الفقرات بسطر فارغ). راجعه مع مختص قانوني قبل الاعتماد.')] },
]
export default function Page() {
  return <SingletonForm<SiteContent> doc="content" title="محتوى الموقع" desc="النصوص والصور ومعلومات التواصل التي تظهر في الموقع." defaults={defaultContent} groups={groups} folder="site" />
}
