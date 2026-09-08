"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type CashFlowItem = {
  name: string
  value: number
}

type CashFlowPieProps = {
  data: CashFlowItem[]
}

const COLORS = [
  "#22c55e",
  "#eab308",
  "#ef4444",
]

export default function CashFlowPie({
  data,
}: CashFlowPieProps) {
  const total = data.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  )

  return (
    <div className="rounded-xl bg-zinc-900 p-6">
      <h2 className="mb-4 text-xl font-semibold">
        Cash Flow
      </h2>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={105}
              innerRadius={65}
              paddingAngle={2}
              label={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number | undefined) =>
                `$${Number(value || 0).toFixed(2)}`
              }
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* CLEAR AMOUNTS */}
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="rounded-lg border border-zinc-700 bg-zinc-800 p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    COLORS[index % COLORS.length],
                }}
              />

              <span className="text-sm text-zinc-400">
                {item.name}
              </span>
            </div>

            <p className="mt-2 text-xl font-bold text-white">
              $
              {Number(item.value || 0).toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 text-center text-sm text-zinc-500">
        Total: $
        {total.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    </div>
  )
}
