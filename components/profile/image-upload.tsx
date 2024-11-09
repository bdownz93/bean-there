"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>
  isLoading?: boolean
}

export function ImageUpload({ onUpload, isLoading }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    await onUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    await onUpload(file)
  }

  return (
    <div
      className={`relative ${isDragging ? 'border-primary' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="avatar-upload"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => document.getElementById('avatar-upload')?.click()}
        disabled={isLoading}
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        {isLoading ? "Uploading..." : "Change Photo"}
      </Button>
    </div>
  )
}