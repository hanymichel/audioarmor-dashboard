'use client'

import { useEffect, useState } from 'react'

type Supplier = {
  id: number
  name: string
  contact_name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  tax_number: string
  notes: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    fetch('/api/suppliers', { credentials: 'same-origin' })
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          console.error(data.error)
          return
        }

        setSuppliers(data || [])
      })
      .catch((error) => console.error(error))
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Suppliers
        </h1>

        <a
          href="/newsupplier"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-medium transition"
        >
          New Supplier
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

              <th className="border border-gray-700 px-4 py-3 text-left font-semibold whitespace-nowrap">
                Contact Name
              </th>

              <th className="border border-gray-700 px-4 py-3 text-left font-semibold">
                Email
              </th>

              <th className="border border-gray-700 px-4 py-3 text-left font-semibold whitespace-nowrap">
                Phone
              </th>
            </tr>
          </thead>

          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border border-gray-700 px-4 py-6 text-center text-gray-400"
                >
                  No suppliers found.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="hover:bg-gray-800/50 transition"
                >
                  <td className="border border-gray-700 px-4 py-3 text-left whitespace-nowrap">
                    {supplier.id}
                  </td>

                  <td className="border border-gray-700 px-4 py-3 text-left">
                    {supplier.name}
                  </td>

                  <td className="border border-gray-700 px-4 py-3 text-left">
                    {supplier.contact_name || '-'}
                  </td>

                  <td className="border border-gray-700 px-4 py-3 text-left">
                    {supplier.email || '-'}
                  </td>

                  <td className="border border-gray-700 px-4 py-3 text-left whitespace-nowrap">
                    {supplier.phone || '-'}
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
