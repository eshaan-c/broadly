"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import DepthOptionCard from "@/components/depth-option-card"
import AnimatedPlaceholder from "@/components/animated-placeholder"

interface Props {
  scenario: string
  setScenario: (v: string) => void
  depth: "quick" | "balanced" | "thorough"
  setDepth: (v: "quick" | "balanced" | "thorough") => void
  onSubmit: (e: React.FormEvent) => void
}

export default function ScenarioForm({ scenario, setScenario, depth, setDepth, onSubmit }: Props) {
  const placeholderExamples = [
    "My friends and I are trying to decide a place to go for a tropical fall break trip...",
    "I'm torn between three job offers - one at a startup, one at a big tech company, and one at a consulting firm. Each has different benefits and trade-offs...",
    "Should I study abroad next semester or stay on campus? I'm weighing the academic benefits against the cost and being away from friends...",
    "I'm considering whether to move to a new city after graduation or stay in my hometown. There are pros and cons to both options...",
    "My lease is up and I need to decide: live alone in a studio, get roommates in a bigger place, or move back home to save money...",
    "I got into two graduate programs - one is more prestigious but expensive, the other offers funding but is less well-known...",
    "Should I take a gap year to travel and work, or go straight to college? I'm unsure about what path would be better for my future...",
  ]

  const depthOptions = [
    {
      title: "Quick",
      value: "quick" as const,
      tagline: "Fast, essential insights",
      examples: [
        "For everyday choices or tight schedules",
        "Should I cook or order takeout tonight?",
        "Do I go to the gym now or later?",
        "Should I text them back or leave it?",
      ],
    },
    {
      title: "Balanced",
      value: "balanced" as const,
      tagline: "Comprehensive yet efficient",
      examples: [
        "For decisions with moderate complexity",
        "Should I live alone, with roommates, or stay home next semester?",
        "Intern at a startup, big tech firm, or do research this summer?",
        "Spend more time on school, social life, or side projects this fall?",
      ],
    },
    {
      title: "Thorough",
      value: "thorough" as const,
      tagline: "Deep, nuanced analysis",
      examples: [
        "For life-changing decisions",
        "I got offers from Goldman (IB), McKinsey (consulting), and a Wharton research role — how do I decide?",
        "Should I take time off school, power through, or try to reduce my load?",
        "I feel lost — do I focus on career, reconnect with family, or travel for perspective?",
      ],
    },
  ]

  return (
    <Card className="w-full max-w-3xl mx-auto bg-slate-800/30 border-slate-700 backdrop-blur-sm shadow-2xl">
      <CardContent className="pt-8 space-y-8">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="scenario" className="text-lg text-slate-200 font-medium">
              Describe your decision scenario
            </Label>
            <div className="relative">
              <Textarea
                id="scenario"
                className="min-h-[140px] resize-none bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-transparent focus:border-slate-400 focus:ring-slate-400/20 text-base leading-relaxed relative z-10"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                required
              />
              {!scenario && <AnimatedPlaceholder placeholders={placeholderExamples} interval={7000} />}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg text-slate-200 font-medium">Analysis Depth</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {depthOptions.map((opt) => (
                <DepthOptionCard
                  key={opt.value}
                  title={opt.title}
                  tagline={opt.tagline}
                  examples={opt.examples}
                  value={opt.value}
                  selected={depth === opt.value}
                  onSelect={setDepth}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white font-medium py-4 text-lg shadow-lg hover:shadow-xl transition-all"
            disabled={!scenario.trim()}
          >
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
