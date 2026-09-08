"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"

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

const initialForm: Sales_InvoicesForm = {
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
  description: "",
}

type Customer = {
  id: string
  name: string
  email?: string
}

export default function NewsalesinvoicePage() {
  const router = useRouter()

  const [form, setForm] =
    useState<Sales_InvoicesForm>(initialForm)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] =
    useState<string | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  const [loading, setLoading] = useState(true)

  const [customers, setCustomers] =
    useState<Customer[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch customers
        const customersResponse = await fetch(
          "/api/customers",
          {
            credentials: "same-origin",
          }
        )

        const customersData =
          await customersResponse.json()

        if (Array.isArray(customersData)) {
          setCustomers(customersData)
        }

        // Fetch existing invoices
        const invoicesResponse = await fetch(
          "/api/salesinvoices",
          {
            credentials: "same-origin",
          }
        )

        const invoicesData =
          await invoicesResponse.json()

        const invoices = Array.isArray(invoicesData)
          ? invoicesData
          : []

        // Extract invoice numbers
        const invoiceNumbers = invoices
          .map((inv) => {
            const invoiceNumber = String(
              inv?.invoice_number ?? ""
            )

            const num = parseInt(
              invoiceNumber.replace(/\D/g, ""),
              10
            )

            return isNaN(num) ? 0 : num
          })
          .filter((num) => num > 0)

        // Find highest invoice number
        const maxNumber = Math.max(
          ...invoiceNumbers,
          0
        )

        const nextInvoiceNumber = String(
          maxNumber + 1
        )

        setForm((prev) => ({
          ...prev,
          invoice_number: nextInvoiceNumber,
        }))
      } catch (err) {
        console.error(
          "Failed to fetch data:",
          err
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Automatically calculate total
  useEffect(() => {
    const subtotal =
      parseFloat(form.subtotal) || 0

    const discount =
      parseFloat(form.discount) || 0

    const tax =
      parseFloat(form.tax) || 0

    const shipping =
      parseFloat(form.shipping) || 0

    if (form.subtotal.trim() !== "") {
      const discountedSubtotal =
        subtotal -
        (subtotal * discount) / 100

      const taxAmount =
        (discountedSubtotal * tax) / 100

      const total =
        discountedSubtotal +
        taxAmount +
        shipping

      const calculatedTotal =
        total.toFixed(2)

      setForm((prev) => {
        if (
          prev.total_amount ===
          calculatedTotal
        ) {
          return prev
        }

        return {
          ...prev,
          total_amount: calculatedTotal,
        }
      })
    }
  }, [
    form.subtotal,
    form.discount,
    form.tax,
    form.shipping,
  ])

  function updateField(
    field: keyof Sales_InvoicesForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function submitInvoice(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setSaving(true)
    setMessage(null)
    setError(null)

    if (
      !form.invoice_number.trim() ||
      !form.customer_id.trim()
    ) {
      setError(
        "Invoice number and customer are required."
      )

      setSaving(false)
      return
    }

    try {
      const response = await fetch(
        "/api/salesinvoices",
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      )

      const result =
        await response.json()

      if (!response.ok) {
        setError(
          result.error ??
            "Could not create invoice."
        )

        return
      }

      setForm({
        ...initialForm,
        invoice_date:
          new Date()
            .toISOString()
            .split("T")[0],
      })

      setMessage(
        "Invoice created."
      )

      router.refresh()
    } catch (err) {
      console.error(
        "Failed to create invoice:",
        err
      )

      setError(
        "Something went wrong while creating the invoice."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        New Sales Invoice
      </h1>

      {message && (
        <div className="mb-4 rounded-md bg-green-500/10 p-3 text-sm text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={submitInvoice}
        className="space-y-4"
      >
        {/* Invoice Number */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Invoice Number
          </label>

          <input
            placeholder="Invoice Number"
            className="w-full rounded border p-3"
            value={form.invoice_number}
            onChange={(e) =>
              updateField(
                "invoice_number",
                e.target.value
              )
            }
            disabled={loading}
          />

          <p className="text-xs text-zinc-400">
            Auto-generated as the next invoice
            number and editable.
          </p>
        </div>

        {/* Customer */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Customer
          </label>

          <select
            className="w-full rounded border bg-black p-3 text-white"
            value={form.customer_id}
            onChange={(e) =>
              updateField(
                "customer_id",
                e.target.value
              )
            }
          >
            <option value="">
              Select a customer
            </option>

            {customers.map(
              (customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                  className="bg-black text-white"
                >
                  {customer.name}
                </option>
              )
            )}
          </select>
        </div>

        {/* Invoice Date */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Invoice Date
          </label>

          <input
            type="date"
            className="w-full rounded border bg-black p-3 text-white"
            value={form.invoice_date}
            onChange={(e) =>
              updateField(
                "invoice_date",
                e.target.value
              )
            }
          />
        </div>

        {/* Subtotal */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Subtotal
          </label>

          <input
            type="number"
            step="0.01"
            placeholder="Subtotal"
            className="w-full rounded border p-3"
            value={form.subtotal}
            onChange={(e) =>
              updateField(
                "subtotal",
                e.target.value
              )
            }
          />
        </div>

        {/* Discount */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Discount (%)
          </label>

          <input
            type="number"
            step="0.01"
            placeholder="Discount"
            className="w-full rounded border p-3"
            value={form.discount}
            onChange={(e) =>
              updateField(
                "discount",
                e.target.value
              )
            }
          />
        </div>

        {/* Tax */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Tax (%)
          </label>

          <input
            type="number"
            step="0.01"
            placeholder="Tax"
            className="w-full rounded border p-3"
            value={form.tax}
            onChange={(e) =>
              updateField(
                "tax",
                e.target.value
              )
            }
          />
        </div>

        {/* Shipping */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Shipping
          </label>

          <input
            type="number"
            step="0.01"
            placeholder="Shipping"
            className="w-full rounded border p-3"
            value={form.shipping}
            onChange={(e) =>
              updateField(
                "shipping",
                e.target.value
              )
            }
          />
        </div>

        {/* Total */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Total Amount
          </label>

          <input
            type="number"
            step="0.01"
            placeholder="Total Amount"
            className="w-full rounded border p-3"
            value={form.total_amount}
            onChange={(e) =>
              updateField(
                "total_amount",
                e.target.value
              )
            }
          />
        </div>

        {/* Payment Status */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Payment Status
          </label>

          <select
            className="w-full rounded border bg-black p-3 text-white"
            value={form.payment_status}
            onChange={(e) =>
              updateField(
                "payment_status",
                e.target.value
              )
            }
          >
            <option value="pending">
              Pending
            </option>

            <option value="partially_paid">
              Partially Paid
            </option>

            <option value="paid">
              Paid
            </option>
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Description
          </label>

          <textarea
            placeholder="Description"
            className="w-full rounded border p-3"
            value={form.description}
            onChange={(e) =>
              updateField(
                "description",
                e.target.value
              )
            }
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Notes
          </label>

          <textarea
            placeholder="Notes"
            className="w-full rounded border p-3"
            value={form.notes}
            onChange={(e) =>
              updateField(
                "notes",
                e.target.value
              )
            }
          />
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving || loading}
          className="inline-flex w-auto rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : loading
              ? "Loading..."
              : "Save Invoice"}
        </button>
      </form>
    </div>
  )
}