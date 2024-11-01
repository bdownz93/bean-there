"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Coffee, LogIn, UserPlus } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { UserNav } from "@/components/user/user-nav"

const routes = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/roasters",
    label: "Roasters",
  },
  {
    href: "/beans",
    label: "Beans",
  },
  {
    href: "/community",
    label: "Community",
  }
]

export function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 md:px-6">
        <div className="flex flex-1 items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Coffee className="h-5 w-5" />
            <span className="mr-2">Bean There</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === route.href ? "text-foreground" : "text-foreground/60"
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserNav />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}