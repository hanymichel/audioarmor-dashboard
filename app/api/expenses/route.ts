import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type ExpenseInput = {
  expense_date: string
  category: string
  description?: string
  amount: string
  payment_method?: string
  supplier_id?: string
  created_by?: string
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ExpenseInput

    if (!body.expense_date?.trim() || !body.category?.trim()) {
      return NextResponse.json(
        { error: 'Expense date and category are required.' },
        { status: 400 }
      )
    }

    const parseNumberField = (value: string | undefined) => {
      if (value === undefined || value === null || value === '') return null
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : null
    }

    const amount = parseNumberField(body.amount)

    if (amount === null) {
      return NextResponse.json(
        { error: 'Amount is required and must be a valid number.' },
        { status: 400 }
      )
    }

    const supplier_id = body.supplier_id ? parseNumberField(body.supplier_id) : null

    const expense = {
      expense_date: body.expense_date.trim(),
      category: body.category.trim(),
      description: body.description?.trim() || null,
      amount,
      payment_method: body.payment_method?.trim() || null,
      supplier_id,
      created_by: body.created_by?.trim() || null,
    }

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert([expense])
      .select()
      .single()

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('POST /api/expenses insert error:', error)
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, expense: data }, { status: 201 })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('POST /api/expenses error:', error)
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
