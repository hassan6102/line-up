'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Activity, CalendarCheck, HelpCircle, Image as ImageIcon, LayoutDashboard, LogOut, Menu, MessageSquareQuote, Settings, Stethoscope, Tag, FileText, ClipboardList, ExternalLink } from 'lucide-react'
import { AuthGate, useAdminUser } from './auth-gate'
import { ToastProvider } from './ui'
import { signOutAdmin } from '@/lib/services/auth'

const nav = [
  { href: '/admin', label: 'نظرة عامة', icon: LayoutDashboard }, { href: '/admin/bookings', label: 'الحجوزات', icon: CalendarCheck },
  { href: '/admin/doctors', label: 'الأطباء', icon: Stethoscope }, { href: '/admin/services', label: 'الخدمات', icon: ClipboardList },
  { href: '/admin/packages', label: 'الأسعار والباقات', icon: Tag }, { href: '/admin/testimonials', label: 'آراء العملاء', icon: MessageSquareQuote },
  { href: '/admin/gallery', label: 'معرض الصور', icon: ImageIcon }, { href: '/admin/faqs', label: 'الأسئلة الشائعة', icon: HelpCircle },
  { href: '/admin/content', label: 'محتوى الموقع', icon: FileText }, { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
]

function Frame({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const router = useRouter(); const user = useAdminUser()
  const [open, setOpen] = useState(false); const [menu, setMenu] = useState(false)
  const current = nav.find((n) => n.href === path)
  return <div className="adm">
    <aside className={`adm-side${open ? ' open' : ''}`}>
      <div className="adm-brand"><span><Activity size={20} /></span><div>Line Up<small>لوحة التحكم</small></div></div>
      <nav>{nav.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={path === n.href ? 'active' : ''}><n.icon size={18} />{n.label}</Link>)}</nav>
      <Link href="/" target="_blank" className="adm-visit"><ExternalLink size={16} /> عرض الموقع</Link>
    </aside>
    {open && <div className="adm-backdrop" onClick={() => setOpen(false)} />}
    <div className="adm-main">
      <header className="adm-top">
        <button className="adm-icon-btn adm-burger" onClick={() => setOpen(true)} aria-label="القائمة"><Menu size={20} /></button>
        <strong>{current?.label ?? 'لوحة التحكم'}</strong>
        <div className="adm-profile">
          <button className="adm-avatar" onClick={() => setMenu(!menu)} aria-label="الحساب">{(user?.email ?? 'A')[0].toUpperCase()}</button>
          {menu && <div className="adm-dropdown"><span dir="ltr">{user?.email}</span>
            <button onClick={async () => { await signOutAdmin(); router.replace('/admin/login') }}><LogOut size={15} /> تسجيل الخروج</button></div>}
        </div>
      </header>
      <main className="adm-content">{children}</main>
    </div>
  </div>
}
export function AdminShell({ children }: { children: React.ReactNode }) {
  return <ToastProvider><AuthGate><AdminFrameOrBare>{children}</AdminFrameOrBare></AuthGate></ToastProvider>
}
function AdminFrameOrBare({ children }: { children: React.ReactNode }) {
  return usePathname() === '/admin/login' ? <>{children}</> : <Frame>{children}</Frame>
}
