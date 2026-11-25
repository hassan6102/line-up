'use client'
import { ResourceManager } from '@/components/admin/resource-manager'
export default function Page() {
  return <ResourceManager collection="faqs" title="الأسئلة الشائعة" desc="إدارة الأسئلة والإجابات وترتيبها." singular="سؤال" storageFolder="faqs"
    titleKey="question" subtitleKey="answer" orderable
    defaults={{ question: '', answer: '', visible: true }}
    fields={[
      { key: 'question', label: 'السؤال', type: 'text', required: true }, { key: 'answer', label: 'الإجابة', type: 'textarea', required: true },
      { key: 'visible', label: 'الظهور', type: 'boolean', hint: 'إظهار السؤال' },
    ]} />
}
