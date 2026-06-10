import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type ProductInput = {
  name?: string
  sku?: string
  category_id?: number | null
  supplier_id?: number | null
  brand?: string | null
  cost_price?: number | string | null
  selling_price?: number | string | null
  barcode?: string | null
  color?: string | null
  description?: string | null
  image_url?: string | null
  low_stock_threshold?: number | string | null
}

function toNullableNumber(value: ProductInput[keyof ProductInput]) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ProductInput

    if (!body.name?.trim() || !body.sku?.trim()) {
      return NextResponse.json(
        { error: 'Product name and SKU are required.' },
        { status: 400 }
      )
    }

    const product = {
      name: body.name.trim(),
      sku: body.sku.trim(),
      category_id: toNullableNumber(body.category_id),
      supplier_id: toNullableNumber(body.supplier_id),
      brand: body.brand?.trim() || null,
      cost_price: toNullableNumber(body.cost_price),
      selling_price: toNullableNumber(body.selling_price),
      barcode: body.barcode?.trim() || null,
      color: body.color?.trim() || null,
      description: body.description?.trim() || null,
      image_url: body.image_url?.trim() || null,
      low_stock_threshold: toNullableNumber(body.low_stock_threshold) ?? 0,
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, product: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}