"use client"

import { Card, CardContent } from "@/components/ui/card"
import AnimatedTextCycler from "./animated-text-cycler"
import { cn } from "@/lib/utils"

interface DepthOptionCardProps {
  title: string
  tagline: string
  examples: string[]
  value: string
  selected: boolean
  onSelect: (value: string) => void
}

export default function DepthOptionCard({ title, tagline, examples, value, selected, onSelect }: DepthOptionCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selected ? "border-2 border-blue-500 shadow-sm" : "border border-gray-200 hover:border-gray-300",
      )}
      onClick={() => onSelect(value)}
    >
      <CardContent className="p-4">
        <h3 className="font-medium text-center mb-1">{title}</h3>
        <p className="text-sm text-center text-gray-600 mb-3">{tagline}</p>
        <AnimatedTextCycler texts={examples} />
      </CardContent>
    </Card>
  )
}
