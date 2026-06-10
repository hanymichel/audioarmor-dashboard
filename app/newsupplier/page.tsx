'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewSupplierPage() {
  const [supplierCode, setSupplierCode] = useState("")
  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [country, setCountry] = useState("China")
  const [taxNumber, setTaxNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function createSupplier() {
    try {
      setSaving(true)
      setError("")
      setMessage("")

      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplier_code: supplierCode,
          name,
          contact_person: contactPerson,
          email,
          phone,
          address,
          Country: country,
          tax_number: taxNumber,
          notes,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create supplier")
      }

      setMessage("Supplier created successfully")

      setSupplierCode("")
      setName("")
      setContactPerson("")
      setEmail("")
      setPhone("")
      setAddress("")
      setCountry("China")
      setTaxNumber("")
      setNotes("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        New Supplier
      </h1>

      <div className="grid gap-4 md:grid-cols-2">

        <div>
          <label className="mb-1 block">
            Supplier Code
          </label>
          <input
            value={supplierCode}
            onChange={(e) =>
              setSupplierCode(e.target.value)
            }
            className="w-full rounded border p-2"
            placeholder="SUP-001"
          />
        </div>

        <div>
          <label className="mb-1 block">
            Supplier Name
          </label>
          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full rounded border p-2"
            placeholder="Supplier Name"
          />
        </div>

        <div>
          <label className="mb-1 block">
            Contact Person
          </label>
          <input
            value={contactPerson}
            onChange={(e) =>
              setContactPerson(e.target.value)
            }
            className="w-full rounded border p-2"
            placeholder="Ahmed Hassan"
          />
        </div>

        <div>
          <label className="mb-1 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded border p-2"
            placeholder="supplier@email.com"
          />
        </div>

        <div>
          <label className="mb-1 block">
            Phone
          </label>
          <input
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="w-full rounded border p-2"
            placeholder="+20 1000000000"
          />
        </div>

        <div>
          <label className="mb-1 block">
            Tax Number
          </label>
          <input
            value={taxNumber}
            onChange={(e) =>
              setTaxNumber(e.target.value)
            }
            className="w-full rounded border p-2"
          />
        </div>

         <div>
          <label className="mb-1 block">
            Country
          </label>
          <input
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
            className="w-full rounded border p-2"
          />
        </div>

      </div>

      <div className="mt-4">
        <label className="mb-1 block">
          Address
        </label>

        <textarea
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
          rows={3}
          className="w-full rounded border p-2"
        />
      </div>

      <div className="mt-4">
        <label className="mb-1 block">
          Notes
        </label>

        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          rows={4}
          className="w-full rounded border p-2"
        />
      </div>

      {error && (
        <div className="mt-4 rounded bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded bg-green-100 p-3 text-green-700">
          {message}
        </div>
      )}

      <button
        onClick={createSupplier}
        disabled={saving}
        className="mt-6 rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {saving
          ? "Saving..."
          : "Create Supplier"}
      </button>
    </div>
  )
}