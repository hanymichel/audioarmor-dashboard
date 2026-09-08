import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type SupplierInput = {
  name?: string
  contact_name?: string
  phone?: string
  email?: string
  address?: string
  country?: string
  notes?: string
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

    // Get suppliers
    const { data, error } = await supabaseAdmin
      .from('suppliers')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error(
        'GET /api/suppliers error:',
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
      'GET /api/suppliers server error:',
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
    const body = (await req.json()) as SupplierInput

    // Validate required fields
    if (
      !body.name?.trim() ||
      !body.contact_name?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            'Supplier name and contact name are required.',
        },
        { status: 400 }
      )
    }

    // Prepare supplier data
    const supplier = {
      name: body.name.trim(),
      contact_name: body.contact_name.trim(),
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      address: body.address?.trim() || null,
      country: body.country?.trim() || null,
      notes: body.notes?.trim() || null,
    }

    // Insert supplier
    const {
      data,
      error,
    } = await supabaseAdmin
      .from('suppliers')
      .insert(supplier)
      .select()
      .single()

    if (error) {
      console.error(
        'POST /api/suppliers insert error:',
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
        supplier: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(
      'POST /api/suppliers server error:',
      error
    )

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}