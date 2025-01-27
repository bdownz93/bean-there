'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface RoasterLogoProps {
  src: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16'
}

export function RoasterLogo({ src, alt, size = 'md', className }: RoasterLogoProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-full bg-muted',
      sizes[size],
      className
    )}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`(max-width: 768px) ${parseInt(sizes[size].slice(2))}px, ${parseInt(sizes[size].slice(2))}px`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}
