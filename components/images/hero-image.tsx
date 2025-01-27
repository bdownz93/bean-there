'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface HeroImageProps {
  src: string | null
  alt: string
  className?: string
  priority?: boolean
}

export function HeroImage({ src, alt, className, priority = false }: HeroImageProps) {
  return (
    <div className={cn(
      'relative aspect-[2/1] w-full overflow-hidden rounded-lg bg-muted',
      className
    )}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          No hero image available
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/0" />
    </div>
  )
}
