'use client'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { submitBooking } from '@/lib/services/bookings'
import { useSite } from './site-provider'

export function BookingForm({ presetServiceId = '' }: { presetServiceId?: string }) {
  const { data } = useSite()
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState(false)
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr('')
    const f = new FormData(e.currentTarget); const g = (k: string) => String(f.get(k) ?? '')
    if (g('website')) { setDone(true); return } // honeypot: الروبوتات تملأ هذا الحقل المخفي
    const service = data.services.find((s) => s.id === g('service')); const doctor = data.doctors.find((d) => d.id === g('doctor'))
    setBusy(true)
    try {
      await submitBooking({ name: g('name'), phone: g('phone'), serviceId: service?.id ?? '', serviceTitle: service?.title ?? '', doctorId: doctor?.id ?? '', doctorName: doctor?.name ?? '', date: g('date'), time: g('time'), notes: g('notes') })
      setDone(true)
    } catch (x) { setErr((x as Error).message || 'تعذر إرسال الطلب. حاول مرة أخرى.') } finally { setBusy(false) }
  }
  if (done) return <div className="booking-form booking-done"><CheckCircle2 size={44} /><h3>وصلنا طلبك</h3><p>سيتواصل معك فريق العيادة لتأكيد الموعد. إرسال الطلب لا يعني أن الموعد مؤكد.</p></div>
  return <form className="booking-form" onSubmit={onSubmit}>
    <div className="form-heading"><span>احجز استشارة</span><p>املأ البيانات وسنتواصل معك لتأكيد الموعد.</p></div>
    <div className="form-fields">
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', insetInlineStart: '-9999px', width: 1, height: 1, opacity: 0 }} />
      <label>الاسم الكامل<input name="name" autoComplete="name" required minLength={2} maxLength={80} /></label>
      <label>رقم الهاتف<input name="phone" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" placeholder="01012345678" required /></label>
      <label>الخدمة المطلوبة<select name="service" required defaultValue={presetServiceId}><option value="" disabled>اختر الخدمة</option>{data.services.map((s) => <option value={s.id} key={s.id}>{s.title}</option>)}</select></label>
      <label>الطبيب (اختياري)<select name="doctor" defaultValue=""><option value="">بدون تفضيل</option>{data.doctors.map((d) => <option value={d.id} key={d.id}>{d.name}</option>)}</select></label>
      <label>اليوم المناسب<input name="date" type="date" min={new Date().toLocaleDateString('en-CA')} /></label>
      <label>الوقت المناسب<select name="time" defaultValue=""><option value="">غير محدد</option><option>صباحاً</option><option>مساءً</option></select></label>
      <label className="full-field">ملاحظات إضافية<textarea name="notes" rows={3} maxLength={500} /></label>
    </div>
    {err && <p className="booking-notice" role="alert">{err}</p>}
    {!data.services.length && <p className="booking-notice">لا توجد خدمات متاحة للحجز حالياً.</p>}
    <button className="button button-primary submit-button" disabled={busy || !data.services.length}>{busy ? 'جارٍ الإرسال…' : 'إرسال طلب الحجز'} <ArrowLeft size={17} /></button>
    <small className="privacy-hint">بياناتك تُستخدم للتواصل بشأن هذا الطلب فقط.</small>
  </form>
}
