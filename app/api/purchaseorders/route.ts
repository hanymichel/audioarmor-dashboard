import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select(`
      *,
      suppliers (
        id,
        name
      )
    `)
    .order("id", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      supplier_id,
      order_date,
      expected_date,
      notes,
      items
    } = body

    let subtotal = 0

    for (const item of items) {
      subtotal +=
        Number(item.quantity) *
        Number(item.unit_cost)
    }

    const poNumber =
      "PO-" +
      Date.now().toString()

    const { data: po, error: poError } =
      await supabase
        .from("purchase_orders")
        .insert([
          {
            po_number: poNumber,
            supplier_id,
            order_date,
            expected_date,
            status: "draft",
            subtotal,
            total_amount: subtotal,
            notes
          }
        ])
        .select()
        .single()

    if (poError) {
      return NextResponse.json(
        { error: poError.message },
        { status: 400 }
      )
    }

    const poItems = items.map(
      (item: any) => ({
        purchase_order_id: po.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost
      })
    )

    const { error: itemError } =
      await supabase
        .from("purchase_order_items")
        .insert(poItems)

    if (itemError) {
      return NextResponse.json(
        { error: itemError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      purchase_order: po
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}