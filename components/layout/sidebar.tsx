'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowLeftRight,
  Calculator,
} from 'lucide-react'

export default function Sidebar() {
  return (
    <div className="w-64 bg-black text-white h-screen p-5 border-r border-zinc-800">

      <h1 className="text-2xl font-bold text-purple-500 mb-10">
        Audio Armor
      </h1>
     

      <nav className="space-y-4">

        <Link
          href="/dashboard"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          href="/products"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <Package size={20} />
          Products
        </Link>

        <Link
          href="/warehouses"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <Warehouse size={20} />
          Warehouses
        </Link>

        <Link
          href="/inventory"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <Warehouse size={20} />
          Inventory
        </Link>
        
        <Link
          href="/salesinvoices"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <ArrowLeftRight size={20} />
          Sales Invoices
        </Link>
      
        <Link
          href="/expenses"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <ArrowLeftRight size={20} />
          Expenses
        </Link>
      
        <Link
          href="/movements"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <ArrowLeftRight size={20} />
          Stock Movements
        </Link>

        <Link
          href="/suppliers"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <ArrowLeftRight size={20} />
          Suppliers
        </Link>

        <div className="border-b border-zinc-800 mb-8"></div>

        <Link
          href="/newproduct"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <Package size={20} />
          New Product
        </Link>

        <Link
          href="/newmovement"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <ArrowLeftRight size={20} />
          New Movement
        </Link>

        <Link
          href="/newsalesinvoice"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <ArrowLeftRight size={20} />
          New Sales Invoice
        </Link>

        <Link
          href="/newsupplier"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <ArrowLeftRight size={20} />
          New Supplier
        </Link>
        
        <Link
          href="/productpricing"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <Calculator size={20} />
          Product Pricing
        </Link>

      </nav>
    </div>
  )
}