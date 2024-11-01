"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PROCESSING_METHODS = ["Washed", "Natural", "Honey", "Anaerobic", "Other"]

export function OriginProcess() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="origin">Country of Origin</Label>
          <Input id="origin" name="origin" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="farm">Farm/Cooperative</Label>
          <Input id="farm" name="farm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="altitude">Altitude</Label>
          <Input id="altitude" name="altitude" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="variety">Variety</Label>
          <Input id="variety" name="variety" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Processing Method</Label>
          <Select name="process" required>
            <SelectTrigger>
              <SelectValue placeholder="Select process" />
            </SelectTrigger>
            <SelectContent>
              {PROCESSING_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="harvest">Harvest Period</Label>
          <Input id="harvest" name="harvest" required />
        </div>
      </div>
    </div>
  )
}