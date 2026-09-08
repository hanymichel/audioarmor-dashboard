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

type SalesYoYItem = {
  month: string
  currentYear: number
  lastYear: number
}

type Props = {
  data: SalesYoYItem[]
}

export default function SalesYoYChart({ data }: Props) {
  return (
    <div className="rounded-xl bg-zinc-900 p-6">
      <h2 className="mb-4 text-xl font-semibold">
        Sales Year over Year
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
              dataKey="currentYear"
              name="Current Year"
              stroke="#22c55e"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="lastYear"
              name="Last Year"
              stroke="#f59e0b"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}