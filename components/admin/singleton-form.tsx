'use client'
import { useState } from 'react'
import { useAsync } from '@/lib/hooks/use-async'
import { getSingleton, saveSingleton } from '@/lib/services/crud'
import { removeImages, uploadImage } from '@/lib/services/storage'
import { PageHead, State, useToast } from './ui'

export type SField = {
  key: string; label: string; type: 'text' | 'textarea' | 'lines' | 'image' | 'pairs' | 'toggles'; hint?: string; ltr?: boolean
  options?: { key: string; label: string }[]
  /** لحقول pairs: أسماء المفتاحين داخل كل عنصر (الافتراضي days/time) */
  pair?: [string, string]
  /** للروابط: يجب أن تبدأ بـ https:// */
  url?: boolean
}
type Group = { title: string; fields: SField[] }
const pairKeys = (f: SField): [string, string] => f.pair ?? ['days', 'time']

/** يحوّل مستند Firestore إلى قيم حقول النموذج (القوائم والأزواج تصبح نصاً بأسطر) */
function toFormValues(data: object, groups: Group[]): Record<string, unknown> {
  const f: Record<string, unknown> = { ...data }
  for (const g of groups) for (const fl of g.fields) {
    if (fl.type === 'lines' && Array.isArray(f[fl.key])) f[fl.key] = (f[fl.key] as string[]).join('\n')
    if (fl.type === 'pairs' && Array.isArray(f[fl.key])) {
      const [a, b] = pairKeys(fl)
      f[fl.key] = (f[fl.key] as Record<string, string>[]).map((p) => `${p[a] ?? ''} | ${p[b] ?? ''}`).join('\n')
    }
  }
  return f
}

export function SingletonForm<T extends object>({ doc, title, desc, defaults, groups, folder }: { doc: string; title: string; desc: string; defaults: T; groups: Group[]; folder: string }) {
  const toast = useToast()
  const { data, loading, error, reload } = useAsync<T>(() => getSingleton(doc, defaults), defaults)
  // النموذج = المسودة المحررة إن وُجدت، وإلا قيم المستند المحمّل (مشتقة أثناء العرض بلا Effect)
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null)
  const form = draft ?? toFormValues(data, groups)
  const [files, setFiles] = useState<Record<string, File>>({})
  const [progress, setProgress] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: unknown) => setDraft((s) => ({ ...(s ?? form), [k]: v }))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    for (const g of groups) for (const f of g.fields)
      if (f.url) { const v = String(form[f.key] ?? '').trim(); if (v && !/^https:\/\/\S+$/.test(v)) return toast('err', `«${f.label}» يجب أن يبدأ بـ https://`) }
    setSaving(true)
    const uploaded: string[] = []; const stale: string[] = []
    try {
      const out: Record<string, unknown> = { ...form }
      for (const g of groups) for (const f of g.fields) {
        if (f.type === 'text') out[f.key] = String(form[f.key] ?? '').trim()
        if (f.type === 'lines') out[f.key] = String(form[f.key] ?? '').split('\n').map((s) => s.trim()).filter(Boolean)
        if (f.type === 'pairs') {
          const [a, b] = pairKeys(f)
          out[f.key] = String(form[f.key] ?? '').split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((p) => p[0]).map((p) => ({ [a]: p[0], [b]: p.slice(1).join(' | ') }))
        }
        if (f.type === 'image' && files[f.key]) {
          const up = await uploadImage(folder, files[f.key], setProgress)
          uploaded.push(up.path)
          const old = out[`${f.key}Path`] as string | undefined
          if (old) stale.push(old)
          out[f.key] = up.url; out[`${f.key}Path`] = up.path
        }
      }
      await saveSingleton(doc, out)
      await removeImages(stale)          // بعد نجاح الحفظ فقط
      setFiles({}); setDraft(null); toast('ok', 'تم حفظ التغييرات'); reload()
    } catch (x) {
      await removeImages(uploaded)       // تراجع عن الصور الجديدة، والقديمة سليمة
      const code = (x as { code?: string }).code
      toast('err', code === 'permission-denied' ? 'رفض الخادم الحفظ: تحقق من طول الحقول وصحة الروابط (https) والصلاحيات.' : (x as Error).message || 'تعذر الحفظ')
    } finally { setSaving(false); setProgress(null) }
  }
  return <>
    <PageHead title={title} desc={desc} />
    <State loading={loading} error={error} onRetry={reload} />
    {!loading && !error && <form onSubmit={save} className="adm-stack">
      {groups.map((g) => <section className="adm-card adm-pad" key={g.title}><h3>{g.title}</h3><div className="adm-form">
        {g.fields.map((f) => <label key={f.key} className={`adm-field${f.type === 'text' ? '' : ' full'}`}><span>{f.label}</span>
          {f.type === 'text' && <input dir={f.ltr ? 'ltr' : undefined} value={String(form[f.key] ?? '')} onChange={(e) => set(f.key, e.target.value)} />}
          {(f.type === 'textarea' || f.type === 'lines' || f.type === 'pairs') && <textarea rows={f.type === 'textarea' ? 4 : 3} placeholder={f.hint} value={String(form[f.key] ?? '')} onChange={(e) => set(f.key, e.target.value)} />}
          {f.type === 'image' && <div className="adm-upload">{(files[f.key] || form[f.key]) && <img alt="" src={files[f.key] ? URL.createObjectURL(files[f.key]) : String(form[f.key])} />}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) setFiles((s) => ({ ...s, [f.key]: file })) }} /></div>}
          {f.type === 'toggles' && <div className="adm-toggles">{f.options!.map((o) => <span key={o.key} className="adm-check"><input type="checkbox" checked={Boolean((form[f.key] as Record<string, boolean> | undefined)?.[o.key])}
            onChange={(e) => set(f.key, { ...(form[f.key] as object), [o.key]: e.target.checked })} />{o.label}</span>)}</div>}
          {f.hint && f.type !== 'textarea' && f.type !== 'lines' && f.type !== 'pairs' && <small className="adm-muted">{f.hint}</small>}
        </label>)}
      </div></section>)}
      {progress !== null && <div className="adm-progress"><i style={{ width: `${progress}%` }} /><b>{progress}%</b></div>}
      <div className="adm-row-end"><button className="adm-btn" disabled={saving}>{saving ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}</button></div>
    </form>}
  </>
}
