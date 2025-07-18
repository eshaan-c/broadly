"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Zap, Scale, Microscope } from "lucide-react"

interface DepthOptionCardProps {
  title: string
  tagline: string
  examples: string[]
  value: "quick" | "balanced" | "thorough"
  selected: boolean
  onSelect: (value: "quick" | "balanced" | "thorough") => void
}

const getDepthIcon = (value: string) => {
  switch (value) {
    case "quick":
      return <Zap className="h-8 w-8 text-slate-300" />
    case "balanced":
      return <Scale className="h-8 w-8 text-slate-300" />
    case "thorough":
      return <Microscope className="h-8 w-8 text-slate-300" />
    default:
      return <Scale className="h-8 w-8 text-slate-300" />
  }
}

const getDepthGradient = (value: string, selected: boolean) => {
  if (!selected) return ""
  switch (value) {
    case "quick":
      return "from-yellow-500/10 to-orange-500/10 border-yellow-400/30"
    case "balanced":
      return "from-blue-500/10 to-cyan-500/10 border-blue-400/30"
    case "thorough":
      return "from-purple-500/10 to-pink-500/10 border-purple-400/30"
    default:
      return "from-slate-500/10 to-slate-400/10 border-slate-400/30"
  }
}

export default function DepthOptionCard({ title, tagline, examples, value, selected, onSelect }: DepthOptionCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:shadow-slate-500/20 bg-slate-800/30 backdrop-blur-sm group hover:scale-[1.02]",
        selected
          ? `border-2 shadow-lg shadow-slate-400/20 bg-gradient-to-br ${getDepthGradient(value, selected)}`
          : "border border-slate-600 hover:border-slate-500",
      )}
      onClick={() => onSelect(value)}
      style={{ minHeight: "200px" }} // Set a consistent minimum height for the card
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon with background */}
          <div
            className={cn(
              "p-3 rounded-full transition-all duration-300",
              selected
                ? "bg-slate-700/50 shadow-lg"
                : "bg-slate-700/30 group-hover:bg-slate-700/50 group-hover:scale-110",
            )}
          >
            {getDepthIcon(value)}
          </div>

          {/* Title and tagline */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-slate-100">{title}</h3>
            <p className="text-sm text-slate-300">{tagline}</p>
          </div>

          {/* Visual indicator */}
          <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                selected ? "w-full bg-gradient-to-r from-slate-400 to-slate-300" : "w-0",
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}