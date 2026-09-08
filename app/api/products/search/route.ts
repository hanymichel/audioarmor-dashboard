import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)

    const q = searchParams.get('q') || ''

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, sku, name')
      .or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
      .limit(10)

    if (error) {
      console.error(
        'GET /api/products/search error:',
        error
      )

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      data ?? [],
      { status: 200 }
    )
  } catch (error) {
    console.error(
      'GET /api/products/search server error:',
      error
    )

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}