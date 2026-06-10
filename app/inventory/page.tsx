'use client'

import { useEffect, useState } from 'react'

type InventoryItem = {
  id: number
  product: string | null
  sku: string | null
  warehouse: string | null
  quantity: number
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/inventory')
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          setError(data.error ?? 'Could not load inventory.')
          setLoading(false)
          return
        }

        setInventory(data)
        setLoading(false)
      })
      .catch((error) => {
        setError(error.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div>Loading inventory...</div>
  }

  if (error) {
    return <div className="text-red-400">Error loading inventory: {error}</div>
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Inventory</h1>
      <p className="mb-4 text-sm text-zinc-400">
        {inventory.length > 0
          ? `${inventory.length} records found`
          : 'Inventory query succeeded but returned 0 rows.'}
      </p>

      <div className="overflow-hidden rounded-xl bg-zinc-900">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">SKU</th>
              <th className="p-4 text-left">Warehouse</th>
              <th className="p-4 text-left">Quantity</th>
            </tr>
          </thead>

          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-zinc-400">
                  No inventory found
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} className="border-t border-zinc-800">
                  <td className="p-4">{item.product || '-'}</td>
                  <td className="p-4">{item.sku || '-'}</td>
                  <td className="p-4">{item.warehouse || '-'}</td>
                  <td className="p-4">{item.quantity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
