'use client'
import { ResourceManager } from '@/components/admin/resource-manager'
export default function Page() {
  return <ResourceManager collection="services" title="الخدمات العلاجية" desc="إدارة الخدمات وتفاصيلها وحالة نشرها." singular="خدمة" storageFolder="services"
    titleKey="title" subtitleKey="description" imageKey="imageUrl" orderable
    defaults={{ title: '', description: '', details: '', imageUrl: '', visible: true }}
    fields={[
      { key: 'title', label: 'اسم الخدمة', type: 'text', required: true }, { key: 'description', label: 'وصف مختصر', type: 'textarea', required: true },
      { key: 'details', label: 'تفاصيل الخدمة (تظهر في صفحة الخدمة)', type: 'textarea' }, { key: 'imageUrl', label: 'صورة الخدمة', type: 'image', pathKey: 'imagePath' },
      { key: 'visible', label: 'حالة النشر', type: 'boolean', hint: 'منشورة' },
    ]} />
}
