'use client'
import { useState } from 'react'
import { Activity } from 'lucide-react'
import { authMessage, signIn } from '@/lib/services/auth'
import { isFirebaseConfigured } from '@/lib/firebase/client'
import { useAuthStatus } from '@/components/admin/auth-gate'

function Form() {
  const status = useAuthStatus()
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('')
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true)
    try { await signIn(email.trim(), pw) } catch (x) { setErr(authMessage(x)) } finally { setBusy(false) }
  }
  return <div className="adm-login"><form onSubmit={submit} className="adm-login-card">
    <div className="adm-brand dark"><span><Activity size={22} /></span><div>Line Up<small>لوحة التحكم</small></div></div>
    <h1>تسجيل دخول الإدارة</h1>
    {!isFirebaseConfigured && <p className="adm-error">إعدادات Firebase غير موجودة. أنشئ ملف .env.local حسب docs/SETUP.md</p>}
    <label className="adm-field"><span>البريد الإلكتروني</span><input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label>
    <label className="adm-field"><span>كلمة المرور</span><input type="password" dir="ltr" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required /></label>
    {status === 'denied' && !err && <p className="adm-error" role="alert">هذا الحساب لا يملك صلاحية الإدارة (لم يُمنح claim «admin»).</p>}
    {status === 'error' && !err && <p className="adm-error" role="alert">تعذر التحقق من الصلاحيات. تحقق من الاتصال وحاول مجدداً.</p>}
    {err && <p className="adm-error" role="alert">{err}</p>}
    <button className="adm-btn block" disabled={busy || !isFirebaseConfigured}>{busy ? 'جارٍ الدخول…' : 'دخول'}</button>
  </form></div>
}
export default function Page() { return <Form /> }
