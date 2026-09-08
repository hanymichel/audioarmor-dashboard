"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

type SalesExpensesItem = {
  month: string
  sales: number
  expenses: number
}

type Props = {
  data: SalesExpensesItem[]
}

export default function SalesExpensesChart({ data }: Props) {
  return (
    <div className="rounded-xl bg-zinc-900 p-6">
      <h2 className="mb-4 text-xl font-semibold">
        Sales vs Expenses
      </h2>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip
              formatter={(value: number | undefined) =>
                `$${Number(value || 0).toFixed(2)}`
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="sales"
              name="Sales"
              stroke="#22c55e"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#ef4444"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}