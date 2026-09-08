import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type InventoryRow = {
  id: number
  quantity: number
  products: {
    name: string | null
    sku: string | null
    cost_price: number | null
  } | null
  warehouses: {
    name: string | null
  } | null
}

export async function GET() {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Check logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get inventory with product and warehouse information
    const { data, error } = await supabaseAdmin
      .from('inventory')
      .select(`
        id,
        quantity,
        products (
          id,
          name,
          sku,
          cost_price
        ),
        warehouses (
          id,
          name
        )
      `)
      .order('id', { ascending: true })

    if (error) {
      console.error('GET /api/inventory error:', error)

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    const inventory = ((data ?? []) as unknown as InventoryRow[]).map(
      (item) => ({
        id: item.id,
        product: item.products?.name ?? null,
        sku: item.products?.sku ?? null,
        warehouse: item.warehouses?.name ?? null,
        quantity: item.quantity,
        cost_price: Number(item.products?.cost_price ?? 0),
      })
    )

    return NextResponse.json(inventory, { status: 200 })

  } catch (error) {
    console.error('GET /api/inventory server error:', error)

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}