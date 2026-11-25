import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { getStorageClient } from '@/lib/firebase/client'
import { prepareImage } from './image'

export const STORAGE_FOLDERS = ['doctors', 'services', 'packages', 'testimonials', 'gallery', 'faqs', 'site'] as const

export async function uploadImage(folder: (typeof STORAGE_FOLDERS)[number] | string, original: File, onProgress?: (pct: number) => void): Promise<{ url: string; path: string }> {
  const file = await prepareImage(original) // تحقق من التوقيع + ضغط
  const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg'
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`
  const task = uploadBytesResumable(ref(getStorageClient(), path), file, { contentType: file.type, cacheControl: 'public,max-age=31536000' })
  return new Promise((resolve, reject) => {
    task.on('state_changed',
      (s) => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      async () => { try { resolve({ url: await getDownloadURL(task.snapshot.ref), path }) } catch (e) { reject(e) } })
  })
}
export async function removeImage(path?: string | null): Promise<void> {
  if (!path) return
  try { await deleteObject(ref(getStorageClient(), path)) } catch { /* غير موجود أو لا صلاحية: لا يوقف العملية */ }
}
export async function removeImages(paths: (string | undefined | null)[]) { await Promise.all(paths.map(removeImage)) }
