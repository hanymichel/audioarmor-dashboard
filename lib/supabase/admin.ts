import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const configuredServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
const serviceRoleKey = configuredServiceKey?.startsWith('eyJ')
  ? configuredServiceKey
  : undefined
const apiKey =
  serviceRoleKey ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !apiKey) {
  throw new Error('Missing Supabase server environment variables')
}

export const supabaseAdmin = createClient(supabaseUrl, apiKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
