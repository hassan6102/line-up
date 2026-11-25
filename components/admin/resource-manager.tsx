'use client'
import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAsync } from '@/lib/hooks/use-async'
import { createItem, deleteItem, listAll, nextOrder, reorderItems, updateItem, type CollectionName } from '@/lib/services/crud'
import { removeImages, uploadImage } from '@/lib/services/storage'
import { ConfirmDialog, Modal, PageHead, State, useToast } from './ui'

export type Field =
  | { key: string; label: string; type: 'text' | 'textarea' | 'number' | 'lines'; required?: boolean; placeholder?: string }
  | { key: string; label: string; type: 'boolean'; hint?: string }
  | { key: string; label: string; type: 'image'; pathKey: string; required?: boolean }
  | { key: string; label: string; type: 'select'; options: string[]; required?: boolean }

type Row = Record<string, unknown> & { id: string }
type Props = {
  collection: CollectionName; title: string; desc: string; singular: string; fields: Field[]
  defaults: Record<string, unknown>; titleKey: string; subtitleKey?: string; imageKey?: string
  orderable?: boolean; visibilityKey?: string; badges?: { key: string; label: string }[]; storageFolder: string
}

export function ResourceManager(p: Props) {
  const toast = useToast()
  const { data, loading, error, reload } = useAsync<Row[]>(() => listAll<Row>(p.collection), [])
  const [editing, setEditing] = useState<Row | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Row | null>(null)
  const [busy, setBusy] = useState(false)
  const rows = useMemo(() => p.orderable ? [...data].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)) : data, [data, p.orderable])
  const vKey = p.visibilityKey ?? 'visible'

  async function toggle(r: Row) {
    try { await updateItem(p.collection, r.id, { [vKey]: !r[vKey] }); toast('ok', 'تم التحديث'); reload() } catch { toast('err', 'تعذر التحديث') }
  }
  async function move(i: number, dir: -1 | 1) {
    const ids = rows.map((r) => r.id); const j = i + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    try { await reorderItems(p.collection, ids); reload() } catch { toast('err', 'تعذر تغيير الترتيب') }
  }
  async function remove() {
    if (!deleting) return
    setBusy(true)
    try {
      await deleteItem(p.collection, deleting.id)
    } catch { toast('err', 'تعذر الحذف. تحقق من الصلاحيات.'); setBusy(false); return }
    // بعد نجاح حذف السجل: نظّف الصور ثم أعد ترقيم العناصر المتبقية (بدون فجوات)
    try { await removeImages(p.fields.filter((f) => f.type === 'image').map((f) => deleting[(f as { pathKey: string }).pathKey] as string | undefined)) } catch { /* لا يوقف العملية */ }
    try { if (p.orderable) await reorderItems(p.collection, rows.filter((r) => r.id !== deleting.id).map((r) => r.id)) } catch { toast('err', 'تم الحذف لكن تعذر إعادة ترقيم العناصر.') }
    toast('ok', 'تم الحذف'); setDeleting(null); setBusy(false); reload()
  }

  return <>
    <PageHead title={p.title} desc={p.desc} action={<button className="adm-btn" onClick={() => setEditing('new')}><Plus size={16} /> إضافة {p.singular}</button>} />
    <State loading={loading} error={error} empty={!rows.length} emptyText={`لا توجد عناصر بعد. اضغط «إضافة ${p.singular}» للبدء.`} onRetry={reload} />
    {!loading && !error && rows.length > 0 && <div className="adm-card adm-list">
      {rows.map((r, i) => <div className="adm-item" key={r.id}>
        {p.imageKey && (r[p.imageKey] ? <img src={r[p.imageKey] as string} alt="" className="adm-thumb" /> : <div className="adm-thumb empty" />)}
        <div className="adm-item-main">
          <strong>{String(r[p.titleKey] ?? '—')}</strong>
          {p.subtitleKey && <span>{String(r[p.subtitleKey] ?? '').slice(0, 90)}</span>}
          <div className="adm-badges">
            {p.badges?.map((b) => r[b.key] ? <em key={b.key} className="adm-badge">{b.label}</em> : null)}
            {!r[vKey] && <em className="adm-badge muted">مخفي</em>}
          </div>
        </div>
        <div className="adm-actions">
          {p.orderable && <><button className="adm-icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="أعلى"><ArrowUp size={16} /></button>
            <button className="adm-icon-btn" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label="أسفل"><ArrowDown size={16} /></button></>}
          <button className="adm-icon-btn" onClick={() => toggle(r)} aria-label="إظهار/إخفاء">{r[vKey] ? <Eye size={16} /> : <EyeOff size={16} />}</button>
          <button className="adm-icon-btn" onClick={() => setEditing(r)} aria-label="تعديل"><Pencil size={16} /></button>
          <button className="adm-icon-btn danger" onClick={() => setDeleting(r)} aria-label="حذف"><Trash2 size={16} /></button>
        </div>
      </div>)}
    </div>}
    {editing && <EditForm {...p} initial={editing === 'new' ? null : editing} nextOrder={nextOrder(rows)}
      onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload() }} />}
    {deleting && <ConfirmDialog text={`سيتم حذف «${String(deleting[p.titleKey] ?? '')}» نهائياً. هل أنت متأكد؟`} busy={busy} onConfirm={remove} onCancel={() => setDeleting(null)} />}
  </>
}

