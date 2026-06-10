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
    fetch('/api/suppliers')
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
          className="bg-purple-600 px-4 py-2 rounded text-white"
        >
          New Supplier
        </a>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contact Name</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>

        <tbody>
          {suppliers.map(supplier => (
            <tr key={supplier.id}>
              <td>{supplier.id}</td>
              <td>{supplier.name}</td>
              <td>{supplier.contact_name}</td>
              <td>{supplier.email}</td>
              <td>{supplier.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}