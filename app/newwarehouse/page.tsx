'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewWarehousePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Warehouse name is required.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/warehouses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), location: location.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.error || 'Unable to create warehouse.')
        setLoading(false)
        return
      }

      router.push('/warehouses')
    } catch (fetchError) {
      console.error(fetchError)
      setError('Unexpected error while creating warehouse.')
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Warehouse</h1>
          <p className="mt-2 text-zinc-400">Add a new warehouse with name and location.</p>
        </div>
        <a
          href="/warehouses"
          className="rounded bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Back to Warehouses
        </a>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6 rounded-xl bg-zinc-950 p-6">
        <div>
          <label className="block text-sm font-medium text-zinc-200">Warehouse Name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-purple-500"
            placeholder="e.g. Main Warehouse"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-200">Location</label>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-purple-500"
            placeholder="e.g. 1234 Industrial Rd"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-purple-600 px-5 py-3 text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Create Warehouse'}
        </button>
      </form>
    </div>
  )
}
