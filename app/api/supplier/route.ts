import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const id = searchParams.get("id")

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url)

  const id = searchParams.get("id")

  const body = await req.json()

  const { data, error } = await supabase
    .from("suppliers")
    .update(body)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)

  const id = searchParams.get("id")

  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true
  })
}