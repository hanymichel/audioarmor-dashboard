import { NextResponse } from 'next/server'
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
  destination_warehouse_id?: number | string | null // This field is not needed for transfer but included to match the structure of MovementInput
  movement_type?: string | null // This field is not needed for transfer but included to match the structure of MovementInput  
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
  warehouses: {
    name: string | null
  } | null
}

function toNumber(value: MovementInput[keyof MovementInput]) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('stock_movements')
    .select(
      `
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
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const movements = (((data ?? []) as unknown) as MovementRow[]).map((movement) => ({
    id: movement.id,
    created_at: movement.created_at,
    product: movement.products?.name ?? null,
    sku: movement.products?.sku ?? null,
    warehouse: movement.warehouses?.name ?? null,
    warehouse_id: movement.warehouse_id,
    destination_warehouse_id: movement.destination_warehouse_id,
    movement_type: movement.movement_type,
    quantity: movement.quantity,
    notes: movement.notes,
    reference_type: movement.reference_type,
  }))

  return NextResponse.json(movements)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MovementInput

    if (Array.isArray(body.entries)) {
      return transferStock(body.entries)
    }

    const productId = toNumber(body.product_id)
    const warehouseId = toNumber(body.warehouse_id)
    const destinationWarehouseId = toNumber(body.destination_warehouse_id)
    const quantity = toNumber(body.quantity)
    const movementType = body.movement_type?.trim()

    if (!productId || !movementType || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Product, movement type, and a positive quantity are required.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('stock_movements')
      .insert({
        product_id: productId,
        warehouse_id: warehouseId,
        movement_type: movementType,
        reference_type: body.reference_type?.trim() || null,
        quantity,
        notes: body.notes?.trim() || null,
        destination_warehouse_id: destinationWarehouseId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, movement: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function transferStock(entries: TransferInput[]) {
  if (entries.length === 0) {
    return NextResponse.json({ error: 'At least one movement row is required.' }, { status: 400 })
  }

  const completed = []

  for (const [index, entry] of entries.entries()) {
    const sku = entry.sku?.trim()
    const fromWarehouseId = toNumber(entry.from_warehouse_id)
    const toWarehouseId = toNumber(entry.to_warehouse_id)
    const quantity = toNumber(entry.quantity)
    const destinationWarehouseId = toNumber(entry.destination_warehouse_id)

    if (!sku || !fromWarehouseId || !toWarehouseId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: `Row ${index + 1}: SKU, from warehouse, to warehouse, and a positive quantity are required.` },
        { status: 400 }
      )
    }

    if (fromWarehouseId === toWarehouseId) {
      return NextResponse.json(
        { error: `Row ${index + 1}: From and to warehouses must be different.` },
        { status: 400 }
      )
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, sku')
      .eq('sku', sku)
      .maybeSingle()

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 400 })
    }

    if (!product) {
      return NextResponse.json({ error: `Row ${index + 1}: SKU ${sku} was not found.` }, { status: 404 })
    }

    const { data: sourceInventory, error: sourceError } = await supabaseAdmin
      .from('inventory')
      .select('id, quantity')
      .eq('product_id', product.id)
      .eq('warehouse_id', fromWarehouseId)
      .eq(destinationWarehouseId ? 'warehouse_id' : 'warehouse_id', destinationWarehouseId ? [fromWarehouseId, toWarehouseId] : fromWarehouseId)
      .maybeSingle()

    if (sourceError) {
      return NextResponse.json({ error: sourceError.message }, { status: 400 })
    }

    if (!sourceInventory || sourceInventory.quantity < quantity) {
      return NextResponse.json(
        { error: `Row ${index + 1}: Not enough stock for SKU ${sku} in the source warehouse.` },
        { status: 400 }
      )
    }

    const { data: destinationInventory, error: destinationError } = await supabaseAdmin
      .from('inventory')
      .select('id, quantity')
      .eq('product_id', product.id)
      .eq('warehouse_id', toWarehouseId)
      .eq(destinationWarehouseId ? 'warehouse_id' : 'warehouse_id', destinationWarehouseId ? [fromWarehouseId, toWarehouseId] : toWarehouseId)
      .maybeSingle()

    if (destinationError) {
      return NextResponse.json({ error: destinationError.message }, { status: 400 })
    }

    const { error: sourceUpdateError } = await supabaseAdmin
      .from('inventory')
      .update({ quantity: sourceInventory.quantity - quantity })
      .eq('id', sourceInventory.id)

    if (sourceUpdateError) {
      return NextResponse.json({ error: sourceUpdateError.message }, { status: 400 })
    }

    if (destinationInventory) {
      const { error } = await supabaseAdmin
        .from('inventory')
        .update({ quantity: destinationInventory.quantity + quantity })
        .eq('id', destinationInventory.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    } else {
      const { error } = await supabaseAdmin
        .from('inventory')
        .insert({
          product_id: product.id,
          warehouse_id: toWarehouseId,
          destination_warehouse_id: destinationWarehouseId,
          quantity,
        })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    const { data: movement, error: movementError } = await supabaseAdmin
      .from('stock_movements')
      .insert({
        product_id: product.id,
        warehouse_id: toWarehouseId,
        destination_warehouse_id: destinationWarehouseId,
        movement_type: 'transfer',
        reference_type: null,
        quantity,
        notes: `Transfer from warehouse ${fromWarehouseId} to warehouse ${toWarehouseId}`,
      })
      .select()
      .single()
      
    if (movementError) {
      return NextResponse.json({ error: movementError.message }, { status: 400 })
    }

    completed.push(movement)
  }

  return NextResponse.json({ success: true, movements: completed }, { status: 201 })
}