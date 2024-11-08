"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"

export function Logo() {
  const { resolvedTheme } = useTheme()
  
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src={resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
        alt="FLTRD Logo"
        width={100}
        height={32}
        className="h-8 w-auto"
        priority
      />
    </Link>
  )
}