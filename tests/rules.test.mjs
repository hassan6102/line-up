// اختبارات القواعد على Firebase Emulator. تشغيل: pnpm test:rules  (يتطلب Java + firebase-tools)
// لم تُشغَّل في بيئة الإعداد (لا شبكة)؛ شغّلها محلياً قبل النشر.
import { test, before, after, beforeEach } from 'node:test'
import { readFileSync } from 'node:fs'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, collection, query, where, writeBatch, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getBytes } from 'firebase/storage'

let env
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-lineup',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
    storage: { rules: readFileSync('storage.rules', 'utf8'), host: '127.0.0.1', port: 9199 },
  })
})
after(async () => { await env?.cleanup() })
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'services/svc1'), { title: 'علاج', description: 'د', details: '', imageUrl: '', visible: true, order: 0 })
    await setDoc(doc(db, 'services/hidden1'), { title: 'مخفي', description: 'د', details: '', imageUrl: '', visible: false, order: 1 })
    await setDoc(doc(db, 'doctors/doc1'), { name: 'د. س', specialty: 'ت', visible: true, order: 0 })
    await setDoc(doc(db, 'testimonials/t1'), { name: 'أ', rating: 5, comment: 'ممتاز', approved: true, visible: true })
    await setDoc(doc(db, 'testimonials/t2'), { name: 'ب', rating: 4, comment: 'جيد', approved: false, visible: true })
  })
})
const anon = () => env.unauthenticatedContext().firestore()
const user = () => env.authenticatedContext('u1').firestore()                 // مسجّل بلا claim
const admin = () => env.authenticatedContext('a1', { admin: true }).firestore()

const booking = (over = {}) => ({ name: 'أحمد', phone: '+201012345678', serviceId: 'svc1', serviceTitle: 'علاج', doctorId: '', doctorName: '', date: '', time: '', notes: '', status: 'new', createdAt: serverTimestamp(), ...over })
async function submit(db, data = booking()) {
  const b = writeBatch(db)
  b.set(doc(db, 'rateLimits', String(data.phone).replace('+', '')), { at: serverTimestamp() })
  b.set(doc(collection(db, 'bookings')), data)
  return b.commit()
}

