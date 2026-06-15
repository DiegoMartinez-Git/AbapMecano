import type { Metadata } from 'next'
import { Roboto_Mono, Lexend_Deca } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/Toaster'

const lexend = Lexend_Deca({
  variable: '--font-lexend',
  subsets: ['latin'],
})

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AbapMecano — Mecanografía para Desarrolladores',
  description: 'Mejora tu velocidad de escritura con práctica de código real y terminología SAP/ABAP.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${lexend.variable} ${robotoMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text-main)]" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
