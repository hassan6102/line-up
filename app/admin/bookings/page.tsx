'use client'
import { useMemo, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { useAsync } from '@/lib/hooks/use-async'
import { deleteBooking, listBookings, setBookingStatus } from '@/lib/services/bookings'
import { BOOKING_STATUS, type Booking, type BookingStatus } from '@/lib/types'
import { ConfirmDialog, Modal, PageHead, State, useToast } from '@/components/admin/ui'

const STATUS = BOOKING_STATUS
const PAGE = 10

export default function Page() {
  const toast = useToast()
  const { data, loading, error, reload } = useAsync<Booking[]>(() => listBookings(), [])
  const [q, setQ] = useState(''); const [status, setStatus] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  const [page, setPage] = useState(0); const [view, setView] = useState<Booking | null>(null); const [del, setDel] = useState<Booking | null>(null)

  const filtered = useMemo(() => data.filter((b) =>
    (!q || b.name.toLowerCase().includes(q.toLowerCase()) || b.phone.includes(q)) && (!status || b.status === status) &&
    (!from || b.date >= from) && (!to || b.date <= to)), [data, q, status, from, to])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE)); const cur = Math.min(page, pages - 1)
  const rows = filtered.slice(cur * PAGE, cur * PAGE + PAGE)

  async function change(b: Booking, s: BookingStatus) {
    try { await setBookingStatus(b.id, s); toast('ok', `الحالة: ${STATUS[s]}`); setView((v) => v && v.id === b.id ? { ...v, status: s } : v); reload() } catch { toast('err', 'تعذر تغيير الحالة') }
  }
  async function remove() {
    if (!del) return
    try { await deleteBooking(del.id); toast('ok', 'تم حذف الحجز'); setDel(null); setView(null); reload() } catch { toast('err', 'تعذر الحذف') }
  }
  return <>
    <PageHead title="الحجوزات" desc="طلبات الحجز لا تُعتبر مؤكدة إلا بعد تأكيدها من هنا." />
    <div className="adm-card adm-filters">
      <label className="adm-search"><Search size={16} /><input placeholder="بحث بالاسم أو الهاتف" value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} /></label>
      <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0) }}><option value="">كل الحالات</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0) }} aria-label="من تاريخ" />
      <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0) }} aria-label="إلى تاريخ" />
    </div>
    <State loading={loading} error={error} empty={!filtered.length} emptyText="لا توجد حجوزات مطابقة." onRetry={reload} />
    {!loading && !error && filtered.length > 0 && <div className="adm-card adm-tablewrap"><table className="adm-table"><thead><tr><th>الاسم</th><th>الهاتف</th><th>الخدمة</th><th>الموعد</th><th>الحالة</th><th /></tr></thead>
      <tbody>{rows.map((b) => <tr key={b.id} onClick={() => setView(b)}>
        <td>{b.name}</td><td dir="ltr">{b.phone}</td><td>{b.serviceTitle}</td><td>{b.date || '—'} {b.time}</td>
        <td><span className={`adm-status ${b.status}`}>{STATUS[b.status]}</span></td>
        <td><button className="adm-icon-btn danger" aria-label="حذف" onClick={(e) => { e.stopPropagation(); setDel(b) }}><Trash2 size={16} /></button></td></tr>)}</tbody></table>
      <div className="adm-pager"><button className="adm-btn ghost" disabled={cur === 0} onClick={() => setPage(cur - 1)}>السابق</button><span>{cur + 1} / {pages}</span><button className="adm-btn ghost" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>التالي</button></div></div>}
    {view && <Modal title="تفاصيل الحجز" onClose={() => setView(null)}>
      <dl className="adm-dl"><dt>الاسم</dt><dd>{view.name}</dd><dt>الهاتف</dt><dd dir="ltr">{view.phone}</dd><dt>الخدمة</dt><dd>{view.serviceTitle}</dd>
        <dt>الطبيب</dt><dd>{view.doctorName || 'غير محدد'}</dd><dt>التاريخ</dt><dd>{view.date || '—'}</dd><dt>الوقت</dt><dd>{view.time || '—'}</dd>
        <dt>ملاحظات</dt><dd>{view.notes || '—'}</dd><dt>أُرسل في</dt><dd>{new Date(view.createdAt).toLocaleString('ar-EG')}</dd></dl>
      <div className="adm-field"><span>تغيير الحالة</span><div className="adm-chips">{(Object.keys(STATUS) as BookingStatus[]).map((s) =>
        <button key={s} className={`adm-chip ${view.status === s ? 'on' : ''}`} onClick={() => change(view, s)}>{STATUS[s]}</button>)}</div></div>
      <div className="adm-row-end"><button className="adm-btn danger" onClick={() => setDel(view)}>حذف الحجز</button></div>
    </Modal>}
    {del && <ConfirmDialog text={`حذف حجز ${del.name} نهائياً؟`} onConfirm={remove} onCancel={() => setDel(null)} />}
  </>
}
