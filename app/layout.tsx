import './globals.css'
import Sidebar from '@/components/layout/sidebar'
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="bg-zinc-950 text-white">

        <div className="flex">

          <Sidebar />

          <main className="flex-1 p-6">
            {children}
          </main>

        </div>

      </body>
    </html>
  )
}