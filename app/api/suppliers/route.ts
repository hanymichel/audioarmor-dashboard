import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type SupplierInput = {
  name?: string
  contact_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  tax_number?: string
  notes?: string
  
}

function toNullableNumber(value: SupplierInput[keyof SupplierInput]) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SupplierInput

    if (!body.name?.trim() || !body.contact_name?.trim()) {
      return NextResponse.json(
        { error: 'Supplier name and contact name are required.' },
        { status: 400 }
      )
    }

    const supplier = {
      name: body.name.trim(),
      contact_name: body.contact_name.trim(),
      email: body.email?.trim(),
      phone: body.phone?.trim(),
      address: body.address?.trim(),
      city: body.city?.trim(),
      country: body.country?.trim(),
      tax_number: body.tax_number?.trim(),
      notes: body.notes?.trim()
    }

    const { data, error } = await supabaseAdmin
      .from('suppliers')
      .insert(supplier)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, supplier: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}