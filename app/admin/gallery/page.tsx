'use client'
import { ResourceManager } from '@/components/admin/resource-manager'
export default function Page() {
  return <ResourceManager collection="gallery" title="معرض الصور" desc="رفع الصور وتصنيفها وترتيبها." singular="صورة" storageFolder="gallery"
    titleKey="caption" subtitleKey="category" imageKey="imageUrl" orderable
    defaults={{ imageUrl: '', caption: '', category: 'العيادة', visible: true }}
    fields={[
      { key: 'imageUrl', label: 'الصورة', type: 'image', pathKey: 'imagePath', required: true }, { key: 'caption', label: 'الوصف', type: 'text', required: true },
      { key: 'category', label: 'التصنيف', type: 'select', options: ['العيادة', 'الأجهزة', 'الجلسات', 'الفريق'] },
      { key: 'visible', label: 'الظهور', type: 'boolean', hint: 'إظهار الصورة' },
    ]} />
}
