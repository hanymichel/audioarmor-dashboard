'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

type ProductForm = {
  name: string
  sku: string
  brand: string
  cost_price: string
  selling_price: string
  barcode: string
  color: string
  description: string
  image_url: string
  low_stock_threshold: string
}

const initialForm: ProductForm = {
  name: '',
  sku: '',
  brand: '',
  cost_price: '',
  selling_price: '',
  barcode: '',
  color: '',
  description: '',
  image_url: '',
  low_stock_threshold: '0',
}

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState<ProductForm>(initialForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function updateField(field: keyof ProductForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const result = await response.json()
    setSaving(false)

    if (!response.ok) {
      setError(result.error ?? 'Could not create product.')
      return
    }

    setForm(initialForm)
    setMessage('Product created.')
    router.refresh()
  }

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">New Product</h1>

      <form onSubmit={submitProduct} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-300">SKU</span>
            <input
              required
              value={form.sku}
              onChange={(event) => updateField('sku', event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Brand</span>
            <input
              value={form.brand}
              onChange={(event) => updateField('brand', event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Barcode</span>
            <input
              value={form.barcode}
              onChange={(event) => updateField('barcode', event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Cost Price</span>
            <input
              min="0"
              step="0.01"
              type="number"
              value={form.cost_price}
              onChange={(event) => updateField('cost_price', event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Selling Price</span>
            <input
              min="0"
              step="0.01"
              type="number"
              value={form.selling_price}
              onChange={(event) => updateField('selling_price', event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Color</span>
            <input
              value={form.color}
              onChange={(event) => updateField('color', event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Low Stock Threshold</span>
            <input
              min="0"
              step="1"
              type="number"
              value={form.low_stock_threshold}
              onChange={(event) => updateField('low_stock_threshold', event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-zinc-300">Image URL</span>
          <input
            value={form.image_url}
            onChange={(event) => updateField('image_url', event.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-zinc-300">Description</span>
          <textarea
            rows={4}
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
          />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {message ? <p className="text-sm text-green-400">{message}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Create Product'}
        </button>
      </form>
    </div>
  )
}
