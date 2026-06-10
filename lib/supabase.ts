// lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Global variable to persist the instance across hot-reloads
const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined
}

export const supabase =
  globalForSupabase.supabase ?? createClient(supabaseUrl, supabaseKey)

// In development, save the client to globalThis so it isn't recreated
if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase
}