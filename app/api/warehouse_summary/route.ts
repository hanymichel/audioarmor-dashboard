import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type WarehouseInput = {
  id?: string
  name?: string
  sku_count?: number | null
  total_units?: number | null
  inventory_value?: number | null
}

export async function GET() {
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

  const { data, error } = await supabaseAdmin
    .from('warehouse_summary')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
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

  try {
    const body = (await req.json()) as WarehouseInput

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Warehouse name is required.' },
        { status: 400 }
      )
    }

    if (
      body.sku_count === undefined ||
      body.sku_count === null
    ) {
      return NextResponse.json(
        { error: 'SKU count is required.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('warehouse_summary')
      .insert({
        name: body.name.trim(),
        sku_count: body.sku_count,
        total_units: body.total_units ?? 0,
        inventory_value: body.inventory_value ?? 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
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
    console.error('POST /api/warehouse_summary error:', error)

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}