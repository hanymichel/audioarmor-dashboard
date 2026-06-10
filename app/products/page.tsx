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
    fetch('/api/products')
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
        <h1 className="text-3xl font-bold">
          Products
        </h1>
        <a
          href="/newproduct"
          className="bg-purple-600 px-4 py-2 rounded text-white"
        >
          New Product
        </a>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Cost</th>
            <th>Price</th>
          </tr>
        </thead>

        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                {product.image_url ? (
                  <a
                    href={getImageUrl(product.image_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {product.name}
                  </a>
                ) : (
                  product.name
                )}
              </td>
              <td>{product.sku}</td>
              <td>{product.cost_price}</td>
              <td>{product.selling_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
