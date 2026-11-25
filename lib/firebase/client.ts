import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}
const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId && config.storageBucket)

let app: FirebaseApp | null = null
function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new Error('إعدادات Firebase غير مكتملة. راجع ملف .env.local')
  if (!app) {
    const existing = getApps().length > 0
    app = existing ? getApp() : initializeApp(config)
    // App Check اختياري: يُفعَّل تلقائياً عند وجود مفتاح reCAPTCHA v3
    if (!existing && typeof window !== 'undefined' && recaptchaKey) {
      if (process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN) {
        ;(self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN
      }
      initializeAppCheck(app, { provider: new ReCaptchaV3Provider(recaptchaKey), isTokenAutoRefreshEnabled: true })
    }
  }
  return app
}

export const getDb = (): Firestore => getFirestore(getFirebaseApp())
export const getAuthClient = (): Auth => getAuth(getFirebaseApp())
export const getStorageClient = (): FirebaseStorage => getStorage(getFirebaseApp())
