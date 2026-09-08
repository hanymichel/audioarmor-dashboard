'use client'

import { useEffect, useState } from 'react'

type WarehouseSummary = {
  id: number
  warehouse_name: string
  sku_count: number
  total_units: number | null
  inventory_value: number | null
}

export default function WarehousesPage() {
  const [warehouseSummary, setWarehouses] = useState<WarehouseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/warehouse_summary', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text()
          setError(
            message || `Could not load warehouses (${response.status}).`
          )
          setLoading(false)
          return
        }

        const data = await response.json()
        setWarehouses(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not load warehouses.'
        )
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-6">Loading warehouses...</div>
  }

  if (error) {
    return (
      <div className="p-6 text-red-400">
        Error loading warehouses: {error}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Warehouses
        </h1>

        <a
          href="/newwarehouse"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-medium transition"
        >
          New Warehouse
        </a>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-700 px-4 py-3 text-left font-semibold whitespace-nowrap">
                ID
              </th>

              <th className="border border-gray-700 px-4 py-3 text-left font-semibold">
                Name
              </th>

              <th className="border border-gray-700 px-4 py-3 text-right font-semibold whitespace-nowrap">
                SKU Count
              </th>

              <th className="border border-gray-700 px-4 py-3 text-right font-semibold whitespace-nowrap">
                Total Units
              </th>

              <th className="border border-gray-700 px-4 py-3 text-right font-semibold whitespace-nowrap">
                Inventory Value
              </th>
            </tr>
          </thead>

          <tbody>
            {warehouseSummary.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border border-gray-700 px-4 py-6 text-center text-gray-400"
                >
                  No warehouses found.
                </td>
              </tr>
            ) : (
              warehouseSummary.map((warehouse) => (
                <tr
                  key={warehouse.id}
                  className="hover:bg-gray-800/50 transition"
                >
                  <td className="border border-gray-700 px-4 py-3 text-left whitespace-nowrap">
                    {warehouse.id}
                  </td>

                  <td className="border border-gray-700 px-4 py-3 text-left">
                    {warehouse.warehouse_name}
                  </td>

                  <td className="border border-gray-700 px-4 py-3 text-right whitespace-nowrap">
                    {warehouse.sku_count}
                  </td>

                  <td className="border border-gray-700 px-4 py-3 text-right whitespace-nowrap">
                    {warehouse.total_units ?? 0}
                  </td>

                  <td className="border border-gray-700 px-4 py-3 text-right whitespace-nowrap">
                    ${Number(warehouse.inventory_value ?? 0).toFixed(2)}
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