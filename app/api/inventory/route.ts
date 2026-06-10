import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type InventoryRow = {
  id: number
  quantity: number
  products: {
    name: string | null
    sku: string | null
  } | null
  warehouses: {
    name: string | null
  } | null
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('inventory')
    .select(
      `
        id,
        quantity,
        products (
          id,
          name,
          sku
        ),
        warehouses (
          id,
          name
        )
      `
    )
    .order('id', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const inventory = ((data ?? []) as InventoryRow[]).map((item) => ({
    id: item.id,
    product: item.products?.name ?? null,
    sku: item.products?.sku ?? null,
    warehouse: item.warehouses?.name ?? null,
    quantity: item.quantity,
  }))

  return NextResponse.json(inventory)
}
