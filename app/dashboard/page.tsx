"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import SalesExpensesChart from "@/components/graphs/SalesExpensesChart"
import SalesProfitChart from "@/components/graphs/SalesProfitChart"
import CashFlowPie from "@/components/graphs/CashFlowPie"
import SalesYoYChart from "@/components/graphs/SalesYoYChart"

type Product = {
  id: number
  name: string
  cost_price: number
}

type InventoryItem = {
  product_id: number
  quantity: number
}

type SalesInvoice = {
  total_amount: number | null
  subtotal: number | null
  payment_status: string | null
  invoice_date: string | null
}

type Expense = {
  amount: number | null
  expense_date: string | null
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

  const [salesExpensesData, setSalesExpensesData] = useState<
    { month: string; sales: number; expenses: number }[]
  >([])

  const [salesProfitData, setSalesProfitData] = useState<
    { month: string; sales: number; profit: number }[]
  >([])

  const [cashFlowData, setCashFlowData] = useState<
    { name: string; value: number }[]
  >([])

  const [salesYoYData, setSalesYoYData] = useState<
    { month: string; currentYear: number; lastYear: number }[]
  >([])

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
      // Use the API route so the dashboard gets the same
      // server-side Supabase data as the invoices page.
      // ---------------------------------------------------

      const invoicesResponse = await fetch("/api/salesinvoices", {
        cache: "no-store",
      })

      const invoicesResult = await invoicesResponse.json()

      if (!invoicesResponse.ok) {
        throw new Error(
          invoicesResult?.error || "Could not load sales invoices"
        )
      }

      const invoices: SalesInvoice[] = Array.isArray(invoicesResult)
        ? invoicesResult
        : []

      // ---------------------------------------------------
      // EXPENSES
      // Use the existing expenses API route.
      // ---------------------------------------------------

      const expensesResponse = await fetch("/api/expenses", {
        cache: "no-store",
      })

      const expensesResult = await expensesResponse.json()

      if (!expensesResponse.ok) {
        throw new Error(
          expensesResult?.error || "Could not load expenses"
        )
      }

      const expensesData: Expense[] = Array.isArray(expensesResult)
        ? expensesResult
        : []

      // ---------------------------------------------------
      // SALES TOTAL
      // ---------------------------------------------------

      const totalSalesAmount = invoices.reduce(
        (sum, invoice) =>
          sum + Number(invoice.total_amount || 0),
        0
      )

      setTotalSales(totalSalesAmount)

      // ---------------------------------------------------
      // PENDING SALES
      // ---------------------------------------------------

      const pendingAmount = invoices
        .filter((invoice) => {
          const status = String(
            invoice.payment_status || ""
          )
            .trim()
            .toLowerCase()

          return status === "pending"
        })
        .reduce(
          (sum, invoice) =>
            sum + Number(invoice.total_amount || 0),
          0
        )

      setPendingSalesAmount(pendingAmount)

      // ---------------------------------------------------
      // ORDERS
      // ---------------------------------------------------

      setTotalOrders(invoices.length)

      // ---------------------------------------------------
      // EXPENSES TOTAL
      // ---------------------------------------------------

      const expensesSum = expensesData.reduce(
        (sum, expense) =>
          sum + Number(expense.amount || 0),
        0
      )

      setTotalExpenses(expensesSum)

      // ---------------------------------------------------
      // PROFIT
      // ---------------------------------------------------

      const estimatedCOGS = invoices.reduce(
        (sum, invoice) =>
          sum +
          Number(invoice.subtotal || 0) * 0.6,
        0
      )

      setTotalProfit(
        totalSalesAmount - estimatedCOGS
      )

      // ---------------------------------------------------
      // CHART DATA
      // ---------------------------------------------------

      const currentYear = new Date().getFullYear()
      const lastYear = currentYear - 1

      const monthLabels = Array.from(
        { length: 12 },
        (_, index) => {
          const date = new Date(
            currentYear,
            index,
            1
          )

          return {
            key: `${date.toLocaleString("en", {
              month: "short",
            })} ${date.getFullYear()}`,

            label: date.toLocaleString("en", {
              month: "short",
            }),
          }
        }
      )

      const salesByMonth = new Map<string, number>()
      const expensesByMonth = new Map<string, number>()
      const profitByMonth = new Map<string, number>()
      const lastYearSalesByMonth =
        new Map<string, number>()

      invoices.forEach((invoice) => {
        const invoiceDate = invoice.invoice_date
          ? new Date(invoice.invoice_date)
          : new Date()

        const monthKey = `${invoiceDate.toLocaleString(
          "en",
          {
            month: "short",
          }
        )} ${invoiceDate.getFullYear()}`

        const salesValue = Number(
          invoice.total_amount || 0
        )

        if (
          invoiceDate.getFullYear() ===
          currentYear
        ) {
          salesByMonth.set(
            monthKey,
            (salesByMonth.get(monthKey) || 0) +
              salesValue
          )

          profitByMonth.set(
            monthKey,
            (profitByMonth.get(monthKey) || 0) +
              salesValue -
              Number(invoice.subtotal || 0) *
                0.6
          )
        }

        if (
          invoiceDate.getFullYear() ===
          lastYear
        ) {
          lastYearSalesByMonth.set(
            monthKey,
            (lastYearSalesByMonth.get(monthKey) || 0) +
              salesValue
          )
        }
      })

      expensesData.forEach((expense) => {
        const expenseDate = expense.expense_date
          ? new Date(expense.expense_date)
          : new Date()

        const monthKey = `${expenseDate.toLocaleString(
          "en",
          {
            month: "short",
          }
        )} ${expenseDate.getFullYear()}`

        expensesByMonth.set(
          monthKey,
          (expensesByMonth.get(monthKey) || 0) +
            Number(expense.amount || 0)
        )
      })

      setSalesExpensesData(
        monthLabels.map(({ key, label }) => ({
          month: label,
          sales: salesByMonth.get(key) || 0,
          expenses:
            expensesByMonth.get(key) || 0,
        }))
      )

      setSalesProfitData(
        monthLabels.map(({ key, label }) => ({
          month: label,
          sales: salesByMonth.get(key) || 0,
          profit:
            profitByMonth.get(key) || 0,
        }))
      )

      setSalesYoYData(
        monthLabels.map(({ key, label }) => ({
          month: label,
          currentYear:
            salesByMonth.get(key) || 0,
          lastYear:
            lastYearSalesByMonth.get(key) || 0,
        }))
      )

      // ---------------------------------------------------
      // CASH FLOW
      // ---------------------------------------------------

      setCashFlowData([
        {
          name: "Cash Flow",
          value: Math.max(
            totalSalesAmount -
              expensesSum -
              pendingAmount,
            0
          ),
        },
        {
          name: "Pending Payments",
          value: pendingAmount,
        },
        {
          name: "Upcoming Expenses",
          value: expensesSum,
        },
      ])

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
                (p: Product) =>
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
          .map((item: InventoryItem) => {
            const product =
              productsData.find(
                (p: Product) =>
                  p.id === item.product_id
              )

            return product?.name
          })
          .filter(Boolean)

        setLowStockProducts(
          names as string[]
        )
      }

      console.log("Dashboard sales:", invoices)
      console.log("Dashboard expenses:", expensesData)
      console.log(
        "Dashboard pending amount:",
        pendingAmount
      )
      console.log(
        "Dashboard expenses total:",
        expensesSum
      )
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

      {/* CHARTS */}

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SalesExpensesChart
          data={salesExpensesData}
        />

        <SalesProfitChart
          data={salesProfitData}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SalesYoYChart
          data={salesYoYData}
        />

        <CashFlowPie
          data={cashFlowData}
        />
      </div>
    </div>
  )
}