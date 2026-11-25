import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import './site-extra.css'
import { getSeoSettings } from '@/lib/services/seo-server'

// SEO ديناميكي من إعدادات لوحة التحكم (site/settings) مع قيم افتراضية عند التعذر
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSeoSettings()
  return {
    title: s.seoTitle, description: s.seoDescription,
    icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
    openGraph: { title: s.seoTitle, description: s.seoDescription, locale: 'ar_AR', type: 'website', ...(s.ogImageUrl ? { images: [{ url: s.ogImageUrl }] } : {}) },
    twitter: { card: s.ogImageUrl ? 'summary_large_image' : 'summary', title: s.seoTitle, description: s.seoDescription, ...(s.ogImageUrl ? { images: [s.ogImageUrl] } : {}) },
  }
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f8fafb', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
