import { where } from 'firebase/firestore'
import { getSingleton, listPublic } from './crud'
import { defaultContent, defaultSettings } from '@/lib/types/defaults'
import type { Doctor, Faq, GalleryItem, Package, Service, SiteContent, SiteSettings, Testimonial } from '@/lib/types'

export type SectionKey = 'content' | 'settings' | 'doctors' | 'services' | 'packages' | 'testimonials' | 'gallery' | 'faqs'
export type SiteData = {
  content: SiteContent; settings: SiteSettings
  doctors: Doctor[]; services: Service[]; packages: Package[]
  testimonials: Testimonial[]; gallery: GalleryItem[]; faqs: Faq[]
  /** أخطاء كل قسم على حدة؛ فشل قسم لا يُسقط بقية الموقع */
  errors: Partial<Record<SectionKey, string>>
}
export const emptySiteData: SiteData = { content: defaultContent, settings: defaultSettings, doctors: [], services: [], packages: [], testimonials: [], gallery: [], faqs: [], errors: {} }

const msg = (r: PromiseRejectedResult) => ((r.reason as { code?: string })?.code === 'permission-denied' ? 'تعذّر تحميل هذا القسم (صلاحيات).' : 'تعذّر تحميل هذا القسم. حاول مجدداً.')

export async function loadSiteData(): Promise<SiteData> {
  const keys: SectionKey[] = ['content', 'settings', 'doctors', 'services', 'packages', 'testimonials', 'gallery', 'faqs']
  const results = await Promise.allSettled([
    getSingleton('content', defaultContent), getSingleton('settings', defaultSettings),
    listPublic<Doctor>('doctors'), listPublic<Service>('services'), listPublic<Package>('packages'),
    listPublic<Testimonial & { order?: number }>('testimonials', [where('approved', '==', true)]),
    listPublic<GalleryItem>('gallery'), listPublic<Faq>('faqs'),
  ])
  const errors: SiteData['errors'] = {}
  const pick = <T,>(i: number, fallback: T): T => {
    const r = results[i]
    if (r.status === 'fulfilled') return r.value as T
    errors[keys[i]] = msg(r); return fallback
  }
  const settings = pick<SiteSettings>(1, defaultSettings)
  return {
    content: { ...defaultContent, ...pick<SiteContent>(0, defaultContent) },
    settings: { ...defaultSettings, ...settings, sections: { ...defaultSettings.sections, ...settings.sections } },
    doctors: pick(2, [] as Doctor[]), services: pick(3, [] as Service[]), packages: pick(4, [] as Package[]),
    testimonials: pick(5, [] as Testimonial[]), gallery: pick(6, [] as GalleryItem[]), faqs: pick(7, [] as Faq[]), errors,
  }
}
export const whatsappLink = (number: string, message: string) =>
  number ? `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}` : '#contact'
