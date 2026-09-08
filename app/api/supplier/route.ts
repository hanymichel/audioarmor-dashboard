import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

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

    return NextResponse.json(data)
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

export async function PUT(req: Request) {
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

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required.' },
        { status: 400 }
      )
    }

    const body = await req.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('suppliers')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(
        'PUT /api/suppliers error:',
        error
      )

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(
      'PUT /api/suppliers server error:',
      error
    )

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required.' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('suppliers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(
        'DELETE /api/suppliers error:',
        error
      )

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(
      'DELETE /api/suppliers server error:',
      error
    )

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}