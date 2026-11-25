'use client'
import { createContext, useCallback, useContext, useState } from 'react'
import { X } from 'lucide-react'

type Toast = { id: number; type: 'ok' | 'err'; text: string }
const ToastCtx = createContext<(type: Toast['type'], text: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = useCallback((type: Toast['type'], text: string) => {
    const id = Date.now() + Math.random()
    setItems((s) => [...s, { id, type, text }])
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4000)
  }, [])
  return <ToastCtx.Provider value={push}>{children}<div className="adm-toasts">{items.map((t) => <div key={t.id} className={`adm-toast ${t.type}`}>{t.text}</div>)}</div></ToastCtx.Provider>
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return <div className="adm-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className={`adm-modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="adm-modal-head"><h3>{title}</h3><button className="adm-icon-btn" onClick={onClose} aria-label="إغلاق"><X size={18} /></button></div>
      <div className="adm-modal-body">{children}</div>
    </div></div>
}

export function ConfirmDialog({ text, onConfirm, onCancel, busy }: { text: string; onConfirm: () => void; onCancel: () => void; busy?: boolean }) {
  return <Modal title="تأكيد الحذف" onClose={onCancel}>
    <p style={{ margin: '0 0 20px', lineHeight: 1.9 }}>{text}</p>
    <div className="adm-row-end"><button className="adm-btn ghost" onClick={onCancel}>إلغاء</button><button className="adm-btn danger" disabled={busy} onClick={onConfirm}>{busy ? 'جارٍ الحذف…' : 'نعم، احذف'}</button></div>
  </Modal>
}

export function State({ loading, error, empty, emptyText, onRetry }: { loading: boolean; error: string | null; empty?: boolean; emptyText?: string; onRetry?: () => void }) {
  if (loading) return <div className="adm-state">جارٍ التحميل…</div>
  if (error) return <div className="adm-state err">{error}{onRetry && <button className="adm-btn ghost" onClick={onRetry}>إعادة المحاولة</button>}</div>
  if (empty) return <div className="adm-state">{emptyText ?? 'لا توجد بيانات بعد.'}</div>
  return null
}
export function PageHead({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return <div className="adm-pagehead"><div><h1>{title}</h1>{desc && <p>{desc}</p>}</div>{action}</div>
}
