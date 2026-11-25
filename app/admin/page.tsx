'use client'
import { Calendar, CheckCircle2, ClipboardList, Package as Pkg, Sparkles, Stethoscope } from 'lucide-react'
import { useAsync } from '@/lib/hooks/use-async'
import { listBookings } from '@/lib/services/bookings'
import { listAll } from '@/lib/services/crud'
import { BOOKING_STATUS, type Booking, type BookingStatus } from '@/lib/types'
import { PageHead, State } from '@/components/admin/ui'

async function load() {
  const [bookings, d, s, p] = await Promise.all([listBookings(), listAll('doctors'), listAll('services'), listAll('packages')])
  return { bookings, doctors: d.length, services: s.length, packages: p.length }
}

export default function Page() {
  const { data, loading, error, reload } = useAsync<{ bookings: Booking[]; doctors: number; services: number; packages: number }>(load, { bookings: [], doctors: 0, services: 0, packages: 0 })
  const b = data.bookings
  const count = (s: BookingStatus) => b.filter((x) => x.status === s).length
  const stats = [
    { label: 'الأطباء', v: data.doctors, icon: Stethoscope }, { label: 'الخدمات', v: data.services, icon: ClipboardList }, { label: 'الباقات', v: data.packages, icon: Pkg },
    { label: 'إجمالي الحجوزات', v: b.length, icon: Calendar }, { label: 'حجوزات جديدة', v: count('new'), icon: Sparkles }, { label: 'حجوزات مؤكدة', v: count('confirmed'), icon: CheckCircle2 },
  ]
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d })
  const perDay = days.map((d) => ({ label: d.toLocaleDateString('ar-EG', { weekday: 'short' }), n: b.filter((x) => new Date(x.createdAt).toDateString() === d.toDateString()).length }))
  const maxDay = Math.max(1, ...perDay.map((x) => x.n))
  const statuses = (Object.keys(BOOKING_STATUS) as BookingStatus[]).map((s) => ({ s, n: count(s) }))
  const maxS = Math.max(1, ...statuses.map((x) => x.n))
  return <>
    <PageHead title="نظرة عامة" desc="ملخص نشاط العيادة والحجوزات." />
    <State loading={loading} error={error} onRetry={reload} />
    {!loading && !error && <>
      <div className="adm-stats">{stats.map((s) => <div className="adm-card adm-stat" key={s.label}><span><s.icon size={20} /></span><div><b>{s.v}</b><small>{s.label}</small></div></div>)}</div>
      <div className="adm-grid2">
        <div className="adm-card adm-pad"><h3>الحجوزات آخر 7 أيام</h3><div className="adm-bars">{perDay.map((x, i) => <div key={i}><i style={{ height: `${(x.n / maxDay) * 100}%` }} title={`${x.n}`} /><small>{x.label}</small><b>{x.n}</b></div>)}</div></div>
        <div className="adm-card adm-pad"><h3>الحجوزات حسب الحالة</h3>{statuses.map((x) => <div className="adm-hbar" key={x.s}><span>{BOOKING_STATUS[x.s]}</span><div><i className={x.s} style={{ width: `${(x.n / maxS) * 100}%` }} /></div><b>{x.n}</b></div>)}</div>
      </div>
      <div className="adm-card adm-pad"><h3>أحدث طلبات الحجز</h3>
        {b.length === 0 ? <p className="adm-muted">لا توجد حجوزات بعد.</p> : <table className="adm-table"><tbody>{b.slice(0, 6).map((x) => <tr key={x.id}><td>{x.name}</td><td>{x.serviceTitle}</td><td dir="ltr">{x.phone}</td><td><span className={`adm-status ${x.status}`}>{BOOKING_STATUS[x.status]}</span></td></tr>)}</tbody></table>}
      </div>
    </>}
  </>
}
