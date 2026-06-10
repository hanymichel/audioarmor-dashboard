"use client"

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Sales_InvoicesForm = {
  invoice_number: string
  customer_id: string
  invoice_date: string
  subtotal: string
  discount: string
  tax: string
  shipping: string
  total_amount: string
  description: string
  payment_status: string
  notes: string
} 

const initialForm: Sales_InvoicesForm= {
  invoice_number: "",
  customer_id: "",
  invoice_date: new Date().toISOString().split("T")[0],
  subtotal: "",
  discount: "0",
  tax: "0",
  shipping: "0",
  total_amount: "",
  payment_status: "pending",
  notes: "",
  description: ''
}

  type Customer = {
    id: string
    name: string
    email?: string
  }

  export default function NewsalesinvoicePage() {
    const router = useRouter()
    const [form, setForm] = useState<Sales_InvoicesForm>(initialForm)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [customers, setCustomers] = useState<Customer[]>([])

    useEffect(() => {
      async function fetchData() {
        try {
          // Fetch customers
          const customersResponse = await fetch('/api/customers')
          const customersData = await customersResponse.json()
          if (Array.isArray(customersData)) {
            setCustomers(customersData)
          }

          // Fetch last invoice number
          const invoicesResponse = await fetch('/api/salesinvoices')
          const invoices = await invoicesResponse.json()
          
          if (Array.isArray(invoices) && invoices.length > 0) {
            // Extract numeric parts of invoice numbers and find the maximum
            const invoiceNumbers = invoices
              .map(inv => {
                const num = parseInt(inv.invoice_number.replace(/\D/g, ''), 10)
                return isNaN(num) ? 0 : num
              })
              .filter(num => num > 0)
            
            const maxNumber = Math.max(...invoiceNumbers, 0)
            const nextInvoiceNumber = (maxNumber + 1).toString()
            
            setForm(prev => ({
              ...prev,
              invoice_number: nextInvoiceNumber
            }))
          }
        } catch (err) {
          console.error('Failed to fetch data:', err)
        } finally {
          setLoading(false)
        }
      }
      
      fetchData()
    }, [])

    useEffect(() => {
      // Calculate total amount if all required fields have values
      const subtotal = parseFloat(form.subtotal) || 0
      const discount = parseFloat(form.discount) || 0
      const tax = parseFloat(form.tax) || 0
      const shipping = parseFloat(form.shipping) || 0

      // Only calculate if all values are provided (non-zero)
      if (subtotal && discount !== undefined && tax !== undefined && shipping !== undefined) {
        const discountedSubtotal = subtotal - (subtotal * discount / 100)
        const taxAmount = discountedSubtotal * tax / 100
        const total = discountedSubtotal + taxAmount + shipping
        
        setForm(prev => ({
          ...prev,
          total_amount: total.toFixed(2)
        }))
      }
    }, [form.subtotal, form.discount, form.tax, form.shipping])
  
    function updateField(field: keyof Sales_InvoicesForm, value: string) {
      setForm((current) => ({ ...current, [field]: value }))
    }

   async function submitInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    if (!form.invoice_number.trim() || !form.customer_id.trim()) {
      setError('Invoice number and customer are required.')
      setSaving(false)
      return
    }

    const response = await fetch('/api/salesinvoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const result = await response.json()
    setSaving(false)

    if (!response.ok) {
      setError(result.error ?? 'Could not create invoice.')
      return
    }

    setForm(initialForm)
    setMessage('Invoice created.')
    router.refresh()
  }

  return (
  <div className="max-w-3xl p-6">

      <h1 className="text-3xl font-bold mb-6">
        New Sales Invoice
      </h1>

      <form onSubmit={submitInvoice} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Invoice Number</label>
          <input
            placeholder="Invoice Number"
            className="w-full border p-3 rounded"
            value={form.invoice_number}
            onChange={(e) => updateField('invoice_number', e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-zinc-400">Auto-generated as last invoice + 1 (editable)</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Customer</label>
          <select
            className="w-full border p-3 rounded bg-black text-white"
            value={form.customer_id}
            onChange={(e) => updateField('customer_id', e.target.value)}
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.id})
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-400">
            {customers.length > 0
              ? `Available customers: ${customers.map(c => `${c.name} (${c.id})`).join(', ')}`
              : 'Loading customers...'}
          </p>
        </div>

        <input
          type="date"
          className="w-full border p-3 rounded bg-black text-white"
          value={form.invoice_date}
          onChange={(e) => updateField('invoice_date', e.target.value)}
        />

        <input
          placeholder="Subtotal"
          className="w-full border p-3 rounded"
          value={form.subtotal}
          onChange={(e) => updateField('subtotal', e.target.value)}
        />

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Discount</label>
          <input
            placeholder="Discount"
            className="w-full border p-3 rounded"
            value={form.discount}
            onChange={(e) => updateField('discount', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Tax</label>
          <input
            placeholder="Tax"
            className="w-full border p-3 rounded"
            value={form.tax}
            onChange={(e) => updateField('tax', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Shipping</label>
          <input
            placeholder="Shipping"
            className="w-full border p-3 rounded"
            value={form.shipping}
            onChange={(e) => updateField('shipping', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Total Amount</label>
          <input
            placeholder="Total Amount"
            className="w-full border p-3 rounded"
            value={form.total_amount}
            onChange={(e) => updateField('total_amount', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Payment Status</label>
          <select
            className="w-full border p-3 rounded bg-black text-white"
            value={form.payment_status}
            onChange={(e) => updateField('payment_status', e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Notes</label>
          <textarea
            placeholder="Notes"
            className="w-full border p-3 rounded"
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={saving || loading}
          className="inline-flex w-auto rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : loading ? 'Loading...' : 'Save Invoice'}
        </button>
      </form>
    </div>
  )
}