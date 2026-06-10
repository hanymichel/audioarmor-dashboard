import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {

  const { searchParams } =
    new URL(request.url)

  const q =
    searchParams.get("q") || ""

  const { data, error } =
    await supabase
      .from("products")
      .select("id, sku, name")
      .or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
      .limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}