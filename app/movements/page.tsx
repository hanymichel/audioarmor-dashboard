'use client'

import { useEffect, useState } from 'react'

type Movement = {
  id: number
  created_at: string
  product: string | null
  sku: string | null
  warehouse: string | null
  warehouse_id: number | null
  destination_warehouse: string | null
  destination_warehouse_id: number | null
  movement_type: string
  quantity: number
  notes: string | null
  reference_type: string | null
}

export default function MovementsPage() {
  const [movements, setMovements] =
    useState<Movement[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    async function loadMovements() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          '/api/movements',
          {
            credentials: 'same-origin',
            cache: 'no-store',
          }
        )

        const text =
          await response.text()

        let data: any

        try {
          data = JSON.parse(text)
        } catch {
          console.error(
            'API did not return JSON:',
            text
          )

          throw new Error(
            `API returned ${response.status} ${response.statusText}.`
          )
        }

        if (!response.ok) {
          throw new Error(
            data.error ??
              'Could not load stock movements.'
          )
        }

        setMovements(
          Array.isArray(data)
            ? data
            : []
        )
      } catch (requestError) {
        console.error(
          'Stock movements error:',
          requestError
        )

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not load stock movements.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadMovements()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        Loading stock movements...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-700 bg-red-950/30 p-4 text-red-400">
          Error loading stock movements:
          {' '}
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Stock Movements
        </h1>

        <a
          href="/newmovement"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-medium transition"
        >
          New Movement
        </a>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-zinc-800">
              <th className="border border-gray-700 px-4 py-3 text-left whitespace-nowrap">
                Date
              </th>

              <th className="border border-gray-700 px-4 py-3 text-left">
                Product
              </th>

              <th className="border border-gray-700 px-4 py-3 text-left">
                SKU
              </th>

              <th className="border border-gray-700 px-4 py-3 text-left">
                Warehouse
              </th>

              <th className="border border-gray-700 px-4 py-3 text-left">
                Type
              </th>

              <th className="border border-gray-700 px-4 py-3 text-right">
                Qty
              </th>

              <th className="border border-gray-700 px-4 py-3 text-left">
                Notes
              </th>
            </tr>
          </thead>

          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="border border-gray-700 px-4 py-6 text-center text-zinc-400"
                >
                  No stock movements found.
                </td>
              </tr>
            ) : (
              movements.map((movement) => (
                <tr
                  key={movement.id}
                  className="hover:bg-zinc-800/50"
                >
                  <td className="border border-gray-700 px-4 py-3 whitespace-nowrap">
                    {new Date(
                      movement.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td className="border border-gray-700 px-4 py-3">
                    {movement.product || '-'}
                  </td>

                  <td className="border border-gray-700 px-4 py-3">
                    {movement.sku || '-'}
                  </td>

                  <td className="border border-gray-700 px-4 py-3">
                    {movement.warehouse || '-'}
                  </td>

                  <td className="border border-gray-700 px-4 py-3">
                    {movement.movement_type}
                  </td>

                  <td className="border border-gray-700 px-4 py-3 text-right whitespace-nowrap">
                    {movement.quantity}
                  </td>

                  <td className="border border-gray-700 px-4 py-3">
                    {movement.notes || '-'}
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