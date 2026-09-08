import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type MovementRow = {
  id: number
  created_at: string
  movement_type: string
  quantity: number
  reference_type: string | null
  notes: string | null
  warehouse_id: number | null
  destination_warehouse_id: number | null
  products: {
    name: string | null
    sku: string | null
  } | null
  source_warehouse: {
    name: string | null
  } | null
  destination_warehouse: {
    name: string | null
  } | null
}

export async function GET() {
  try {
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
      .from('stock_movements')
      .select(`
        id,
        created_at,
        movement_type,
        quantity,
        notes,
        reference_type,
        warehouse_id,
        destination_warehouse_id,

        products (
          id,
          name,
          sku
        ),

        source_warehouse:warehouses!stock_movements_warehouse_id_fkey (
          id,
          name
        ),

        destination_warehouse:warehouses!stock_movements_destination_warehouse_id_fkey (
          id,
          name
        )
      `)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'GET /api/movements error:',
        error
      )

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    const movements = (
      (data ?? []) as unknown as MovementRow[]
    ).map((movement) => ({
      id: movement.id,
      created_at: movement.created_at,

      product:
        movement.products?.name ?? null,

      sku:
        movement.products?.sku ?? null,

      warehouse:
        movement.source_warehouse?.name ?? null,

      destination_warehouse:
        movement.destination_warehouse?.name ?? null,

      warehouse_id:
        movement.warehouse_id,

      destination_warehouse_id:
        movement.destination_warehouse_id,

      movement_type:
        movement.movement_type,

      quantity:
        movement.quantity,

      notes:
        movement.notes,

      reference_type:
        movement.reference_type,
    }))

    return NextResponse.json(
      movements,
      { status: 200 }
    )
  } catch (error) {
    console.error(
      'GET /api/movements server error:',
      error
    )

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}