function EditForm(p: Props & { initial: Row | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const toast = useToast()
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const base = { ...p.defaults, ...(p.initial ?? {}) } as Record<string, unknown>
    for (const f of p.fields) if (f.type === 'lines' && Array.isArray(base[f.key])) base[f.key] = (base[f.key] as string[]).join('\n')
    return base
  })
  const [files, setFiles] = useState<Record<string, File>>({})
  const [progress, setProgress] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = (k: string, v: unknown) => setForm((s) => ({ ...s, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    for (const f of p.fields) {
      if ('required' in f && f.required) {
        const missing = f.type === 'image' ? !files[f.key] && !form[f.key] : !String(form[f.key] ?? '').trim()
        if (missing) return setErr(`الحقل «${f.label}» مطلوب.`)
      }
    }
    setSaving(true)
    const uploaded: string[] = []   // ما رُفع في هذه العملية (يُحذف إن فشل الحفظ)
    const stale: string[] = []      // الصور القديمة (تُحذف فقط بعد نجاح الحفظ)
    try {
      const data: Record<string, unknown> = { ...form }
      delete data.id; delete data.createdAt; delete data.updatedAt
      for (const f of p.fields) {
        if (f.type === 'number') data[f.key] = Number(form[f.key] || 0)
        if (f.type === 'lines') data[f.key] = String(form[f.key] ?? '').split('\n').map((s) => s.trim()).filter(Boolean)
        if (f.type === 'image' && files[f.key]) {
          const up = await uploadImage(p.storageFolder, files[f.key], setProgress)
          uploaded.push(up.path)
          const old = p.initial?.[f.pathKey] as string | undefined
          if (old) stale.push(old)
          data[f.key] = up.url; data[f.pathKey] = up.path
        }
      }
      if (p.initial) await updateItem(p.collection, p.initial.id, data)
      else await createItem(p.collection, { ...data, ...(p.orderable ? { order: p.nextOrder } : {}) })
      await removeImages(stale)     // بعد نجاح حفظ السجل والرابط الجديد فقط
      toast('ok', 'تم الحفظ بنجاح'); p.onSaved()
    } catch (x) {
      await removeImages(uploaded)  // تراجع: لا نترك صوراً يتيمة، والصورة القديمة ما زالت سليمة
      const code = (x as { code?: string }).code
      setErr(code === 'permission-denied' ? 'رفض الخادم الحفظ: تحقق من طول الحقول وصحة الروابط والصلاحيات.' : (x as Error).message || 'تعذر الحفظ. تحقق من الاتصال.')
    } finally { setSaving(false); setProgress(null) }
  }

  return <Modal title={`${p.initial ? 'تعديل' : 'إضافة'} ${p.singular}`} onClose={p.onClose} wide>
    <form onSubmit={submit} className="adm-form">
      {p.fields.map((f) => <label key={f.key} className={`adm-field${f.type === 'textarea' || f.type === 'lines' || f.type === 'image' ? ' full' : ''}`}>
        <span>{f.label}{'required' in f && f.required ? ' *' : ''}</span>
        {f.type === 'text' && <input value={String(form[f.key] ?? '')} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />}
        {f.type === 'number' && <input type="number" min={0} value={String(form[f.key] ?? '')} onChange={(e) => set(f.key, e.target.value)} />}
        {f.type === 'textarea' && <textarea rows={4} value={String(form[f.key] ?? '')} onChange={(e) => set(f.key, e.target.value)} />}
        {f.type === 'lines' && <textarea rows={4} placeholder={f.placeholder ?? 'سطر لكل عنصر'} value={String(form[f.key] ?? '')} onChange={(e) => set(f.key, e.target.value)} />}
        {f.type === 'select' && <select value={String(form[f.key] ?? '')} onChange={(e) => set(f.key, e.target.value)}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>}
        {f.type === 'boolean' && <span className="adm-check"><input type="checkbox" checked={Boolean(form[f.key])} onChange={(e) => set(f.key, e.target.checked)} />{f.hint}</span>}
        {f.type === 'image' && <div className="adm-upload">
          {(files[f.key] || form[f.key]) && <img alt="" src={files[f.key] ? URL.createObjectURL(files[f.key]) : String(form[f.key])} />}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) setFiles((s) => ({ ...s, [f.key]: file })) }} />
        </div>}
      </label>)}
      {progress !== null && <div className="adm-progress full"><i style={{ width: `${progress}%` }} /><b>{progress}%</b></div>}
      {err && <p className="adm-error full" role="alert">{err}</p>}
      <div className="adm-row-end full"><button type="button" className="adm-btn ghost" onClick={p.onClose}>إلغاء</button><button className="adm-btn" disabled={saving}>{saving ? 'جارٍ الحفظ…' : 'حفظ'}</button></div>
    </form>
  </Modal>
}
