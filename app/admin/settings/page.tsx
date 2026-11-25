'use client'
import { SingletonForm } from '@/components/admin/singleton-form'
import { defaultSettings } from '@/lib/types/defaults'
import type { SiteSettings } from '@/lib/types'

const groups = [
  { title: 'SEO والمشاركة', fields: [
    { key: 'seoTitle', label: 'عنوان الموقع', type: 'text' as const }, { key: 'seoDescription', label: 'وصف الموقع', type: 'textarea' as const },
    { key: 'ogImageUrl', label: 'صورة المشاركة الاجتماعية', type: 'image' as const }] },
  { title: 'إظهار الأقسام', fields: [{ key: 'sections', label: 'الأقسام الظاهرة في الموقع', type: 'toggles' as const, options: [
    { key: 'about', label: 'عن العيادة' }, { key: 'features', label: 'المميزات' }, { key: 'team', label: 'الأطباء' }, { key: 'services', label: 'الخدمات' },
    { key: 'packages', label: 'الباقات' }, { key: 'testimonials', label: 'آراء العملاء' }, { key: 'gallery', label: 'المعرض' }, { key: 'payments', label: 'طرق الدفع' },
    { key: 'faq', label: 'الأسئلة الشائعة' }, { key: 'hours', label: 'مواعيد العمل' }, { key: 'contact', label: 'التواصل' }] }] },
]
export default function Page() {
  return <SingletonForm<SiteSettings> doc="settings" title="إعدادات الموقع" desc="SEO وإظهار الأقسام. الموقع حالياً بالعربية فقط." defaults={defaultSettings} groups={groups} folder="site" />
}
