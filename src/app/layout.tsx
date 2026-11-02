import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Admin Dashboard - PT Batok Kelapa',
  description: 'Dashboard administrasi produksi PT Produksi Batok Kelapa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="font-inter antialiased">
        {children}
      </body>
    </html>
  )
}
