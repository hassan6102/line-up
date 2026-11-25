'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteProvider, useSite } from '@/components/site/site-provider'
import '../site-extra.css'

function Policy() {
  const { data, loading } = useSite()
  const paragraphs = data.content.privacyText.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean)
  return <main dir="rtl" className="svc-page" id="privacy">
    <Link href="/" className="svc-back"><ArrowRight size={16} /> العودة للموقع</Link>
    <article className="svc-article"><h1>سياسة الخصوصية</h1>
      {loading ? <div className="data-state"><span className="spinner" /> جارٍ التحميل…</div> : paragraphs.map((t, i) => <p className="svc-lead" key={i}>{t}</p>)}</article>
  </main>
}
export default function Page() { return <SiteProvider><Policy /></SiteProvider> }
