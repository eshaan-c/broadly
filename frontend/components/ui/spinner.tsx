"use client"

import { Loader2 } from "lucide-react"

export function Spinner({ size = 40 }: { size?: number }) {
  return <Loader2 className="animate-spin text-blue-500" style={{ width: size, height: size }} />
}
