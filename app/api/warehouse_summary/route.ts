import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type WarehouseInput = {
  id?: string
  name?: string
  sku_count?: number | null
  total_units?: number | null
  inventory_value?: number | null
}

function toNullableNumber(value: WarehouseInput[keyof WarehouseInput]) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('warehouse_summary')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WarehouseInput

    if (!body.name?.trim() || !body.sku_count?.toString().trim()) {
      return NextResponse.json(
        { error: 'Warehouse name and SKU count are required.' },
        { status: 400 }
      )
    }


    const { data, error } = await supabaseAdmin
      .from('warehouse_summary')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, warehouse: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}