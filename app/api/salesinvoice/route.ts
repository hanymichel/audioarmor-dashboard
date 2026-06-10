import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
)

type sales_invoicesInput = {
  invoice_number: string
  customer_id: string
  invoice_date: string
  subtotal: string
  discount: string
  tax: string
  shipping: string
  total_amount: string
  description: string
  payment_status: string
  notes: string
} 

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('sales_invoices')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as sales_invoicesInput

    if (!body.invoice_number?.trim() || !body.customer_id?.trim()) {
      return NextResponse.json(
        { error: 'Invoice number and customer ID are required.' },
        { status: 400 }
      )
    }

    const sales_invoices = {
      invoice_number: body.invoice_number.trim(),
      customer_id: body.customer_id.trim(),
      invoice_date: body.invoice_date || new Date().toISOString().split("T")[0],
      subtotal: body.subtotal ? Number(body.subtotal) : null,
      discount: body.discount ? Number(body.discount) : null,
      tax: body.tax ? Number(body.tax) : null,
      shipping: body.shipping ? Number(body.shipping) : null,
      total_amount: body.total_amount ? Number(body.total_amount) : null,
      description: body.description?.trim() || null,
      payment_status: body.payment_status?.trim() || 'pending',
      notes: body.notes?.trim() || null,
    }

    const { data, error } = await supabaseAdmin
      .from('sales_invoices')
      .insert([sales_invoices])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, sales_invoices: data }, { status: 201 })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('POST /api/sales_invoices error:', error);
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}