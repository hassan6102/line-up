import { BOOKING_TIMES, type Booking } from '@/lib/types'
import { normalizePhone, PHONE_ERROR } from './phone'

export type BookingInput = Pick<Booking, 'name' | 'phone' | 'serviceId' | 'serviceTitle' | 'doctorId' | 'doctorName' | 'date' | 'time' | 'notes'>
export const BOOKING_COOLDOWN_MINUTES = 10

const todayLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const validDate = (d: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false
  const dt = new Date(`${d}T00:00:00Z`)
  return !Number.isNaN(dt.getTime()) && dt.toISOString().slice(0, 10) === d
}

/** يتحقق ويُرجع البيانات المطبَّعة أو رسالة خطأ. نفس القيود مفروضة في firestore.rules. */
export function validateBooking(b: BookingInput, today: string = todayLocal()): { ok: true; value: BookingInput } | { ok: false; error: string } {
  const name = b.name.replace(/\s+/g, ' ').trim()
  if (name.length < 2 || name.length > 80) return { ok: false, error: 'يرجى كتابة الاسم (من حرفين إلى 80 حرفاً).' }
  const phone = normalizePhone(b.phone)
  if (!phone) return { ok: false, error: PHONE_ERROR }
  if (!/^[A-Za-z0-9]{1,40}$/.test(b.serviceId)) return { ok: false, error: 'اختر الخدمة المطلوبة.' }
  if (b.doctorId && !/^[A-Za-z0-9]{1,40}$/.test(b.doctorId)) return { ok: false, error: 'الطبيب المختار غير صحيح.' }
  if (b.date && (!validDate(b.date) || b.date < today)) return { ok: false, error: 'اختر تاريخاً صحيحاً لا يسبق اليوم.' }
  if (!(BOOKING_TIMES as readonly string[]).includes(b.time)) return { ok: false, error: 'الوقت المختار غير صحيح.' }
  const notes = b.notes.trim()
  if (notes.length > 500) return { ok: false, error: 'الملاحظات طويلة (الحد 500 حرف).' }
  return { ok: true, value: { ...b, name, phone, notes } }
}
