'use client'
import { createContext, useContext } from 'react'
import { useAsync } from '@/lib/hooks/use-async'
import { isFirebaseConfigured } from '@/lib/firebase/client'
import { emptySiteData, loadSiteData, type SiteData } from '@/lib/services/site-data'

const Ctx = createContext<{ data: SiteData; loading: boolean; error: string | null; reload: () => void }>({ data: emptySiteData, loading: true, error: null, reload: () => {} })
export const useSite = () => useContext(Ctx)

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, error, reload } = useAsync<SiteData>(
    () => isFirebaseConfigured ? loadSiteData() : Promise.reject(new Error('لم يتم ربط Firebase بعد. راجع docs/SETUP.md')), emptySiteData)
  return <Ctx.Provider value={{ data, loading, error, reload }}>{children}</Ctx.Provider>
}
