// قراءة إعدادات SEO على الخادم (وقت الطلب/إعادة التحقق) عبر Firestore REST بدون SDK،
// فتظهر في HTML الذي تراه محركات البحث وروابط المشاركة. المسار site/settings مقروء علناً في القواعد.
import { defaultSettings } from '@/lib/types/defaults'
import type { SiteSettings } from '@/lib/types'

type FsValue = { stringValue?: string; booleanValue?: boolean; integerValue?: string; mapValue?: { fields?: Record<string, FsValue> } }

export function parseFsValue(v: FsValue): unknown {
  if (v.stringValue !== undefined) return v.stringValue
  if (v.booleanValue !== undefined) return v.booleanValue
  if (v.integerValue !== undefined) return Number(v.integerValue)
  if (v.mapValue) return Object.fromEntries(Object.entries(v.mapValue.fields ?? {}).map(([k, x]) => [k, parseFsValue(x)]))
  return undefined
}
export function parseSettingsDoc(doc: { fields?: Record<string, FsValue> } | null | undefined): SiteSettings {
  const f = Object.fromEntries(Object.entries(doc?.fields ?? {}).map(([k, v]) => [k, parseFsValue(v)])) as Partial<SiteSettings>
  const str = (x: unknown, fb: string) => (typeof x === 'string' && x.trim() ? x : fb)
  return {
    seoTitle: str(f.seoTitle, defaultSettings.seoTitle), seoDescription: str(f.seoDescription, defaultSettings.seoDescription),
    ogImageUrl: typeof f.ogImageUrl === 'string' && f.ogImageUrl.startsWith('https://') ? f.ogImageUrl : '',
    sections: { ...defaultSettings.sections, ...(f.sections ?? {}) },
  }
}
export async function getSeoSettings(fetcher: typeof fetch = fetch): Promise<SiteSettings> {
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  if (!project) return defaultSettings
  try {
    const res = await fetcher(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/(default)/documents/site/settings`, { next: { revalidate: 300 } } as RequestInit)
    if (res.status === 404) return defaultSettings
    if (!res.ok) return defaultSettings
    return parseSettingsDoc(await res.json())
  } catch { return defaultSettings }
}
