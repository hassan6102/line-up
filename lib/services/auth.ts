import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { getAuthClient } from '@/lib/firebase/client'

export const signIn = (email: string, password: string) => signInWithEmailAndPassword(getAuthClient(), email, password)
export const signOutAdmin = () => signOut(getAuthClient())
export const watchAuth = (cb: (u: User | null) => void) => onAuthStateChanged(getAuthClient(), cb)

// الصلاحية من Custom Claim (admin: true) موقّعة من Firebase ولا يمكن للزائر تعديلها
export async function isAdmin(user: User): Promise<boolean> {
  const token = await user.getIdTokenResult(true)
  return token.claims.admin === true
}
export function authMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(code)) return 'البريد أو كلمة المرور غير صحيحة.'
  if (code === 'auth/too-many-requests') return 'محاولات كثيرة. حاول لاحقاً.'
  return 'تعذر تسجيل الدخول.'
}
