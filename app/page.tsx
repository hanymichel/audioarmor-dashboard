'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {

  const [productsCount, setProductsCount] = useState(0)
  const [inventoryCount, setInventoryCount] = useState(0)
  const [movementCount, setMovementCount] = useState(0)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {

    const products = await supabase
      .from('products')
      .select('*', { count: 'exact' })

    const inventory = await supabase
      .from('inventory')
      .select('*', { count: 'exact' })

    const movements = await supabase
      .from('stock_movements')
      .select('*', { count: 'exact' })

    setProductsCount(products.count || 0)
    setInventoryCount(inventory.count || 0)
    setMovementCount(movements.count || 0)
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-8">
        Audio Armor Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h3>Products</h3>
          <p className="text-4xl mt-3">
            {productsCount}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h3>Inventory Records</h3>
          <p className="text-4xl mt-3">
            {inventoryCount}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h3>Movements</h3>
          <p className="text-4xl mt-3">
            {movementCount}
          </p>
        </div>

      </div>

    </div>
  )
}