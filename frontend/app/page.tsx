"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import QuestionsPage from "@/components/questions-page"
import ResultsPage from "@/components/results-page"
import DepthOptionCard from "@/components/depth-option-card"

export default function Home() {
  const [scenario, setScenario] = useState("")
  const [depth, setDepth] = useState("balanced")
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState("input") // "input", "questions", "results"
  const [questions, setQuestions] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)

  const depthOptions = [
    {
      title: "Quick",
      value: "quick",
      tagline: "Fast, essential insights",
      examples: [
        "For everyday choices or tight schedules",
        "When you need a quick gut check",
        "For simple yes/no decisions",
        "When exploring initial options",
      ],
    },
    {
      title: "Balanced",
      value: "balanced",
      tagline: "Comprehensive yet efficient",
      examples: [
        "For decisions with moderate complexity",
        "When weighing multiple important factors",
        "For choices with medium-term impact",
        "When you need structured thinking",
      ],
    },
    {
      title: "Thorough",
      value: "thorough",
      tagline: "Deep, nuanced analysis",
      examples: [
        "For life-changing decisions",
        "When many variables are at play",
        "For complex professional choices",
        "When long-term consequences matter most",
      ],
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock questions data that would come from the API
      const mockQuestions = [
        {
          id: "importance",
          type: "scale",
          question: "How important is this decision to you?",
          min: 1,
          max: 10,
          minLabel: "Not very important",
          maxLabel: "Extremely important",
        },
        {
          id: "timeline",
          type: "scale",
          question: "How soon do you need to make this decision?",
          min: 1,
          max: 5,
          minLabel: "No rush",
          maxLabel: "Immediately",
        },
        {
          id: "factors",
          type: "rank",
          question: "Rank these factors in order of importance to you",
          options: ["Salary", "Work-life balance", "Career growth", "Location", "Company culture"],
        },
        {
          id: "relocation",
          type: "boolean",
          question: "Are you willing to relocate for this opportunity?",
          labels: ["No", "Yes"],
        },
        {
          id: "dealbreakers",
          type: "text",
          question: "What are your absolute dealbreakers for this decision?",
          placeholder: "E.g., minimum salary, location constraints, etc.",
        },
      ]

      setQuestions(mockQuestions)
      setCurrentStep("questions")
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionsSubmit = async (answers: Record<string, any>) => {
    setLoading(true)

    try {
      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock response data
      const mockResponse = {
        options: [
          {
            name: "Job Offer A - New York",
            pros: ["Higher salary ($120k)", "Prestigious company", "Career advancement opportunities"],
            cons: ["Higher cost of living", "Longer commute", "More stressful work environment"],
          },
          {
            name: "Job Offer B - Austin",
            pros: ["Good salary ($105k)", "Better work-life balance", "Lower cost of living", "Emerging tech hub"],
            cons: ["Less prestigious company", "Potentially slower career growth", "Relocation required"],
          },
        ],
        criteria: [
          {
            name: "Financial Impact",
            analysis:
              "While Job A offers a higher nominal salary, Job B may provide better financial outcomes when adjusted for cost of living differences.",
          },
          {
            name: "Career Growth",
            analysis:
              "Job A offers more immediate prestige and potential for advancement, while Job B may provide more balanced growth over time.",
          },
          {
            name: "Quality of Life",
            analysis: "Job B appears to offer better work-life balance and potentially less stressful environment.",
          },
        ],
        recommendation:
          "Based on your scenario and your high ranking of work-life balance, Job B in Austin appears to align better with your priorities, though Job A offers stronger immediate career benefits. Since you indicated willingness to relocate and rated this decision as highly important (8/10), we recommend carefully considering the long-term lifestyle implications of each choice.",
      }

      setResult(mockResponse)
      setCurrentStep("results")
    } catch (error) {
      console.error("Error analyzing decision:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetToStart = () => {
    setCurrentStep("input")
    setScenario("")
    setDepth("balanced")
    setQuestions([])
    setResult(null)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Broadly</h1>

        {currentStep === "input" && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="scenario" className="text-base">
                    Describe your decision scenario
                  </Label>
                  <Textarea
                    id="scenario"
                    placeholder="I'm trying to choose between two job offers in different cities..."
                    className="min-h-[120px] resize-none"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Analysis Depth</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {depthOptions.map((option) => (
                      <DepthOptionCard
                        key={option.value}
                        title={option.title}
                        tagline={option.tagline}
                        examples={option.examples}
                        value={option.value}
                        selected={depth === option.value}
                        onSelect={setDepth}
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading || !scenario.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === "questions" && (
          <QuestionsPage
            questions={questions}
            onSubmit={handleQuestionsSubmit}
            onBack={() => setCurrentStep("input")}
            loading={loading}
          />
        )}

        {currentStep === "results" && <ResultsPage result={result} onBack={resetToStart} />}

        <footer className="text-center text-sm text-gray-500 mt-8">Built by Eshaan Chichula</footer>
      </div>
    </main>
  )
}
