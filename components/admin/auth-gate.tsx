'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from 'firebase/auth'
import { isFirebaseConfigured } from '@/lib/firebase/client'
import { isAdmin, signOutAdmin, watchAuth } from '@/lib/services/auth'

export type AuthStatus = 'loading' | 'ok' | 'out' | 'denied' | 'error' | 'unconfigured'
const Ctx = createContext<{ user: User | null; status: AuthStatus }>({ user: null, status: 'loading' })
export const useAdminUser = () => useContext(Ctx).user
export const useAuthStatus = () => useContext(Ctx).status

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const path = usePathname()
  const [state, setState] = useState<{ user: User | null; status: AuthStatus }>({ user: null, status: isFirebaseConfigured ? 'loading' : 'unconfigured' })
  const isLogin = path === '/admin/login'

  useEffect(() => {
    if (!isFirebaseConfigured) return
    let cancelled = false
    const unsub = watchAuth(async (u) => {
      if (!u) { if (!cancelled) setState((s) => ({ user: null, status: s.status === 'denied' ? 'denied' : 'out' })); return }
      try {
        if (await isAdmin(u)) { if (!cancelled) setState({ user: u, status: 'ok' }) }
        else { await signOutAdmin(); if (!cancelled) setState({ user: null, status: 'denied' }) }
      } catch { if (!cancelled) setState({ user: null, status: 'error' }) }
    })
    return () => { cancelled = true; unsub() }
  }, [])

  // التوجيه بعد تحديد الحالة
  useEffect(() => {
    if (state.status === 'ok' && isLogin) router.replace('/admin')
    if ((state.status === 'out' || state.status === 'denied') && !isLogin) router.replace('/admin/login')
  }, [state.status, isLogin, router])

  const value = <Ctx.Provider value={state}>{children}</Ctx.Provider>
  if (isLogin) return value                       // صفحة الدخول تعرض الحالة بنفسها (denied / unconfigured / error)
  if (state.status === 'ok') return value
  if (state.status === 'unconfigured') return <div className="adm-center" role="alert">إعدادات Firebase غير موجودة. أنشئ ملف .env.local حسب docs/SETUP.md ثم أعد تشغيل الخادم.</div>
  if (state.status === 'error') return <div className="adm-center" role="alert">تعذر التحقق من الصلاحيات (مشكلة اتصال). حدّث الصفحة وحاول مجدداً.</div>
  return <div className="adm-center">جارٍ التحقق من الصلاحيات…</div>
}
