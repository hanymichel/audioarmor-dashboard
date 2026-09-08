import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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

    const { data, error } = await supabaseAdmin
      .from('purchase_orders')
      .select(`
        *,
        suppliers (
          id,
          name
        )
      `)
      .order('id', { ascending: false })

    if (error) {
      console.error(
        'GET /api/purchase_orders error:',
        error
      )

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data ?? [], { status: 200 })
  } catch (error) {
    console.error(
      'GET /api/purchase_orders server error:',
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

    const body = await req.json()

    const {
      supplier_id,
      order_date,
      expected_date,
      notes,
      items,
    } = body

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one purchase order item is required.' },
        { status: 400 }
      )
    }

    // Calculate subtotal
    let subtotal = 0

    for (const item of items) {
      const quantity = Number(item.quantity)
      const unitCost = Number(item.unit_cost)

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(unitCost) ||
        unitCost < 0
      ) {
        return NextResponse.json(
          {
            error:
              'Each item must have a valid quantity and unit cost.',
          },
          { status: 400 }
        )
      }

      subtotal += quantity * unitCost
    }

    // Generate purchase order number
    const poNumber = `PO-${Date.now()}`

    // Create purchase order
    const { data: po, error: poError } =
      await supabaseAdmin
        .from('purchase_orders')
        .insert([
          {
            po_number: poNumber,
            supplier_id: supplier_id ?? null,
            order_date: order_date ?? null,
            expected_date: expected_date ?? null,
            status: 'draft',
            subtotal,
            total_amount: subtotal,
            notes: notes?.trim() || null,
          },
        ])
        .select()
        .single()

    if (poError) {
      console.error(
        'Purchase order insert error:',
        poError
      )

      return NextResponse.json(
        { error: poError.message },
        { status: 400 }
      )
    }

    // Prepare purchase order items
    const poItems = items.map((item: any) => ({
      purchase_order_id: po.id,
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      unit_cost: Number(item.unit_cost),
    }))

    // Insert purchase order items
    const { error: itemError } =
      await supabaseAdmin
        .from('purchase_order_items')
        .insert(poItems)

    if (itemError) {
      console.error(
        'Purchase order items insert error:',
        itemError
      )

      // Remove the purchase order if its items failed
      await supabaseAdmin
        .from('purchase_orders')
        .delete()
        .eq('id', po.id)

      return NextResponse.json(
        { error: itemError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        purchase_order: po,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error(
      'POST /api/purchase_orders server error:',
      error
    )

    return NextResponse.json(
      {
        error: error?.message || 'Server error',
      },
      { status: 500 }
    )
  }
}