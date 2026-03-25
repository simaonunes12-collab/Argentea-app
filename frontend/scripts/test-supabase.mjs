import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.resolve(__dirname, '..', '.env.local')
const envRaw = fs.readFileSync(envPath, 'utf8')

const env = Object.fromEntries(
  envRaw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [key, ...rest] = line.split('=')
      return [key.trim(), rest.join('=').trim()]
    }),
)

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function main() {
  // We test a password reset request, which verifies connectivity
  // without creating any permanent data tied to a real user.
  const testEmail = 'connectivity-test@example.com'

  console.log('Testing Supabase resetPasswordForEmail with', testEmail)

  const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
    redirectTo: 'https://example.com/reset-complete',
  })

  if (error) {
    console.error('Supabase connection/auth test FAILED:', error.message)
    process.exit(1)
  }

  console.log('Supabase connection/auth test OK. Response:', data)
}

main().catch((err) => {
  console.error('Unexpected error during Supabase test:', err)
  process.exit(1)
})

