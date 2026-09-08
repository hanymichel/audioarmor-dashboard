'use client'

import { useEffect, useState } from 'react'

type ExpenseItem = {
  id: number
  expense_date: string | null
  category: string | null
  description: string | null
  amount: number | null
  payment_method: string | null
  supplier_id: string | null
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)
  const formattedTotalExpenses = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalExpenses)
  useEffect(() => {
    async function loadExpenses() {
      try {
        const response = await fetch('/api/expenses', { credentials: 'same-origin' })
        const data = await response.json()

        if (!response.ok) {
          setError(data.error ?? 'Could not load expenses.')
          return
        }

        setExpenses(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadExpenses()
  }, [])

  if (loading) {
    return <div className="p-6">Loading expenses...</div>
  }

  if (error) {
    return (
      <div className="p-6 text-red-400">
        Error loading expenses: {error}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <div className="flex items-baseline gap-2">
            <div className="flex-1 flex justify-center">
            <span className="text-lg text-zinc-300">
              {formattedTotalExpenses}
            </span>
          </div>
        </div>

        <a
          href="/newexpense"
          className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-500"
        >
          New Expense
        </a>
      </div>

      <p className="mb-4 text-sm text-zinc-400">
        {expenses.length} expense(s)
      </p>

      <div className="overflow-hidden rounded-xl bg-zinc-900">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center text-zinc-400"
                >
                  No expenses found.
                </td>
              </tr>
            ) : (
              expenses.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-zinc-800"
                >
                  <td className="p-4">
                    {item.expense_date
                      ? new Date(item.expense_date).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-4">
                    {item.category ?? "-"}
                  </td>

                  <td className="p-4">
                    {item.description ?? "-"}
                  </td>

                  <td className="p-4 text-right">
                    ${(item.amount ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}