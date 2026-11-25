'use client'
import { ResourceManager } from '@/components/admin/resource-manager'
export default function Page() {
  return <ResourceManager collection="doctors" title="الأطباء" desc="إدارة فريق العيادة وترتيب ظهوره في الموقع." singular="طبيب" storageFolder="doctors"
    titleKey="name" subtitleKey="specialty" imageKey="imageUrl" orderable
    defaults={{ name: '', specialty: '', qualifications: '', experienceYears: 0, bio: '', imageUrl: '', visible: true }}
    fields={[
      { key: 'name', label: 'الاسم', type: 'text', required: true }, { key: 'specialty', label: 'التخصص', type: 'text', required: true },
      { key: 'qualifications', label: 'المؤهلات', type: 'text' }, { key: 'experienceYears', label: 'سنوات الخبرة', type: 'number' },
      { key: 'bio', label: 'النبذة التعريفية', type: 'textarea' }, { key: 'imageUrl', label: 'صورة الطبيب', type: 'image', pathKey: 'imagePath' },
      { key: 'visible', label: 'الظهور', type: 'boolean', hint: 'إظهار الطبيب في الموقع' },
    ]} />
}
