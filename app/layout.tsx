import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bean There, Done That",
  description: "Your coffee journey starts here",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}