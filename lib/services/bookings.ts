import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { getDb } from '@/lib/firebase/client'
import type { Booking, BookingStatus } from '@/lib/types'
import { BOOKING_COOLDOWN_MINUTES, validateBooking, type BookingInput } from '@/lib/utils/booking'

export { validateBooking, BOOKING_COOLDOWN_MINUTES, type BookingInput } from '@/lib/utils/booking'

/**
 * الزائر يرسل فقط. نكتب في دفعة واحدة: rateLimits/{phone} + bookings/{id}.
 * القواعد تشترط أن يكون rateLimits محدَّثاً في نفس الدفعة ولم يمض عليه أقل من 10 دقائق،
 * فلا يمكن إرسال أكثر من حجز واحد لنفس الرقم كل 10 دقائق.
 */
export async function submitBooking(input: BookingInput): Promise<string> {
  const v = validateBooking(input)
  if (!v.ok) throw new Error(v.error)
  const db = getDb(); const ref = doc(collection(db, 'bookings'))
  const batch = writeBatch(db)
  batch.set(doc(db, 'rateLimits', v.value.phone.replace('+', '')), { at: serverTimestamp() })
  batch.set(ref, { ...v.value, status: 'new' as BookingStatus, createdAt: serverTimestamp() })
  try { await batch.commit() } catch (e) {
    if ((e as { code?: string }).code === 'permission-denied')
      throw new Error(`تعذّر إرسال الطلب. إن كنت أرسلت طلباً بنفس الرقم خلال آخر ${BOOKING_COOLDOWN_MINUTES} دقائق فانتظر قليلاً أو تواصل معنا هاتفياً.`)
    throw e
  }
  return ref.id
}

const toMillis = (v: unknown): number => {
  if (typeof v === 'number') return v
  const t = v as { toMillis?: () => number } | null
  return t && typeof t.toMillis === 'function' ? t.toMillis() : 0
}
export async function listBookings(max = 500): Promise<Booking[]> {
  const snap = await getDocs(query(collection(getDb(), 'bookings'), orderBy('createdAt', 'desc'), limit(max)))
  return snap.docs.map((d) => { const x = d.data(); return { id: d.id, ...x, createdAt: toMillis(x.createdAt) } as Booking })
}
export const setBookingStatus = (id: string, status: BookingStatus) => updateDoc(doc(getDb(), 'bookings', id), { status })
export const deleteBooking = (id: string) => deleteDoc(doc(getDb(), 'bookings', id))