test('visitor: published services listable, hidden not', async () => {
  await assertSucceeds(getDocs(query(collection(anon(), 'services'), where('visible', '==', true))))
  await assertFails(getDocs(collection(anon(), 'services')))                 // استعلام غير مقيَّد مرفوض
  await assertFails(getDoc(doc(anon(), 'services/hidden1')))
  await assertSucceeds(getDoc(doc(anon(), 'services/svc1')))
})
test('visitor: only approved+visible testimonials', async () => {
  await assertSucceeds(getDocs(query(collection(anon(), 'testimonials'), where('approved', '==', true), where('visible', '==', true))))
  await assertFails(getDocs(collection(anon(), 'testimonials')))
  await assertFails(getDoc(doc(anon(), 'testimonials/t2')))
})
test('admin can read hidden items and unfiltered lists', async () => {
  await assertSucceeds(getDocs(collection(admin(), 'services')))
  await assertSucceeds(getDoc(doc(admin(), 'testimonials/t2')))
})
test('writes: visitor and non-claim user denied, admin allowed with valid data', async () => {
  const svc = { title: 'جديد', description: 'وصف', details: '', imageUrl: '', visible: true, order: 2 }
  await assertFails(setDoc(doc(anon(), 'services/n1'), svc))
  await assertFails(setDoc(doc(user(), 'services/n1'), svc))
  await assertSucceeds(setDoc(doc(admin(), 'services/n1'), svc))
  await assertFails(updateDoc(doc(anon(), 'services/svc1'), { title: 'x' }))
  await assertFails(deleteDoc(doc(user(), 'services/svc1')))
  await assertSucceeds(deleteDoc(doc(admin(), 'services/n1')))
})
test('admin writes still validated (types, sizes, extra fields, bad url)', async () => {
  const ok = { title: 'ت', description: 'و', details: '', imageUrl: '', visible: true, order: 3 }
  await assertFails(setDoc(doc(admin(), 'services/b1'), { ...ok, extra: 1 }))
  await assertFails(setDoc(doc(admin(), 'services/b2'), { ...ok, title: 'x'.repeat(121) }))
  await assertFails(setDoc(doc(admin(), 'services/b3'), { ...ok, visible: 'yes' }))
  await assertFails(setDoc(doc(admin(), 'services/b4'), { ...ok, imageUrl: 'http://insecure.test/a.png' }))
  await assertFails(setDoc(doc(admin(), 'testimonials/b5'), { name: 'x', rating: 9, comment: 'c', approved: false, visible: true }))
})
test('site docs: public read, admin-only validated write', async () => {
  await assertFails(setDoc(doc(anon(), 'site/content'), { clinicName: 'x' }))
  await assertSucceeds(setDoc(doc(admin(), 'site/content'), { clinicName: 'Line Up' }, { merge: true }))
  await assertFails(setDoc(doc(admin(), 'site/content'), { notAllowed: 1 }, { merge: true }))
  await assertFails(setDoc(doc(admin(), 'site/content'), { instagram: 'javascript:alert(1)' }, { merge: true }))
  await assertSucceeds(getDoc(doc(anon(), 'site/content')))
  await assertFails(setDoc(doc(admin(), 'site/other'), { a: 1 }))
})
test('bookings: valid visitor submission succeeds and is admin-only to read', async () => {
  await assertSucceeds(submit(anon()))
  await assertFails(getDocs(collection(anon(), 'bookings')))
  await assertSucceeds(getDocs(collection(admin(), 'bookings')))
})
test('bookings: rejects tampering', async () => {
  await assertFails(submit(anon(), booking({ status: 'confirmed' })))
  await assertFails(submit(anon(), booking({ extra: 'x' })))
  await assertFails(submit(anon(), booking({ phone: '01012345678' })))             // غير مطبَّع
  await assertFails(submit(anon(), booking({ name: 'أ' })))
  await assertFails(submit(anon(), booking({ notes: 'n'.repeat(501) })))
  await assertFails(submit(anon(), booking({ serviceId: 'nope' })))                // غير موجودة
  await assertFails(submit(anon(), booking({ serviceId: 'hidden1', serviceTitle: 'مخفي' })))
  await assertFails(submit(anon(), booking({ serviceTitle: 'عنوان مزوّر' })))
  await assertFails(submit(anon(), booking({ date: 'غدا' })))
  await assertFails(submit(anon(), booking({ time: 'ليلاً' })))
  await assertFails(submit(anon(), booking({ createdAt: 123 })))                   // وقت مزوّر
  await assertSucceeds(submit(anon(), booking({ doctorId: 'doc1', doctorName: 'د. س' })))
})
test('bookings: no write without the rate-limit doc in the same batch', async () => {
  await assertFails(setDoc(doc(collection(anon(), 'bookings')), booking()))
})
test('bookings: same phone blocked within cooldown, other phone allowed', async () => {
  await assertSucceeds(submit(anon()))
  await assertFails(submit(anon()))
  await assertSucceeds(submit(anon(), booking({ phone: '+201112345678' })))
})
test('bookings: admin may change only status; visitor cannot update/delete', async () => {
  let id
  await env.withSecurityRulesDisabled(async (ctx) => { const r = doc(collection(ctx.firestore(), 'bookings')); id = r.id; await setDoc(r, { ...booking(), createdAt: new Date() }) })
  await assertSucceeds(updateDoc(doc(admin(), 'bookings', id), { status: 'confirmed' }))
  await assertFails(updateDoc(doc(admin(), 'bookings', id), { status: 'bogus' }))
  await assertFails(updateDoc(doc(admin(), 'bookings', id), { name: 'تغيير' }))
  await assertFails(updateDoc(doc(anon(), 'bookings', id), { status: 'confirmed' }))
  await assertFails(deleteDoc(doc(anon(), 'bookings', id)))
  await assertSucceeds(deleteDoc(doc(admin(), 'bookings', id)))
})
test('unknown collection denied', async () => {
  await assertFails(setDoc(doc(admin(), 'secrets/x'), { a: 1 }))
  await assertFails(getDoc(doc(anon(), 'secrets/x')))
})

// ───── Storage ─────
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])
const meta = (t) => ({ contentType: t })
test('storage: public read; only admin uploads valid images', async () => {
  const a = env.authenticatedContext('a1', { admin: true }).storage(); const v = env.unauthenticatedContext().storage(); const u = env.authenticatedContext('u1').storage()
  await assertSucceeds(uploadBytes(ref(a, 'doctors/1700000000000_abc123.webp'), png, meta('image/webp')))
  await assertSucceeds(getBytes(ref(v, 'doctors/1700000000000_abc123.webp')))
  await assertFails(uploadBytes(ref(v, 'doctors/1700000000001_abc123.webp'), png, meta('image/webp')))
  await assertFails(uploadBytes(ref(u, 'doctors/1700000000002_abc123.webp'), png, meta('image/webp')))
  await assertFails(uploadBytes(ref(a, 'doctors/1700000000003_abc123.svg'), png, meta('image/svg+xml')))
  await assertFails(uploadBytes(ref(a, 'doctors/1700000000004_abc123.webp'), png, meta('text/html')))
  await assertFails(uploadBytes(ref(a, 'evil/1700000000005_abc123.webp'), png, meta('image/webp')))
  await assertFails(uploadBytes(ref(a, 'doctors/shell.php'), png, meta('image/png')))
  await assertFails(uploadBytes(ref(a, 'doctors/1700000000000_abc123.webp'), png, meta('image/webp')))   // لا استبدال لملف موجود
})
