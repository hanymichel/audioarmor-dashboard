import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type SalesInvoicesInput = {
  customer_id: string
  invoice_date: string
  subtotal: string
  discount: string
  tax: string
  shipping: string
  total_amount: string
  payment_status: string
  notes: string
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

    const body = (await req.json()) as SalesInvoicesInput

    // Validate customer
    if (!body.customer_id?.trim()) {
      return NextResponse.json(
        { error: 'Customer is required.' },
        { status: 400 }
      )
    }

    // Get customer name
    const {
      data: customer,
      error: customerError,
    } = await supabaseAdmin
      .from('customers')
      .select('customer_name')
      .eq('id', body.customer_id)
      .single()

    if (customerError || !customer) {
      console.error(
        'Customer lookup error:',
        customerError
      )

      return NextResponse.json(
        { error: 'Customer not found.' },
        { status: 400 }
      )
    }

    // Create customer initials
    const initials = customer.customer_name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(
        (word: string) =>
          word[0]?.toUpperCase() ?? ''
      )
      .join('')

    if (!initials) {
      return NextResponse.json(
        { error: 'Customer name is invalid.' },
        { status: 400 }
      )
    }

    // Invoice date
    const invoiceDate =
      body.invoice_date ||
      new Date().toISOString().split('T')[0]

    // Convert YYYY-MM-DD to YYYYMMDD
    const datePart = invoiceDate.replace(/-/g, '')

    // Example:
    // John Smith + 2026-09-01
    // becomes JS-20260901
    const prefix = `${initials}-${datePart}`

    // Find invoices using the same customer/date prefix
    const {
      data: existing,
      error: existingError,
    } = await supabaseAdmin
      .from('sales_invoices')
      .select('invoice_number')
      .like('invoice_number', `${prefix}%`)

    if (existingError) {
      console.error(
        'Existing invoice lookup error:',
        existingError
      )

      return NextResponse.json(
        { error: existingError.message },
        { status: 400 }
      )
    }

    // Generate invoice number
    //
    // First invoice:
    // JS-20260901
    //
    // Second invoice:
    // JS-20260901-1
    //
    // Third invoice:
    // JS-20260901-2
    let invoiceNumber = prefix

    if (existing && existing.length > 0) {
      invoiceNumber = `${prefix}-${existing.length}`
    }

    // Prepare sales invoice
    const salesInvoice = {
      invoice_number: invoiceNumber,
      customer_id: body.customer_id,
      invoice_date: invoiceDate,

      subtotal:
        body.subtotal !== ''
          ? Number(body.subtotal)
          : null,

      discount:
        body.discount !== ''
          ? Number(body.discount)
          : 0,

      tax:
        body.tax !== ''
          ? Number(body.tax)
          : 0,

      shipping:
        body.shipping !== ''
          ? Number(body.shipping)
          : 0,

      total_amount:
        body.total_amount !== ''
          ? Number(body.total_amount)
          : null,

      payment_status:
        body.payment_status || 'pending',

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
        'Sales invoice insert error:',
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
        sales_invoice: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(
      'POST /api/salesinvoices server error:',
      error
    )

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}