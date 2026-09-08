import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type SalesInvoicesInput = {
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
  try {
    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from('sales_invoices')
      .select('*')
      .order('id', { ascending: true })

    if (invoicesError) {
      console.error(
        'GET /api/salesinvoices invoices error:',
        invoicesError.message
      )

      return NextResponse.json(
        { error: invoicesError.message },
        { status: 400 }
      )
    }

    const { data: customers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('id, customer_name')

    if (customersError) {
      console.error(
        'GET /api/salesinvoices customers error:',
        customersError.message
      )

      return NextResponse.json(
        { error: customersError.message },
        { status: 400 }
      )
    }

    const customerMap = new Map(
      (customers || []).map((customer) => [
        String(customer.id),
        customer.customer_name,
      ])
    )

    const result = (invoices || []).map((invoice) => ({
      ...invoice,
      customer_name:
        customerMap.get(String(invoice.customer_id)) ||
        'Unknown Customer',
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/salesinvoices error:', error)

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SalesInvoicesInput

    if (!body.invoice_number?.trim() || !body.customer_id?.trim()) {
      return NextResponse.json(
        { error: 'Invoice number and customer ID are required.' },
        { status: 400 }
      )
    }

    const parseNumberField = (value: string | undefined) => {
      if (value === undefined || value === null || value === '') {
        return null
      }

      const parsed = Number(value)

      return Number.isFinite(parsed) ? parsed : null
    }

    const subtotal = parseNumberField(body.subtotal)
    const discount = parseNumberField(body.discount)
    const tax = parseNumberField(body.tax)
    const shipping = parseNumberField(body.shipping)
    const totalAmount = parseNumberField(body.total_amount)

    const computedTotal =
      subtotal !== null
        ? subtotal -
          (subtotal * (discount ?? 0)) / 100 +
          ((subtotal - (subtotal * (discount ?? 0)) / 100) *
            (tax ?? 0)) /
            100 +
          (shipping ?? 0)
        : null

    const salesInvoice = {
      invoice_number: body.invoice_number.trim(),
      customer_id: body.customer_id.trim(),
      invoice_date:
        body.invoice_date?.trim() ||
        new Date().toISOString().split('T')[0],
      subtotal,
      discount,
      tax,
      shipping,
      total_amount: totalAmount ?? computedTotal,
      description: body.description?.trim() || null,
      payment_status: body.payment_status?.trim() || 'pending',
      notes: body.notes?.trim() || null,
    }

    if (salesInvoice.total_amount === null) {
      return NextResponse.json(
        {
          error:
            'Total amount is required and could not be determined.',
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('sales_invoices')
      .insert([salesInvoice])
      .select()
      .single()

    if (error) {
      console.error(
        'POST /api/salesinvoices insert error:',
        error.message
      )

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        sales_invoices: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/salesinvoices error:', error)

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}