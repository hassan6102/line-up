import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizePhone } from '../lib/utils/phone.ts'
import { sniffImageKind } from '../lib/services/image.ts'

test('phone: accepted formats normalize to E.164', () => {
  const ok: [string, string][] = [
    ['01012345678', '+201012345678'], ['٠١٠١٢٣٤٥٦٧٨', '+201012345678'], ['۰۱۰۱۲۳۴۵۶۷۸', '+201012345678'],
    ['+201012345678', '+201012345678'], ['+20 101 234 5678', '+201012345678'], ['0020 10 1234 5678', '+201012345678'],
    ['(010) 1234-5678', '+201012345678'], ['010.1234.5678', '+201012345678'], ['1012345678', '+201012345678'],
    ['01112345678', '+201112345678'], ['01212345678', '+201212345678'], ['01512345678', '+201512345678'],
    ['0227654321', '+20227654321'], ['+966501234567', '+966501234567'], ['\u200f٠١٠١٢٣٤٥٦٧٨\u200f', '+201012345678'],
  ]
  for (const [i, o] of ok) assert.equal(normalizePhone(i), o, i)
})
test('phone: invalid inputs rejected', () => {
  for (const bad of ['', 'abc12345', '0101234567', '010123456789', '01312345678', '12345', '966501234567', '+1', '٠١٠abc', '01012345678; drop', '+20 1312345678'])
    assert.equal(normalizePhone(bad), null, bad)
})
test('image: magic bytes', () => {
  assert.equal(sniffImageKind(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0])), 'jpeg')
  assert.equal(sniffImageKind(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])), 'png')
  assert.equal(sniffImageKind(new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50])), 'webp')
  assert.equal(sniffImageKind(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>')), null)
  assert.equal(sniffImageKind(new TextEncoder().encode('GIF89a......')), null)
  assert.equal(sniffImageKind(new Uint8Array([])), null)
})

import { parseSettingsDoc, getSeoSettings } from '../lib/services/seo-server.ts'
import { validateBooking } from '../lib/utils/booking.ts'

test('seo: parses Firestore REST document and falls back safely', async () => {
  const doc = { fields: { seoTitle: { stringValue: 'عنوان' }, seoDescription: { stringValue: 'وصف' }, ogImageUrl: { stringValue: 'https://x.test/a.webp' },
    sections: { mapValue: { fields: { faq: { booleanValue: false } } } } } }
  const s = parseSettingsDoc(doc)
  assert.equal(s.seoTitle, 'عنوان'); assert.equal(s.seoDescription, 'وصف'); assert.equal(s.ogImageUrl, 'https://x.test/a.webp'); assert.equal(s.sections.faq, false); assert.equal(s.sections.about, true)
  assert.equal(parseSettingsDoc({ fields: { ogImageUrl: { stringValue: 'http://insecure' } } }).ogImageUrl, '')   // يرفض http
  assert.ok(parseSettingsDoc(null).seoTitle.length > 0)                                                        // افتراضي عند الغياب
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo'
  const ok = await getSeoSettings((async () => new Response(JSON.stringify(doc), { status: 200 })) as typeof fetch)
  assert.equal(ok.seoTitle, 'عنوان')
  const nf = await getSeoSettings((async () => new Response('{}', { status: 404 })) as typeof fetch)
  assert.ok(nf.seoTitle.length > 0)
  const boom = await getSeoSettings((async () => { throw new Error('net') }) as typeof fetch)
  assert.ok(boom.seoTitle.length > 0)
})

test('booking validation: normalization and rejection', () => {
  const base = { name: '  أحمد   علي ', phone: '٠١٠١٢٣٤٥٦٧٨', serviceId: 'abc123', serviceTitle: 'x', doctorId: '', doctorName: '', date: '', time: '', notes: ' ' }
  const ok = validateBooking(base, '2026-11-24'); assert.ok(ok.ok)
  if (ok.ok) { assert.equal(ok.value.name, 'أحمد علي'); assert.equal(ok.value.phone, '+201012345678'); assert.equal(ok.value.notes, '') }
  const bad = (o: object) => { const r = validateBooking({ ...base, ...o }, '2026-11-24'); assert.equal(r.ok, false, JSON.stringify(o)) }
  bad({ name: 'أ' }); bad({ name: 'x'.repeat(81) }); bad({ phone: '123' }); bad({ serviceId: '' }); bad({ serviceId: 'a/b' }); bad({ doctorId: 'x/y' })
  bad({ date: '2026-11-23' }); bad({ date: '2026-02-30' }); bad({ date: 'غدا' }); bad({ time: 'ليلاً' }); bad({ notes: 'n'.repeat(501) })
  assert.ok(validateBooking({ ...base, date: '2026-11-24', time: 'صباحاً' }, '2026-11-24').ok)   // اليوم مسموح
})
