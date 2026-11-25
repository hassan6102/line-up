'use client'
import { use } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteProvider, useSite } from '@/components/site/site-provider'
import { BookingForm } from '@/components/site/booking-form'
import '../../site-extra.css'

function Detail({ id }: { id: string }) {
  const { data, loading, error } = useSite()
  const s = data.services.find((x) => x.id === id)
  return <main dir="rtl" className="svc-page">
    <Link href="/#services" className="svc-back"><ArrowRight size={16} /> كل الخدمات</Link>
    {loading ? <div className="data-state"><span className="spinner" /> جارٍ التحميل…</div> : error ? <div className="data-state">{error}</div> : !s ? <div className="data-state">الخدمة غير متاحة.</div> :
      <><article className="svc-article">{s.imageUrl && <img src={s.imageUrl} alt={s.title} />}<h1>{s.title}</h1><p className="svc-lead">{s.description}</p>{s.details && <div className="svc-details">{s.details}</div>}</article>
        <section className="svc-book"><BookingForm presetServiceId={s.id} /></section></>}
  </main>
}
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <SiteProvider><Detail id={id} /></SiteProvider>
}
