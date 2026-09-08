"use client";
import { useEffect, useState } from "react"

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadInvoices() {
    try {
      const res = await fetch("/api/salesinvoices", { credentials: 'same-origin' })

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

  const sortedInvoices = [...invoices].sort((a, b) => {
    const dateA = a.invoice_date ? new Date(a.invoice_date).getTime() : 0
    const dateB = b.invoice_date ? new Date(b.invoice_date).getTime() : 0
    return dateB - dateA
  })

  const totalSales = invoices.reduce((sum, invoice) => sum + (Number(invoice.total_amount) || 0), 0)
  const formattedTotalSales = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalSales)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        
          
            <h1 className="text-3xl font-bold">
              Sales Invoices
            </h1>
            <div className="flex items-baseline gap-2">
            <div className="flex-1 flex justify-center">
            <span className="text-lg text-zinc-300">
              {formattedTotalSales}
            </span>
          </div>
        </div>

        <a
          href="/newsalesinvoice"
          className="bg-purple-600 px-4 py-2 rounded text-white font-bold hover:bg-purple-700 transition-colors"
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
          {sortedInvoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-t"
            >
              <td className="p-3">
                {invoice.invoice_number}
              </td>

              <td className="p-3">
                {invoice.invoice_date
                ? new Date(invoice.invoice_date).toLocaleDateString()
                : "-"}
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