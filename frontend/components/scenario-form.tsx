"use client"

import type React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import DepthOptionCard from "@/components/depth-option-card"
import AnimatedPlaceholder from "@/components/animated-placeholder"
import { Sparkles } from "lucide-react"

interface Props {
  scenario: string
  setScenario: (v: string) => void
  depth: "quick" | "balanced" | "thorough"
  setDepth: (v: "quick" | "balanced" | "thorough") => void
  onSubmit: (e: React.FormEvent) => void
}

export default function ScenarioForm({ scenario, setScenario, depth, setDepth, onSubmit }: Props) {
  const placeholderExamples = [
    // Quick Depth - Everyday decisions
    "My car needs $3k in repairs but it's 12 years old. Should I fix it, buy used, or lease something new? I drive about 20 miles daily for work...",
    "Debating whether to renew my gym membership, switch to the new climbing gym, or just invest in home equipment. I've been going 2-3x per week...",
    "My manager offered me a lateral move to a different team with more interesting work but a longer commute. Need to decide by Friday...",

    // Balanced Depth - Moderate complexity
    "Considering switching careers from marketing to UX design. Would need to do a bootcamp or self-study while working. I'm 28 and have 5 years experience...",
    "My partner got a job offer in Denver. We need to decide if we both move, try long-distance, or if they should turn it down. We've been together 3 years...",
    "Choosing between staying at my stable corporate job or joining my friend's startup as employee #5. The equity could be huge but it's risky...",

    // Thorough Depth - Life-changing decisions
    "After 10 years in tech, I'm burned out and considering opening a small bakery. I have savings but would need to take out loans. My spouse is supportive but worried...",
    "We're deciding whether to have kids in the next year or wait. I'm 32, partner is 35. Careers are going well but we're unsure about timing and lifestyle changes...",
    "Got into medical school but also have a compelling job offer at a health tech company. One path leads to MD, the other could lead to founding my own company...",

    // Mixed complexity scenarios
    "My startup was acqui-hired and I need to decide: vest and stay 2 years, leave and forfeit equity, or negotiate a different package...",
    "Inherited my grandmother's house in my hometown. Should I sell it, rent it out, or move back and work remotely? I left that town for good reasons...",
    "My best friend wants me to be her business partner in a new venture. Excited about the idea but worried about mixing friendship with business...",
    "Company offered me a promotion that requires relocating to Singapore for 2-3 years. Great for career but I'd be far from aging parents...",
    "Deciding whether to go back to school for my MBA, pursue online certifications, or focus on climbing the ladder at my current company...",
  ]

  const animatedPlaceholderRef = useRef(<AnimatedPlaceholder placeholders={placeholderExamples} interval={9000} />)

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
      tagline: "Smart and efficient",
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
    <Card className="w-full max-w-4xl mx-auto bg-slate-800/40 border-slate-700/50 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-all duration-500">
      <CardContent className="pt-8 pb-8 px-4 md:px-8 space-y-8 md:space-y-10">
        <form onSubmit={onSubmit} className="space-y-8 md:space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {/* <Sparkles className="h-5 w-5 text-slate-400" /> */}
              <Label htmlFor="scenario" className="text-lg md:text-xl text-slate-200 font-medium text-center">
                Describe your decision scenario
              </Label>
            </div>
            <div className="relative group">
              <Textarea
                id="scenario"
                className="min-h-[160px] md:min-h-[180px] resize-none bg-slate-700/60 border-slate-600/50 text-slate-100 placeholder:text-transparent focus:border-slate-400 focus:ring-slate-400/30 text-base leading-relaxed relative z-10 transition-all duration-300 focus:bg-slate-700/80 group-hover:border-slate-500/70 touch-manipulation"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                required
              />
              {!scenario && animatedPlaceholderRef.current}
              {/* Subtle focus indicator */}
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-slate-400/0 via-slate-400/5 to-slate-400/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <Label className="text-lg md:text-xl text-slate-200 font-medium">Analysis Depth</Label>
              <p className="text-sm text-slate-400 mt-1">Choose how thorough you want the analysis to be</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white font-medium py-4 text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group min-h-[56px] touch-manipulation"
              disabled={!scenario.trim()}
            >
              <span className="flex items-center justify-center space-x-2">
                <span>Continue</span>
                {/* <Sparkles className="h-4 w-4 group-hover:animate-pulse" /> */}
              </span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
