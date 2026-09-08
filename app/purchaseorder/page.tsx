"use client"

import { useEffect, useState } from "react"

export default function PurchaseOrderPage() {
  const [suppliers, setSuppliers] =
    useState<any[]>([])

  const [products, setProducts] =
    useState<any[]>([])

  const [supplierId, setSupplierId] =
    useState("")

  const [items, setItems] = useState<any[]>([])

  const [notes, setNotes] =
    useState("")

  useEffect(() => {
    loadSuppliers()
    loadProducts()
  }, [])

  async function loadSuppliers() {
    const res = await fetch(
      "/api/suppliers",
      { credentials: 'same-origin' }
    )

    const data = await res.json()

    setSuppliers(data)
  }

  async function loadProducts() {
    const res = await fetch(
      "/api/products",
      { credentials: 'same-origin' }
    )

    const data = await res.json()

    setProducts(data)
  }

  function addItem() {
    setItems([
      ...items,
      {
        product_id: "",
        quantity: 1,
        unit_cost: 0
      }
    ])
  }

  function updateItem(
    index: number,
    field: string,
    value: any
  ) {
    const copy = [...items]

    copy[index][field] = value

    setItems(copy)
  }

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.unit_cost || 0),
    0
  )

  async function savePO() {
    const res = await fetch(
      "/api/purchaseorders",
      {
        method: "POST",
        credentials: 'same-origin',
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          supplier_id: supplierId,
          order_date:
            new Date()
              .toISOString()
              .split("T")[0],
          expected_date:
            new Date()
              .toISOString()
              .split("T")[0],
          notes,
          items
        })
      }
    )

    const result =
      await res.json()

    if (result.error) {
      alert(result.error)
      return
    }

    alert("PO Created")

    location.reload()
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        New Purchase Order
      </h1>

      <div className="mb-4">

        <label>
          Supplier
        </label>

        <select
          value={supplierId}
          onChange={(e) =>
            setSupplierId(
              e.target.value
            )
          }
          className="w-full border p-2 rounded"
        >
          <option value="">
            Select Supplier
          </option>

          {suppliers.map(
            (supplier) => (
              <option
                key={supplier.id}
                value={supplier.id}
              >
                {supplier.name}
              </option>
            )
          )}
        </select>
      </div>

      <button
        onClick={addItem}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Add Item
      </button>

      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Cost</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {items.map(
            (item, index) => (
              <tr key={index}>

                <td>

                  <select
                    value={
                      item.product_id
                    }
                    onChange={(e) =>
                      updateItem(
                        index,
                        "product_id",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Product
                    </option>

                    {products.map(
                      (
                        product
                      ) => (
                        <option
                          key={
                            product.id
                          }
                          value={
                            product.id
                          }
                        >
                          {product.sku}
                          {" - "}
                          {
                            product.name
                          }
                        </option>
                      )
                    )}
                  </select>

                </td>

                <td>

                  <input
                    type="number"
                    value={
                      item.quantity
                    }
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                  />

                </td>

                <td>

                  <input
                    type="number"
                    value={
                      item.unit_cost
                    }
                    onChange={(e) =>
                      updateItem(
                        index,
                        "unit_cost",
                        e.target.value
                      )
                    }
                  />

                </td>

                <td>
                  {(
                    Number(
                      item.quantity
                    ) *
                    Number(
                      item.unit_cost
                    )
                  ).toFixed(2)}
                </td>

              </tr>
            )
          )}
        </tbody>
      </table>

      <div className="mt-4 text-xl font-bold">
        Total: {subtotal.toFixed(2)}
      </div>

      <textarea
        value={notes}
        onChange={(e) =>
          setNotes(
            e.target.value
          )
        }
        placeholder="Notes"
        className="w-full mt-4 border p-2"
      />

      <button
        onClick={savePO}
        className="mt-4 bg-green-600 text-white px-6 py-3 rounded"
      >
        Save Purchase Order
      </button>

    </div>
  )
}