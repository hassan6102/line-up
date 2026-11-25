import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch, type QueryConstraint } from 'firebase/firestore'
import { getDb } from '@/lib/firebase/client'

export type CollectionName = 'doctors' | 'services' | 'packages' | 'testimonials' | 'gallery' | 'faqs'

const clean = <T extends object>(data: T) => Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as T
const withId = <T,>(d: { id: string; data: () => unknown }) => ({ id: d.id, ...(d.data() as object) }) as T & { id: string }
const byOrder = (a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0)

/** قراءة الإدارة: بدون قيود (القواعد تسمح للمدير فقط بقراءة العناصر المخفية). */
export async function listAll<T>(name: CollectionName, ...constraints: QueryConstraint[]): Promise<(T & { id: string })[]> {
  const snap = await getDocs(query(collection(getDb(), name), ...constraints))
  return snap.docs.map((d) => withId<T>(d))
}

/**
 * قراءة الزوار: يجب أن تحتوي الاستعلامات على نفس شروط القواعد (visible == true، وللتقييمات approved == true أيضاً)
 * وإلا ترفضها Firestore. الترتيب يتم في المتصفح لتفادي الحاجة إلى فهارس مركّبة.
 */
export async function listPublic<T extends { order?: number }>(name: CollectionName, extra: QueryConstraint[] = []): Promise<(T & { id: string })[]> {
  const snap = await getDocs(query(collection(getDb(), name), where('visible', '==', true), ...extra))
  return snap.docs.map((d) => withId<T>(d)).sort(byOrder)
}

export async function createItem<T extends object>(name: CollectionName, data: T): Promise<string> {
  const ref = await addDoc(collection(getDb(), name), { ...clean(data), createdAt: serverTimestamp() })
  return ref.id
}
export async function updateItem<T extends object>(name: CollectionName, id: string, data: Partial<T>) {
  await updateDoc(doc(getDb(), name, id), { ...clean(data), updatedAt: serverTimestamp() })
}
export async function deleteItem(name: CollectionName, id: string) { await deleteDoc(doc(getDb(), name, id)) }

/** يعيد كتابة order = 0..n-1 حسب الترتيب المعطى (دفعة واحدة ذرية). */
export async function reorderItems(name: CollectionName, orderedIds: string[]) {
  if (!orderedIds.length) return
  const db = getDb(); const batch = writeBatch(db)
  orderedIds.forEach((id, i) => batch.update(doc(db, name, id), { order: i }))
  await batch.commit()
}
/** الترتيب التالي للعنصر الجديد = أكبر قيمة موجودة + 1 (لا يتكرر بعد الحذف). */
export const nextOrder = (rows: readonly Record<string, unknown>[]) => rows.reduce((m, r) => Math.max(m, Number(r.order ?? -1)), -1) + 1

export async function getSingleton<T>(path: string, fallback: T): Promise<T> {
  const snap = await getDoc(doc(getDb(), 'site', path))
  return snap.exists() ? ({ ...fallback, ...(snap.data() as object) } as T) : fallback
}
export async function saveSingleton<T extends object>(path: string, data: T) {
  await setDoc(doc(getDb(), 'site', path), clean(data), { merge: true })
}
