"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImagePlus, X } from "lucide-react"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // TODO: Implement actual image upload to your storage service
    // For now, we'll just use the preview as the value
    onChange(URL.createObjectURL(file))
  }

  const handleRemove = () => {
    onChange("")
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          Upload Photo
        </Button>
        {(value || preview) && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            className="text-destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {(value || preview) && (
        <div className="relative w-full h-48">
          <img
            src={value || preview || ""}
            alt="Preview"
            className="rounded-lg w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  )
}