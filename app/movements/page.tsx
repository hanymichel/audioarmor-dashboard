'use client'

import { useEffect, useState } from 'react'

type Movement = {
  id: number
  created_at: string
  product: string | null
  sku: string | null
  warehouse_id: string | null
  movement_type: string
  quantity: number
  notes: string | null
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/movements', { credentials: 'same-origin' })
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          setError(data.error ?? 'Could not load stock movements.')
          setLoading(false)
          return
        }

        setMovements(data)
        setLoading(false)
      })
      .catch((requestError) => {
        setError(requestError.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div>Loading stock movements...</div>
  }

  if (error) {
    return <div className="text-red-400">Error loading stock movements: {error}</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Stock Movements
        </h1>
        <a
          href="/newmovement"
          className="bg-purple-600 px-4 py-2 rounded text-white"
        >
          New Movement
        </a>
      </div>

      <table className="w-full">

        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>SKU</th>
            <th>Warehouse</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Notes</th>
          </tr>
        </thead>

        <tbody>
          {movements.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 text-center text-zinc-400">
                No stock movements found
              </td>
            </tr>
          ) : (
            movements.map((movement) => (
              <tr key={movement.id}>
                <td>
                  {new Date(movement.created_at).toLocaleDateString()}
                </td>

                <td>{movement.product || '-'}</td>
                <td>{movement.sku || '-'}</td>
                <td>{movement.warehouse_id || '-'}</td>
                <td>{movement.movement_type}</td>
                <td>{movement.quantity}</td>
                <td>{movement.notes || '-'}</td>
                <td>{movement.created_at}</td>
                </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  )
}
