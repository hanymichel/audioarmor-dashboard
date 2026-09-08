'use client'

import { useEffect, useState } from 'react'

type SalesInvoice = {
  id: number
  invoice_number: string
  invoice_date: string | null
  customer_id: number | string
  customer_name: string
  total_amount: number | null
  payment_status: string | null
}

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([])
  const [loading, setLoading] = useState(true)

  async function loadInvoices() {
    try {
      const res = await fetch('/api/salesinvoices', {
        credentials: 'same-origin',
        cache: 'no-store',
      })

      if (!res.ok) {
        const message = await res.text()
        console.error(
          `Failed to load invoices (${res.status}):`,
          message
        )
        setInvoices([])
        setLoading(false)
        return
      }

      const data = await res.json()

      if (Array.isArray(data)) {
        setInvoices(data)
      } else {
        console.error('Expected array, got:', data)
        setInvoices([])
      }
    } catch (requestError) {
      console.error(requestError)
      setInvoices([])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  const sortedInvoices = [...invoices].sort((a, b) => {
    const dateA = a.invoice_date
      ? new Date(a.invoice_date).getTime()
      : 0

    const dateB = b.invoice_date
      ? new Date(b.invoice_date).getTime()
      : 0

    return dateB - dateA
  })

  const totalSales = invoices.reduce(
    (sum, invoice) =>
      sum + (Number(invoice.total_amount) || 0),
    0
  )

  const formattedTotalSales = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalSales)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-6">
          <h1 className="text-3xl font-bold">
            Sales Invoices
          </h1>

          <span className="text-lg text-zinc-300">
            {formattedTotalSales}
          </span>
        </div>

        <a
          href="/newsalesinvoice"
          className="bg-purple-600 px-4 py-2 rounded text-white font-bold hover:bg-purple-700 transition-colors"
        >
          New Invoice
        </a>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-zinc-800">
              <th className="border border-gray-700 p-3 text-left">
                Invoice #
              </th>

              <th className="border border-gray-700 p-3 text-left">
                Date
              </th>

              <th className="border border-gray-700 p-3 text-left">
                Customer
              </th>

              <th className="border border-gray-700 p-3 text-right">
                Total
              </th>

              <th className="border border-gray-700 p-3 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedInvoices.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border border-gray-700 p-6 text-center text-zinc-400"
                >
                  No sales invoices found.
                </td>
              </tr>
            ) : (
              sortedInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="hover:bg-zinc-800/50"
                >
                  <td className="border border-gray-700 p-3">
                    {invoice.invoice_number}
                  </td>

                  <td className="border border-gray-700 p-3 whitespace-nowrap">
                    {invoice.invoice_date
                      ? new Date(
                          invoice.invoice_date
                        ).toLocaleDateString()
                      : '-'}
                  </td>

                  <td className="border border-gray-700 p-3">
                    {invoice.customer_name}
                  </td>

                  <td className="border border-gray-700 p-3 text-right whitespace-nowrap">
                    ${Number(invoice.total_amount || 0).toFixed(2)}
                  </td>

                  <td className="border border-gray-700 p-3">
                    {invoice.payment_status || '-'}
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

