'use client'
import { ResourceManager } from '@/components/admin/resource-manager'
export default function Page() {
  return <ResourceManager collection="packages" title="الأسعار والباقات" desc="إدارة الباقات وأسعارها." singular="باقة" storageFolder="packages"
    titleKey="name" subtitleKey="description" orderable badges={[{ key: 'featured', label: 'مميزة' }]}
    defaults={{ name: '', sessions: 1, price: 0, oldPrice: 0, description: '', features: [], featured: false, visible: true }}
    fields={[
      { key: 'name', label: 'اسم الباقة', type: 'text', required: true }, { key: 'sessions', label: 'عدد الجلسات', type: 'number' },
      { key: 'price', label: 'السعر', type: 'number', required: true }, { key: 'oldPrice', label: 'السعر قبل الخصم (اختياري)', type: 'number' },
      { key: 'description', label: 'الوصف', type: 'textarea' }, { key: 'features', label: 'المميزات (سطر لكل ميزة)', type: 'lines' },
      { key: 'featured', label: 'باقة مميزة', type: 'boolean', hint: 'تمييز الباقة في الموقع' }, { key: 'visible', label: 'الظهور', type: 'boolean', hint: 'إظهار الباقة' },
    ]} />
}
