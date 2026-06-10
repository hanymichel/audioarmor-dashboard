"use client"

import { useEffect, useState } from "react"

export default function NewMovementPage() {
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])

  const [form, setForm] = useState({
    product_id: "",
    warehouse_id: "",
    destination_warehouse_id: "",
    movement_type: "IN",
    quantity: "",
    unit_cost: "",
    reference_type: "",
    notes: "",
  })

  const isTransfer = form.movement_type.toUpperCase() === "TRANSFER"

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const productsRes = await fetch("/api/products")
    const productsData = await productsRes.json()

    const warehousesRes = await fetch("/api/warehouses")
    const warehousesData = await warehousesRes.json()

    setProducts(productsData || [])
    setWarehouses(warehousesData || [])
  }

  async function submitMovement(
  e: React.FormEvent
) {
  e.preventDefault()

  if (isTransfer && !form.destination_warehouse_id) {
    alert("Please select destination warehouse")
    return
  }

  const res = await fetch("/api/movements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  })

  const result = await res.json()

  if (res.ok) {
    alert("Movement Added")
    location.reload()
  } else {
    alert(result.error)
  }
}

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">
        New Stock Movement
      </h1>

      <form
        onSubmit={submitMovement}
        className="space-y-4"
      >
        <div>
          <label>Product</label>

          <select
            className="w-full border p-3 rounded bg-black text-white"
            value={form.product_id}
            onChange={(e) =>
              setForm({
                ...form,
                product_id: e.target.value,
              })
            }
          >
            <option value="">
              Select Product
            </option>

            {products.map((p) => (
              <option
                key={p.id}
                value={p.id}
              >
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Warehouse</label>

          <select
            className="w-full border p-3 rounded bg-black text-white"
            value={form.warehouse_id}
            onChange={(e) =>
              setForm({
                ...form,
                warehouse_id: e.target.value,
              })
            }
          >
            <option value="">
              Select Warehouse
            </option>

            {warehouses.map((w) => (
              <option
                key={w.id}
                value={w.id}
              >
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {isTransfer && (
          <div>
            <label>Destination Warehouse</label>

            <select
              className="w-full border p-3 rounded bg-black text-white"
              value={form.destination_warehouse_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  destination_warehouse_id: e.target.value,
                })
              }
            >
              <option value="">
                Select Destination Warehouse
              </option>

              {warehouses
                .filter((w) => String(w.id) !== String(form.warehouse_id))
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div>
          <label>Movement Type</label>

          <select
            className="w-full border p-3 rounded bg-black text-white"
            value={form.movement_type}
            onChange={(e) => {
              const movement_type = e.target.value
              setForm({
                ...form,
                movement_type,
                destination_warehouse_id:
                  movement_type.toUpperCase() === "TRANSFER"
                    ? form.destination_warehouse_id
                    : "",
              })
            }}
          >
            <option value="TRANSFER">TRANSFER</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
            <option value="DAMAGED">DAMAGED</option>
            <option value="ADJUSTMENT">ADJUSTMENT</option>
            <option value="RETURN">RETURN</option>
          </select>
        </div>
      
        <div>
          <label>Quantity</label>

          <input
            type="number"
            className="w-full border p-3 rounded bg-black text-white"
            value={form.quantity}
            onChange={(e) =>
              setForm({
                ...form,
                quantity: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label>Unit Cost</label>

          <input
            type="number"
            step="0.01"
            className="w-full border p-3 rounded bg-black text-white"
            value={form.unit_cost}
            onChange={(e) =>
              setForm({
                ...form,
                unit_cost: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label>Reference Type</label>

          <select
            className="w-full border p-3 rounded bg-black text-white"
            value={form.reference_type}
            onChange={(e) =>
              setForm({
                ...form,
                reference_type: e.target.value,
              })
            }
          >
            <option value="">
              Select
            </option>

            <option value="PURCHASE_ORDER">
              Purchase Order
            </option>

            <option value="SALES_INVOICE">
              Sales Invoice
            </option>

            <option value="ADJUSTMENT">
              Adjustment
            </option>

            <option value="PRODUCTION">
              Production
            </option>
          </select>
        </div>

        <div>
          <label>Notes</label>

          <textarea
            className="w-full border p-3 rounded bg-black text-white"
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
          />
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Save Movement
        </button>
      </form>
    </div>
  )
}