// التحقق من الصور وضغطها قبل الرفع (يعمل في المتصفح)
export const MAX_INPUT_BYTES = 12 * 1024 * 1024  // أقصى حجم لملف المستخدم قبل الضغط
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024  // أقصى حجم بعد الضغط (يطابق Storage Rules)
export const MAX_DIMENSION = 1600

export type ImageKind = 'jpeg' | 'png' | 'webp'

// فحص التوقيع الفعلي للملف (Magic Bytes) لا الاسم ولا file.type فقط
export function sniffImageKind(b: Uint8Array): ImageKind | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg'
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'png'
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'webp'
  return null
}

export async function validateImageFile(file: File): Promise<string | null> {
  if (file.size === 0) return 'الملف فارغ.'
  if (file.size > MAX_INPUT_BYTES) return 'حجم الصورة كبير جداً (الحد 12 ميجابايت).'
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (!sniffImageKind(head)) return 'الملف ليس صورة JPG أو PNG أو WebP صالحة.'
  return null
}

const MIME: Record<ImageKind, string> = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

// يصغّر الأبعاد إلى MAX_DIMENSION ويعيد الترميز إلى WebP. إن فشل الضغط أو كان الناتج أكبر يُستخدم الأصل.
export async function prepareImage(file: File): Promise<File> {
  const err = await validateImageFile(file)
  if (err) throw new Error(err)
  const kind = sniffImageKind(new Uint8Array(await file.slice(0, 16).arrayBuffer()))!
  let result: File = new File([file], file.name, { type: MIME[kind] })
  try {
    if (typeof createImageBitmap === 'function' && typeof document !== 'undefined') {
      const bmp = await createImageBitmap(file)
      const scale = Math.min(1, MAX_DIMENSION / Math.max(bmp.width, bmp.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bmp.width * scale)); canvas.height = Math.max(1, Math.round(bmp.height * scale))
      canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
      bmp.close?.()
      const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.82))
      if (blob && blob.type === 'image/webp' && (blob.size < result.size || scale < 1)) {
        result = new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' })
      }
    }
  } catch { /* نستخدم الملف الأصلي */ }
  if (result.size > MAX_UPLOAD_BYTES) throw new Error('الصورة ما زالت أكبر من 5 ميجابايت بعد الضغط. اختر صورة أصغر.')
  return result
}
