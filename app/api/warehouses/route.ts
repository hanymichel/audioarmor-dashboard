import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    // Check authenticated user
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    let query = supabaseAdmin
      .from('warehouses')
      .select('id, name, location')
      .order('name', { ascending: true })

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,location.ilike.%${q}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('GET /api/warehouses error:', error)

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data ?? [], { status: 200 })
  } catch (error) {
    console.error('GET /api/warehouses server error:', error)

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Check authenticated user
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()

    const name = String(body?.name ?? '').trim()
    const location = String(body?.location ?? '').trim()

    // Validate warehouse name
    if (!name) {
      return NextResponse.json(
        { error: 'Warehouse name is required.' },
        { status: 400 }
      )
    }

    // Insert warehouse
    const { data, error } = await supabaseAdmin
      .from('warehouses')
      .insert([
        {
          name,
          location,
        },
      ])
      .select('id, name, location')
      .single()

    if (error) {
      console.error('POST /api/warehouses error:', error)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        warehouse: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/warehouses server error:', error)

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}