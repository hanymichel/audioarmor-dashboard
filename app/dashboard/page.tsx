"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type warehouse = {
  id: number
  name: string
  cost_price: number
}

type InventoryItem = {
  product_id: number
  quantity: number
}

type SalesInvoice = {
  total_amount: number
  subtotal: number
  payment_status: string
}

export default function DashboardPage() {
  const [productsCount, setProductsCount] = useState(0)
  const [inventoryCount, setInventoryCount] = useState(0)
  const [movementCount, setMovementCount] = useState(0)

  const [totalSales, setTotalSales] = useState(0)
  const [pendingSalesAmount, setPendingSalesAmount] = useState(0)

  const [totalOrders, setTotalOrders] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)

  const [inventoryValue, setInventoryValue] = useState(0)

  const [lowStockCount, setLowStockCount] = useState(0)
  const [lowStockProducts, setLowStockProducts] = useState<string[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      // ---------------------------------------------------
      // COUNTS
      // ---------------------------------------------------

      const { count: products } = await supabase
        .from("products")
        .select("*", {
          count: "exact",
          head: true,
        })

      const { count: inventory } = await supabase
        .from("inventory")
        .select("*", {
          count: "exact",
          head: true,
        })

      const { count: movements } = await supabase
        .from("stock_movements")
        .select("*", {
          count: "exact",
          head: true,
        })

      setProductsCount(products || 0)
      setInventoryCount(inventory || 0)
      setMovementCount(movements || 0)

      // ---------------------------------------------------
      // SALES INVOICES
      // ---------------------------------------------------

      const { data: invoices } = await supabase
        .from("sales_invoices")
        .select(`
          total_amount,
          subtotal,
          payment_status
        `)

      if (invoices) {
        const totalSalesAmount = invoices.reduce(
          (sum, invoice: any) =>
            sum + Number(invoice.total_amount || 0),
          0
        )

        setTotalSales(totalSalesAmount)

        const pendingAmount = invoices
          .filter(
            (invoice: any) =>
              invoice.payment_status?.toLowerCase() ===
              "pending"
          )
          .reduce(
            (sum, invoice: any) =>
              sum + Number(invoice.total_amount || 0),
            0
          )

        setPendingSalesAmount(pendingAmount)

        setTotalOrders(invoices.length)

        const estimatedCOGS = invoices.reduce(
          (sum, invoice: any) =>
            sum +
            Number(invoice.subtotal || 0) *
              0.6,
          0
        )

        // keep profit calculation based on estimated COGS
        setTotalProfit(
          totalSalesAmount - estimatedCOGS
        )

        // load actual recorded expenses from expenses table
        try {
          const { data: expensesData } = await supabase
            .from("expenses")
            .select(`amount`)

          const expensesSum = (expensesData || []).reduce(
            (sum: number, e: any) => sum + Number(e.amount || 0),
            0
          )

          setTotalExpenses(expensesSum)
        } catch (err) {
          console.error("Failed to load expenses:", err)
        }
      }

      // ---------------------------------------------------
      // INVENTORY VALUE
      // ---------------------------------------------------

      const { data: inventoryData } =
        await supabase
          .from("inventory")
          .select(`
            product_id,
            quantity
          `)
      
      const { data: productsData } =
        await supabase
          .from("products")
          .select(`
            id,
            name,
            cost_price
          `)

      if (
        inventoryData &&
        productsData
      ) {
        let value = 0

        inventoryData.forEach(
          (item: InventoryItem) => {
            const product =
              productsData.find(
                (p: warehouse) =>
                  p.id === item.product_id
              )

            value +=
              Number(item.quantity || 0) *
              Number(
                product?.cost_price || 0
              )
          }
        )

        setInventoryValue(value)
      }

      // ---------------------------------------------------
      // LOW STOCK
      // ---------------------------------------------------

      const { data: lowStockData } =
        await supabase
          .from("inventory")
          .select(`
            product_id,
            quantity
          `)
          .lt("quantity", 10)

      if (
        lowStockData &&
        productsData
      ) {
        setLowStockCount(
          lowStockData.length
        )

        const names = lowStockData
          .map((item: any) => {
            const product =
              productsData.find(
                (p: warehouse) =>
                  p.id === item.product_id
              )

            return product?.name
          })
          .filter(Boolean)

        setLowStockProducts(
          names as string[]
        )
      }
    } catch (error) {
      console.error(
        "Dashboard Error:",
        error
      )
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-8 text-3xl font-bold">
        Audio Armor Dashboard
      </h1>

      {/* COUNTS */}

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-zinc-900 p-6">
          <h3>Products</h3>
          <p className="mt-3 text-4xl">
            {productsCount}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-6">
          <h3>Inventory Records</h3>
          <p className="mt-3 text-4xl">
            {inventoryCount}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-6">
          <h3>Movements</h3>
          <p className="mt-3 text-4xl">
            {movementCount}
          </p>
        </div>
      </div>

      {/* SALES */}

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-zinc-900 p-6">
          <h3>Total Sales</h3>
          <p className="mt-3 text-3xl text-green-400">
            ${totalSales.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-6">
          <h3>Pending Sales</h3>
          <p className="mt-3 text-3xl text-yellow-400">
            ${pendingSalesAmount.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-6">
          <h3>Total Orders</h3>
          <p className="mt-3 text-3xl text-blue-400">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-6">
          <h3>Total Profit</h3>
          <p className="mt-3 text-3xl text-purple-400">
            ${totalProfit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* INVENTORY */}

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-zinc-900 p-6">
          <h3>Expenses</h3>
          <p className="mt-3 text-3xl text-red-400">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-6">
          <h3>Inventory Value</h3>
          <p className="mt-3 text-3xl text-orange-400">
            ${inventoryValue.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-6">
          <h3>Low Stock Products</h3>

          <p className="mt-3 text-3xl text-yellow-400">
            {lowStockCount}
          </p>

          {lowStockProducts.length > 0 && (
            <div className="mt-4 text-sm text-zinc-400">
              {lowStockProducts.map(
                (product, index) => (
                  <div key={index}>
                    • {product}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}