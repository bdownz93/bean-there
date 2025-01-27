'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BeanImageProps {
  src: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  priority?: boolean
}

const sizes = {
  sm: 'h-24 w-24',
  md: 'h-48 w-48',
  lg: 'h-64 w-64'
}

export function BeanImage({ src, alt, size = 'md', className, priority = false }: BeanImageProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl bg-muted',
      sizes[size],
      className
    )}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes={`(max-width: 768px) ${parseInt(sizes[size].slice(2))}px, ${parseInt(sizes[size].slice(2))}px`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          No image available
        </div>
      )}
    </div>
  )
}
