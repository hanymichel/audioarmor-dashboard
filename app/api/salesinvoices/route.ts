import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

function parseNumberField(
  value: string | number | null | undefined
) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
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

    // Get sales invoices
    const { data, error } = await supabaseAdmin
      .from('sales_invoices')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error(
        'GET /api/salesinvoices error:',
        error
      )

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      data ?? [],
      { status: 200 }
    )
  } catch (error) {
    console.error(
      'GET /api/salesinvoices server error:',
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

    // Read request body
    const body = (await req.json()) as SalesInvoicesInput

    // Validate required fields
    if (
      !body.invoice_number?.trim() ||
      !body.customer_id?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            'Invoice number and customer ID are required.',
        },
        { status: 400 }
      )
    }

    // Parse numeric fields
    const subtotal = parseNumberField(body.subtotal)
    const discount = parseNumberField(body.discount)
    const tax = parseNumberField(body.tax)
    const shipping = parseNumberField(body.shipping)
    const totalAmount = parseNumberField(
      body.total_amount
    )

    // Calculate total if one was not provided
    const discountedSubtotal =
      subtotal !== null
        ? subtotal -
          (subtotal * (discount ?? 0)) / 100
        : null

    const computedTotal =
      discountedSubtotal !== null
        ? discountedSubtotal +
          (discountedSubtotal * (tax ?? 0)) / 100 +
          (shipping ?? 0)
        : null

    const finalTotal =
      totalAmount ?? computedTotal

    // Total must exist
    if (finalTotal === null) {
      return NextResponse.json(
        {
          error:
            'Total amount is required and could not be determined.',
        },
        { status: 400 }
      )
    }

    // Prepare invoice
    const salesInvoice = {
      invoice_number:
        body.invoice_number.trim(),

      customer_id:
        body.customer_id.trim(),

      invoice_date:
        body.invoice_date?.trim() ||
        new Date().toISOString().split('T')[0],

      subtotal,
      discount: discount ?? 0,
      tax: tax ?? 0,
      shipping: shipping ?? 0,
      total_amount: finalTotal,

      description:
        body.description?.trim() || null,

      payment_status:
        body.payment_status?.trim() ||
        'pending',

      notes:
        body.notes?.trim() || null,
    }

    // Insert invoice
    const {
      data,
      error,
    } = await supabaseAdmin
      .from('sales_invoices')
      .insert([salesInvoice])
      .select()
      .single()

    if (error) {
      console.error(
        'POST /api/salesinvoices insert error:',
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
        sales_invoices: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(
      'POST /api/salesinvoices error:',
      error
    )

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}