import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'node_modules/**', 'next-env.d.ts', 'scripts/**', 'tests/**']),
  {
    rules: {
      // الصور المرفوعة تأتي من Firebase Storage بعد ضغطها في المتصفح؛ تحذير فقط
      '@next/next/no-img-element': 'warn',
    },
  },
])
