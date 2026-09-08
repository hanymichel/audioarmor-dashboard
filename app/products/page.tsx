'use client'

import { useEffect, useState } from 'react'

type Product = {
  id: number
  name: string
  sku: string
  cost_price: number | string | null
  selling_price: number | string | null
  image_url: string | null
}

function getImageUrl(imageUrl: string) {
  if (!imageUrl) {
    return ''
  }

  const googleDriveFileId = (() => {
    const driveFileMatch = imageUrl.match(/drive\.google\.com\/(?:file\/d\/([^/]+)|open\?id=([^&]+)|uc\?id=([^&]+))/)
    if (driveFileMatch) {
      return driveFileMatch[1] || driveFileMatch[2] || driveFileMatch[3]
    }

    const idMatch = imageUrl.match(/^[a-zA-Z0-9_-]{20,}$/)
    return idMatch ? idMatch[0] : null
  })()

  if (googleDriveFileId) {
    return `https://drive.google.com/uc?export=view&id=${googleDriveFileId}`
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const normalizedPath = imageUrl.replace(/^\/+/, '')

  return supabaseUrl ? `${supabaseUrl}/${normalizedPath}` : imageUrl
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/products', { credentials: 'same-origin' })
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          console.error(data.error)
          return
        }

        setProducts(data || [])
      })
      .catch((error) => console.error(error))
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1" />
        <h1 className="text-3xl font-bold text-center flex-1">
          Products
        </h1>
        <a
          href="/newproduct"
          className="bg-purple-600 px-4 py-2 rounded text-white hover:bg-purple-700 transition-colors"
        >
          New Product
        </a>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-700 bg-black shadow-sm">
        <table className="w-full border-collapse text-sm text-white">
          <thead className="bg-black">
            <tr>
              <th className="border border-zinc-700 px-4 py-3 text-center font-bold text-white">ID</th>
              <th className="border border-zinc-700 px-4 py-3 text-left font-bold text-white">Name</th>
              <th className="border border-zinc-700 px-4 py-3 text-center font-bold text-white">SKU</th>
              <th className="border border-zinc-700 px-4 py-3 text-center font-bold text-white">Cost</th>
              <th className="border border-zinc-700 px-4 py-3 text-center font-bold text-white">Price</th>
            </tr>
          </thead>

          <tbody>
            {products.map(product => (
              <tr key={product.id} className="odd:bg-black even:bg-zinc-900">
                <td className="border border-zinc-700 px-4 py-3 text-center font-semibold text-white">{product.id}</td>
                <td className="border border-zinc-700 px-4 py-3 font-semibold text-white">
                  {product.image_url ? (
                    <a
                      href={getImageUrl(product.image_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white underline decoration-white decoration-2 hover:no-underline"
                    >
                      {product.name}
                    </a>
                  ) : (
                    product.name
                  )}
                </td>
                <td className="border border-zinc-700 px-4 py-3 text-center font-semibold text-white">{product.sku}</td>
                <td className="border border-zinc-700 px-4 py-3 text-center font-semibold text-white">{product.cost_price}</td>
                <td className="border border-zinc-700 px-4 py-3 text-center font-semibold text-white">{product.selling_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
