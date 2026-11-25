import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/shell'
import './admin.css'

export const metadata: Metadata = { title: 'لوحة التحكم | Line Up', robots: { index: false, follow: false } }
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <AdminShell>{children}</AdminShell> }
