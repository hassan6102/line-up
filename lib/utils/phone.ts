// تطبيع أرقام الهواتف: يقبل أرقاماً عربية/فارسية/إنجليزية ومسافات وشرطات وأقواساً ونقاطاً،
// ويُرجع الرقم بصيغة E.164 (مثل +201012345678) أو null إن لم يكن صالحاً.

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩'
const PERSIAN = '۰۱۲۳۴۵۶۷۸۹'

export function toAsciiDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (ch) => {
    const a = ARABIC_INDIC.indexOf(ch)
    return String(a >= 0 ? a : PERSIAN.indexOf(ch))
  })
}

export function normalizePhone(input: string): string | null {
  // إزالة محارف الاتجاه غير المرئية ثم الفواصل المسموحة
  let s = toAsciiDigits(input).replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '').trim()
  if (!/^[+\d\s().-]+$/.test(s)) return null
  const hadPlus = s.startsWith('+')
  s = s.replace(/[^\d]/g, '')
  if (!s) return null

  if (!hadPlus && s.startsWith('00')) s = s.slice(2)          // 0020...
  else if (!hadPlus && s.startsWith('0')) s = '20' + s.slice(1) // 010... -> 2010...
  else if (!hadPlus && !s.startsWith('20') && /^1[0125]\d{8}$/.test(s)) s = '20' + s // 10xxxxxxxx
  // من هنا s = أرقام الدولة + الرقم الوطني

  if (s.startsWith('20')) {
    const national = s.slice(2)
    const mobile = /^1[0125]\d{8}$/.test(national)           // 10/11/12/15 + 8 أرقام
    const landline = /^(2\d{8}|[3-9]\d{7,8})$/.test(national) // القاهرة 2 + 8، والمحافظات 7-8 أرقام بعد المفتاح
    return mobile || landline ? `+${s}` : null
  }
  // أرقام دولية أخرى: يجب أن تبدأ بـ + صراحةً
  if (hadPlus && /^[1-9]\d{7,14}$/.test(s)) return `+${s}`
  return null
}

export const PHONE_ERROR = 'رقم الهاتف غير صحيح. مثال: 01012345678 أو +201012345678'
