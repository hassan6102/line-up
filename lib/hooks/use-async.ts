'use client'
import { useCallback, useEffect, useState } from 'react'

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

// دالة نقية (بدون setState): تحوّل نتيجة/خطأ الدالة إلى قيمة، فتُستدعى من الـ Effect ومن reload بنفس المنطق
const settle = <T,>(fn: () => Promise<T>): Promise<Result<T>> =>
  Promise.resolve()
    .then(fn)
    .then(
      (data): Result<T> => ({ ok: true, data }),
      (e): Result<T> => ({ ok: false, error: (e as Error).message || 'حدث خطأ أثناء تحميل البيانات' }),
    )

export function useAsync<T>(fn: () => Promise<T>, initial: T) {
  // نثبّت أول دالة تُمرَّر (نفس سلوك السابق حيث كانت run مثبتة بمصفوفة اعتماديات فارغة)
  const [load] = useState(() => fn)
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // التحميل الأول: لا setState متزامن داخل الـ Effect؛ الحالة الابتدائية loading=true أصلاً
  useEffect(() => {
    let alive = true
    settle(load).then((r) => {
      if (!alive) return
      if (r.ok) { setData(r.data); setError(null) } else setError(r.error)
      setLoading(false)
    })
    return () => { alive = false }
  }, [load])

  // إعادة التحميل (تُستدعى من معالجات الأحداث): نفس التسلسل السابق loading=true ثم النتيجة
  const reload = useCallback(async () => {
    setLoading(true); setError(null)
    const r = await settle(load)
    if (r.ok) setData(r.data); else setError(r.error)
    setLoading(false)
  }, [load])

  return { data, loading, error, reload, setData }
}
