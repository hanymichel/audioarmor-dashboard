import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''

  const query = supabaseAdmin
    .from('warehouses')
    .select('id, name, location')
    .order('name', { ascending: true })

  if (q) {
    query.or(`name.ilike.%${q}%,location.ilike.%${q}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const body = await request.json()
  const name = String(body?.name ?? '').trim()
  const location = String(body?.location ?? '').trim()

  if (!name) {
    return NextResponse.json({ error: 'Warehouse name is required.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('warehouses')
    .insert([{ name, location }])
    .select('id, name, location')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
