'use client'

import { useEffect, useState } from 'react'

type Expense = {
  id: number
  expense_date: string
  category: string
  description: string
  amount: number
  payment_method: string
  supplier_id: number
  created_at: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  async function loadExpenses() {
    const res = await fetch('/api/expenses')
    const data = await res.json()

    if (Array.isArray(data)) {
      setExpenses(data)
    } else {
      console.error('Expected array, got:', data)
      setExpenses([])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount as any) || 0), 0)

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6 items-center">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-xl text-amber-400 mt-2">
            Total: ${totalExpenses.toFixed(2)}
          </p>
        </div>

        <a
          href="/newexpense"
          className="bg-purple-600 px-4 py-2 rounded text-white hover:bg-purple-700"
        >
          New Expense
        </a>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-zinc-900 p-6 rounded-xl text-center text-zinc-400">
          No expenses recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-800">
                <th className="p-3 text-left border border-zinc-700">Date</th>
                <th className="p-3 text-left border border-zinc-700">Category</th>
                <th className="p-3 text-left border border-zinc-700">Description</th>
                <th className="p-3 text-left border border-zinc-700">Amount</th>
                <th className="p-3 text-left border border-zinc-700">Payment Method</th>
                <th className="p-3 text-left border border-zinc-700">Supplier ID</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-t border-zinc-700 hover:bg-zinc-800">
                  <td className="p-3 border border-zinc-700">{expense.expense_date}</td>
                  <td className="p-3 border border-zinc-700">
                    <span className="bg-zinc-700 px-2 py-1 rounded text-xs">
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-3 border border-zinc-700 text-sm text-zinc-300">
                    {expense.description || '-'}
                  </td>
                  <td className="p-3 border border-zinc-700 text-red-400 font-semibold">
                    ${parseFloat(expense.amount as any).toFixed(2)}
                  </td>
                  <td className="p-3 border border-zinc-700 text-sm">
                    {expense.payment_method || '-'}
                  </td>
                  <td className="p-3 border border-zinc-700 text-sm">
                    {expense.supplier_id || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
