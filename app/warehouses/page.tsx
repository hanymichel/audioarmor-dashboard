'use client'

import { useEffect, useState } from 'react'

type warehouse_summary = {
  id: number
  warehouse_name: string
  sku_count: number
  total_units: number | null
  inventory_value: number | null
}

export default function warehousesPage() {
  const [warehouse_summary, setWarehouses] = useState<warehouse_summary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/warehouse_summary')
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text()
          setError(message || `Could not load warehouses (${response.status}).`)
          setLoading(false)
          return
        }

        const data = await response.json()
        setWarehouses(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Could not load warehouses.')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-6">Loading warehouses...</div>
  }

  if (error) {
    return <div className="p-6 text-red-400">Error loading warehouses: {error}</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Warehouses
        </h1>
        <a
          href="/newwarehouse"
          className="bg-purple-600 px-4 py-2 rounded text-white"
        >
          New Warehouse
        </a>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>SKU Count</th>
            <th>Total Units</th>
            <th>Inventory Value</th>
          </tr>
        </thead>

        <tbody>
          {warehouse_summary.map(warehouse_summary => (
            <tr key={warehouse_summary.id}>
              <td>{warehouse_summary.id}</td>
              <td>{warehouse_summary.warehouse_name}</td>
              <td>{warehouse_summary.sku_count}</td>
              <td>{warehouse_summary.total_units}</td>
              <td>{warehouse_summary.inventory_value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
