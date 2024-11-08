"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { LogIn, Menu, UserPlus } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { UserNav } from "@/components/user/user-nav"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { Logo } from "@/components/ui/logo"

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
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 mx-auto max-w-7xl">
        <nav className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === route.href 
                      ? "text-foreground font-semibold" 
                      : "text-foreground/60"
                  )}
                >
                  {route.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
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

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] pr-0">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full py-4">
                  <div className="flex flex-col space-y-2">
                    {routes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                          pathname === route.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {route.label}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-auto pt-4 border-t">
                    {user ? (
                      <div className="px-4">
                        <UserNav mobile onClose={() => setIsOpen(false)} />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 px-4">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full">
                            <LogIn className="h-4 w-4 mr-2" />
                            Login
                          </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                          <Button className="w-full">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Sign Up
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  )
}