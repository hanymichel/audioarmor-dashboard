import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase";


type ExpenseInput = {
  expense_date: string;
  category: string;
  description?: string;
  amount: string;
  payment_method?: string;
  supplier_id?: string;
};

type ExpensesRow = {
  id: number;
  expense_date: string | null;
  category: string | null;
  description: string | null;
  amount: number | null;
  payment_method: string | null;
  supplier_id: number | null;
  supplier_name: string | null;
};

export async function POST(req: Request) {
  try {
    const {
    data:{user}
}=await supabase.auth.getUser()

if(!user){

return NextResponse.json(
{error:"Unauthorized"},
{status:401}
)

}
    
    const body = (await req.json()) as ExpenseInput;

    if (!body.category?.trim()) {
      return NextResponse.json(
        { error: "Category is required." },
        { status: 400 }
      );
    }

    if (!body.amount || Number(body.amount) <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero." },
        { status: 400 }
      );
    }

    const expense = {
      expense_date:
        body.expense_date ||
        new Date().toISOString().split("T")[0],

      category: body.category.trim(),

      description: body.description?.trim() || null,

      amount: Number(body.amount),

      payment_method: body.payment_method?.trim() || null,

      supplier_id:
        body.supplier_id && body.supplier_id !== ""
          ? Number(body.supplier_id)
          : null,
    };

    const { data, error } = await supabaseAdmin
      .from("expenses")
      .insert([expense])
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        expense: data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("expenses")
    .select(`
      id,
      expense_date,
      category,
      description,
      amount,
      payment_method,
      supplier_id,
      suppliers (
        id,
        name
      )
    `)
    .order("expense_date", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  const expenses: ExpensesRow[] = (data ?? []).map((item: any) => ({
    id: item.id,
    expense_date: item.expense_date,
    category: item.category,
    description: item.description,
    amount: item.amount,
    payment_method: item.payment_method,
    supplier_id: item.supplier_id,
    supplier_name: item.suppliers?.name ?? null,
  }));

  return NextResponse.json(expenses);
}