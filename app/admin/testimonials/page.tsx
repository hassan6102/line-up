'use client'
import { ResourceManager } from '@/components/admin/resource-manager'
export default function Page() {
  return <ResourceManager collection="testimonials" title="آراء العملاء" desc="لا يظهر أي تقييم في الموقع قبل اعتماده." singular="تقييم" storageFolder="testimonials"
    titleKey="name" subtitleKey="comment" imageKey="imageUrl" badges={[{ key: 'approved', label: 'معتمد' }]}
    defaults={{ name: '', rating: 5, comment: '', imageUrl: '', approved: false, visible: true }}
    fields={[
      { key: 'name', label: 'الاسم', type: 'text', required: true }, { key: 'rating', label: 'التقييم (1-5)', type: 'number' },
      { key: 'comment', label: 'التعليق', type: 'textarea', required: true }, { key: 'imageUrl', label: 'الصورة', type: 'image', pathKey: 'imagePath' },
      { key: 'approved', label: 'الموافقة', type: 'boolean', hint: 'اعتماد التقييم للنشر (بموافقة صاحبه)' }, { key: 'visible', label: 'الظهور', type: 'boolean', hint: 'إظهار التقييم' },
    ]} />
}
