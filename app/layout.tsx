import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { getServerSupabaseClient } from "@/lib/supabase-server"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bean There",
  description: "Your coffee journey starts here",
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the initial session
  const supabase = getServerSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('❌ Error getting initial session:', error)
  }

  // Log session state for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Root Layout Session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      error: error?.message
    })
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers initialSession={session}>
          <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}