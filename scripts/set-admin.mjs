// تعيين أول Admin بصلاحية Custom Claim. يعمل محلياً فقط بمفتاح Service Account.
// الاستخدام:
//   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/set-admin.mjs admin@example.com
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const email = process.argv[2]
if (!email) { console.error('استخدم: node scripts/set-admin.mjs <email>'); process.exit(1) }
initializeApp({ credential: applicationDefault() })
const user = await getAuth().getUserByEmail(email)
await getAuth().setCustomUserClaims(user.uid, { admin: true })
console.log(`تم منح صلاحية Admin للمستخدم ${email}. سجّل الخروج والدخول مجدداً.`)
