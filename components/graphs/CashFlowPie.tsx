"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

type CashFlowItem = {
  name: string
  value: number
}

type CashFlowPieProps = {
  data: CashFlowItem[]
}

export default function CashFlowPie({
  data,
}: CashFlowPieProps) {
  return (
    <div className="rounded-xl bg-zinc-900 p-6">
      <h2 className="mb-4 text-xl font-semibold">
        Cash Flow
      </h2>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    [
                      "#22c55e",
                      "#eab308",
                      "#ef4444",
                    ][index % 3]
                  }
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number | undefined) =>
                `$${Number(value || 0).toFixed(2)}`
              }
            />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}