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
      return <Zap className="h-6 w-6 md:h-8 md:w-8 text-slate-300" />
    case "balanced":
      return <Scale className="h-6 w-6 md:h-8 md:w-8 text-slate-300" />
    case "thorough":
      return <Microscope className="h-6 w-6 md:h-8 md:w-8 text-slate-300" />
    default:
      return <Scale className="h-6 w-6 md:h-8 md:w-8 text-slate-300" />
  }
}

const getDepthGradient = (value: string, selected: boolean) => {
  if (!selected) return ""
  switch (value) {
    case "quick":
      return "from-yellow-500/15 to-orange-500/15 border-yellow-400/40"
    case "balanced":
      return "from-blue-500/15 to-cyan-500/15 border-blue-400/40"
    case "thorough":
      return "from-purple-500/15 to-pink-500/15 border-purple-400/40"
    default:
      return "from-slate-500/15 to-slate-400/15 border-slate-400/40"
  }
}

const getHoverGradient = (value: string) => {
  switch (value) {
    case "quick":
      return "hover:from-yellow-500/5 hover:to-orange-500/5"
    case "balanced":
      return "hover:from-blue-500/5 hover:to-cyan-500/5"
    case "thorough":
      return "hover:from-purple-500/5 hover:to-pink-500/5"
    default:
      return "hover:from-slate-500/5 hover:to-slate-400/5"
  }
}

export default function DepthOptionCard({ title, tagline, examples, value, selected, onSelect }: DepthOptionCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-smooth card-hover bg-slate-800/40 backdrop-blur-sm group relative overflow-hidden touch-manipulation focus-ring",
        selected
          ? `border-2 shadow-lg shadow-slate-400/20 bg-gradient-to-br ${getDepthGradient(value, selected)}`
          : `border border-slate-600/50 hover:border-slate-500/70 bg-gradient-to-br ${getHoverGradient(value)}`,
      )}
      onClick={() => onSelect(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(value)
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      style={{ minHeight: "180px" }}
    >
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

      <CardContent className="p-4 md:p-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
          {/* Enhanced Icon with background */}
          <div
            className={cn(
              "p-3 md:p-4 rounded-full transition-smooth relative",
              selected
                ? "bg-slate-700/60 shadow-lg scale-110"
                : "bg-slate-700/40 group-hover:bg-slate-700/60 group-hover:scale-110",
            )}
          >
            {getDepthIcon(value)}
            {/* Icon glow effect when selected */}
            {selected && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-400/20 to-slate-300/20 blur-md"></div>
            )}
          </div>

          {/* Enhanced Title and tagline */}
          <div className="space-y-1 md:space-y-2">
            <h3
              className={cn(
                "font-semibold text-lg md:text-xl transition-colors duration-300",
                selected ? "text-slate-100" : "text-slate-200 group-hover:text-slate-100",
              )}
            >
              {title}
            </h3>
            <p
              className={cn(
                "text-xs md:text-sm transition-colors duration-300 px-2",
                selected ? "text-slate-300" : "text-slate-400 group-hover:text-slate-300",
              )}
            >
              {tagline}
            </p>
          </div>

          {/* Enhanced Visual indicator */}
          <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                selected
                  ? "w-full bg-gradient-to-r from-slate-400 to-slate-300 shadow-sm"
                  : "w-0 group-hover:w-1/3 bg-gradient-to-r from-slate-500 to-slate-400",
              )}
            />
          </div>

          {/* Subtle badge for selected state */}
          {selected && (
            <div className="absolute top-2 md:top-3 right-2 md:right-3 w-2 h-2 bg-slate-300 rounded-full animate-pulse"></div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
