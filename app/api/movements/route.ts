import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type MovementInput = {
  product_id?: number | string | null
  warehouse_id?: number | string | null
  destination_warehouse_id?: number | string | null
  movement_type?: string | null
  quantity?: number | string | null
  reference_type?: string | null
  notes?: string | null
  entries?: TransferInput[]
}

type TransferInput = {
  sku?: string | null
  from_warehouse_id?: number | string | null
  to_warehouse_id?: number | string | null
  quantity?: number | string | null
}

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

function toNumber(
  value:
    | number
    | string
    | null
    | undefined
) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const numericValue = Number(value)

  return Number.isFinite(numericValue)
    ? numericValue
    : null
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET /api/stock_movements error:', error)

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    const movements = ((data ?? []) as unknown as MovementRow[]).map(
      (movement) => ({
        id: movement.id,
        created_at: movement.created_at,
        product: movement.products?.name ?? null,
        sku: movement.products?.sku ?? null,

        warehouse:
          movement.source_warehouse?.name ?? null,

        destination_warehouse:
          movement.destination_warehouse?.name ?? null,

        warehouse_id: movement.warehouse_id,

        destination_warehouse_id:
          movement.destination_warehouse_id,

        movement_type: movement.movement_type,
        quantity: movement.quantity,
        notes: movement.notes,
        reference_type: movement.reference_type,
      })
    )

    return NextResponse.json(
      movements,
      { status: 200 }
    )
  } catch (error) {
    console.error(
      'GET /api/stock_movements server error:',
      error
    )

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
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

    const body = (await req.json()) as MovementInput

    // Handle stock transfer
    if (Array.isArray(body.entries)) {
      return transferStock(body.entries)
    }

    const productId = toNumber(body.product_id)
    const warehouseId = toNumber(body.warehouse_id)
    const destinationWarehouseId = toNumber(
      body.destination_warehouse_id
    )
    const quantity = toNumber(body.quantity)
    const movementType = body.movement_type?.trim()

    if (
      !productId ||
      !movementType ||
      !quantity ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          error:
            'Product, movement type, and a positive quantity are required.',
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('stock_movements')
      .insert({
        product_id: productId,
        warehouse_id: warehouseId,
        destination_warehouse_id:
          destinationWarehouseId,
        movement_type: movementType,
        reference_type:
          body.reference_type?.trim() || null,
        quantity,
        notes: body.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error(
        'POST /api/stock_movements error:',
        error
      )

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        movement: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(
      'POST /api/stock_movements server error:',
      error
    )

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

async function transferStock(entries: TransferInput[]) {
  if (entries.length === 0) {
    return NextResponse.json(
      {
        error:
          'At least one movement row is required.',
      },
      { status: 400 }
    )
  }

  const completed = []

  for (const [index, entry] of entries.entries()) {
    const sku = entry.sku?.trim()

    const fromWarehouseId = toNumber(
      entry.from_warehouse_id
    )

    const toWarehouseId = toNumber(
      entry.to_warehouse_id
    )

    const quantity = toNumber(entry.quantity)

    if (
      !sku ||
      !fromWarehouseId ||
      !toWarehouseId ||
      !quantity ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          error: `Row ${
            index + 1
          }: SKU, from warehouse, to warehouse, and a positive quantity are required.`,
        },
        { status: 400 }
      )
    }

    if (fromWarehouseId === toWarehouseId) {
      return NextResponse.json(
        {
          error: `Row ${
            index + 1
          }: From and to warehouses must be different.`,
        },
        { status: 400 }
      )
    }

    // Find product by SKU
    const {
      data: product,
      error: productError,
    } = await supabaseAdmin
      .from('products')
      .select('id, name, sku')
      .eq('sku', sku)
      .maybeSingle()

    if (productError) {
      return NextResponse.json(
        { error: productError.message },
        { status: 400 }
      )
    }

    if (!product) {
      return NextResponse.json(
        {
          error: `Row ${
            index + 1
          }: SKU ${sku} was not found.`,
        },
        { status: 404 }
      )
    }

    // Get source inventory
    const {
      data: sourceInventory,
      error: sourceError,
    } = await supabaseAdmin
      .from('inventory')
      .select('id, quantity')
      .eq('product_id', product.id)
      .eq('warehouse_id', fromWarehouseId)
      .maybeSingle()

    if (sourceError) {
      return NextResponse.json(
        { error: sourceError.message },
        { status: 400 }
      )
    }

    if (
      !sourceInventory ||
      sourceInventory.quantity < quantity
    ) {
      return NextResponse.json(
        {
          error: `Row ${
            index + 1
          }: Not enough stock for SKU ${sku} in the source warehouse.`,
        },
        { status: 400 }
      )
    }

    // Get destination inventory
    const {
      data: destinationInventory,
      error: destinationError,
    } = await supabaseAdmin
      .from('inventory')
      .select('id, quantity')
      .eq('product_id', product.id)
      .eq('warehouse_id', toWarehouseId)
      .maybeSingle()

    if (destinationError) {
      return NextResponse.json(
        { error: destinationError.message },
        { status: 400 }
      )
    }

    // Reduce stock from source warehouse
    const {
      error: sourceUpdateError,
    } = await supabaseAdmin
      .from('inventory')
      .update({
        quantity:
          sourceInventory.quantity - quantity,
      })
      .eq('id', sourceInventory.id)

    if (sourceUpdateError) {
      return NextResponse.json(
        { error: sourceUpdateError.message },
        { status: 400 }
      )
    }

    // Add stock to destination warehouse
    if (destinationInventory) {
      const {
        error: destinationUpdateError,
      } = await supabaseAdmin
        .from('inventory')
        .update({
          quantity:
            destinationInventory.quantity + quantity,
        })
        .eq('id', destinationInventory.id)

      if (destinationUpdateError) {
        return NextResponse.json(
          {
            error:
              destinationUpdateError.message,
          },
          { status: 400 }
        )
      }
    } else {
      const {
        error: destinationInsertError,
      } = await supabaseAdmin
        .from('inventory')
        .insert({
          product_id: product.id,
          warehouse_id: toWarehouseId,
          quantity,
        })

      if (destinationInsertError) {
        return NextResponse.json(
          {
            error:
              destinationInsertError.message,
          },
          { status: 400 }
        )
      }
    }

    // Record stock movement
    const {
      data: movement,
      error: movementError,
    } = await supabaseAdmin
      .from('stock_movements')
      .insert({
        product_id: product.id,

        // Source warehouse
        warehouse_id: fromWarehouseId,

        // Destination warehouse
        destination_warehouse_id:
          toWarehouseId,

        movement_type: 'transfer',
        reference_type: null,
        quantity,

        notes: `Transfer from warehouse ${fromWarehouseId} to warehouse ${toWarehouseId}`,
      })
      .select()
      .single()

    if (movementError) {
      return NextResponse.json(
        { error: movementError.message },
        { status: 400 }
      )
    }

    completed.push(movement)
  }

  return NextResponse.json(
    {
      success: true,
      movements: completed,
    },
    { status: 201 }
  )
}