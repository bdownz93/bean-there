"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Logo() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by rendering a placeholder during SSR
  if (!mounted) {
    return (
      <Link href="/" className="flex items-center">
        <div className="relative h-8 w-32">
          <Image
            src="/logo-light.svg"
            alt="FLTRD"
            fill
            className="object-contain"
            priority
          />
        </div>
      </Link>
    )
  }
  
  return (
    <Link href="/" className="flex items-center">
      <div className="relative h-8 w-32">
        <Image
          src={theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
          alt="FLTRD"
          fill
          className="object-contain"
          priority
        />
      </div>
    </Link>
  )
}