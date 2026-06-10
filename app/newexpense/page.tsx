'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Supplier = {
  id: number
  name: string
}

export default function NewExpensePage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: '',
    payment_method: '',
    supplier_id: '',
  })

  useEffect(() => {
    loadSuppliers()
  }, [])

  async function loadSuppliers() {
    const res = await fetch('/api/suppliers')
    const data = await res.json()

    if (Array.isArray(data)) {
      setSuppliers(data)
    } else {
      console.error('Failed to load suppliers:', data)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Failed to create expense')
        setLoading(false)
        return
      }

      setSuccess('Expense created successfully!')
      setFormData({
        expense_date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: '',
        payment_method: '',
        supplier_id: '',
      })

      setTimeout(() => {
        router.push('/expenses')
      }, 1500)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">New Expense</h1>

      <div className="bg-zinc-900 p-8 rounded-xl max-w-2xl">
        {error && (
          <div className="bg-red-900 text-red-100 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900 text-green-100 p-4 rounded mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Expense Date *</label>
            <input
              type="date"
              required
              value={formData.expense_date}
              onChange={(e) =>
                setFormData({ ...formData, expense_date: e.target.value })
              }
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Category *</label>
            <input
              type="text"
              required
              placeholder="e.g., Office Supplies, Travel, Equipment"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              placeholder="Additional details about the expense"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Amount *</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Payment Method</label>
            <select
              value={formData.payment_method}
              onChange={(e) =>
                setFormData({ ...formData, payment_method: e.target.value })
              }
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select payment method</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Supplier</label>
            <select
              value={formData.supplier_id}
              onChange={(e) =>
                setFormData({ ...formData, supplier_id: e.target.value })
              }
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select supplier (optional)</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 px-4 py-2 rounded text-white font-semibold transition"
            >
              {loading ? 'Creating...' : 'Create Expense'}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-white font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
