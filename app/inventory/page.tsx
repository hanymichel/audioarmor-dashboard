"use client";

import { useEffect, useMemo, useState } from "react";

type InventoryItem = {
  id: number;
  product: string | null;
  sku: string | null;
  warehouse: string | null;
  warehouse_id?: number | null;
  quantity: number;
  cost_price: number;
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadInventory() {
      try {
        const response = await fetch("/api/inventory", { credentials: 'same-origin' });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Could not load inventory.");
          return;
        }

        setInventory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadInventory();
  }, []);

  const warehouses = useMemo(() => {
    const map = new Map<string, string>();

    inventory.forEach((item) => {
      if (item.warehouse) {
        map.set(item.warehouse, item.warehouse);
      }
    });

    return Array.from(map.values()).sort();
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const warehouseMatch =
        selectedWarehouse === "all" ||
        item.warehouse === selectedWarehouse;

      const searchMatch =
        search === "" ||
        item.product?.toLowerCase().includes(search.toLowerCase()) ||
        item.sku?.toLowerCase().includes(search.toLowerCase());

      return warehouseMatch && searchMatch;
    });
  }, [inventory, selectedWarehouse, search]);

  const totalQuantity = filteredInventory.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalCost = filteredInventory.reduce(
  (sum, item) => sum + item.quantity * item.cost_price,
  0
);

  if (loading) {
    return <div className="p-6">Loading inventory...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-400">
        Error loading inventory: {error}
      </div>
    );
  }

  return (
    <div className="p-6">

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-3xl font-bold">
          Inventory
        </h1>

        <div className="text-sm text-zinc-400">
          {filteredInventory.length} item(s)
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div>
          <label className="block mb-2 text-sm">
            Warehouse
          </label>

          <select
            value={selectedWarehouse}
            onChange={(e) =>
              setSelectedWarehouse(e.target.value)
            }
            className="w-full rounded border border-zinc-700 bg-black p-3 text-white"
          >
            <option value="all">
              All Warehouses
            </option>

            {warehouses.map((warehouse) => (
              <option
                key={warehouse}
                value={warehouse}
              >
                {warehouse}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm">
            Search
          </label>

          <input
            type="text"
            placeholder="Product or SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-black p-3 text-white"
          />
        </div>

        <div className="rounded bg-zinc-900 p-4 flex flex-col justify-center">
          <div className="text-sm text-zinc-400">
            Total Quantity
          </div>

          <div className="text-3xl font-bold">
            {totalQuantity}
          </div>
          <div className="rounded bg-zinc-900 p-4 flex flex-col justify-center">
  <div className="text-sm text-zinc-400">
    Total Cost
  </div>

  <div className="text-3xl font-bold">
    ${totalCost.toFixed(2)}
  </div>
</div>
        </div>

      </div>

      <div className="overflow-hidden rounded-xl bg-zinc-900">

        <table className="w-full">

          <thead className="bg-zinc-800">
            <tr>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">SKU</th>
              <th className="p-4 text-left">Warehouse</th>
              <th className="p-4 text-right">Quantity</th>
              <th className="p-4 text-right">Value</th>
            </tr>
          </thead>

          <tbody>
                        {filteredInventory.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-zinc-400"
                >
                  No inventory found.
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800/40"
                >
                  <td className="p-4 font-medium">
                    {item.product ?? "-"}
                  </td>

                  <td className="p-4">
                    {item.sku ?? "-"}
                  </td>

                  <td className="p-4">
                    {item.warehouse ?? "-"}
                  </td>

                  <td className="p-4 text-right font-semibold">
                    {item.quantity}
                  </td>
                  <td className="p-4 text-right">
                    ${(item.quantity * item.cost_price).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>

      </div>

      <div className="mt-6 rounded-lg bg-zinc-900 p-4">
        <h2 className="mb-3 text-lg font-semibold">
          Inventory Summary
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          <div>
            <div className="text-sm text-zinc-400">
              Warehouses
            </div>
            <div className="text-2xl font-bold">
              {warehouses.length}
            </div>
          </div>

          <div>
            <div className="text-sm text-zinc-400">
              Products
            </div>
            <div className="text-2xl font-bold">
              {filteredInventory.length}
            </div>
          </div>

          <div>
            <div className="text-sm text-zinc-400">
              Total Quantity
            </div>
            <div className="text-2xl font-bold">
              {totalQuantity}
            </div>
          </div>

          <div>
            <div className="text-sm text-zinc-400">
              Selected Warehouse
            </div>
            <div className="text-lg font-semibold">
              {selectedWarehouse === "all"
                ? "All Warehouses"
                : selectedWarehouse}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}