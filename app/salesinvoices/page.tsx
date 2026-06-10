"use client"

import { useEffect, useState } from "react"

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadInvoices() {
    try {
      const res = await fetch("/api/salesinvoices")

      if (!res.ok) {
        const message = await res.text()
        console.error(`Failed to load invoices (${res.status}):`, message)
        setInvoices([])
        setLoading(false)
        return
      }

      const data = await res.json()

      if (Array.isArray(data)) {
        setInvoices(data)
      } else {
        console.error("Expected array, got:", data)
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

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">

        <h1 className="text-3xl font-bold">
          Sales Invoices
        </h1>

        <a
          href="/newsalesinvoice"
          className="bg-purple-600 px-4 py-2 rounded text-white"
        >
          New Invoice
        </a>

      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-zinc-800">

            <th className="p-3 text-left">Invoice #</th>

            <th className="p-3 text-left">Date</th>

            <th className="p-3 text-left">Customer</th>

            <th className="p-3 text-left">Total</th>

            <th className="p-3 text-left">Status</th>

          </tr>
        </thead>

        <tbody>
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-t"
            >
              <td className="p-3">
                {invoice.invoice_number}
              </td>

              <td className="p-3">
                {invoice.invoice_date}
              </td>

              <td className="p-3">
                {invoice.customer_id}
              </td>

              <td className="p-3">
                ${invoice.total_amount}
              </td>

              <td className="p-3">
                {invoice.payment_status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}