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

import { decisionAPI, type AnalyzeResponse, type EvaluateResponse } from "@/lib/api"


export default function Home() {
  const [scenario, setScenario] = useState("")
  const [depth, setDepth] = useState<"quick" | "balanced" | "thorough">("balanced")
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState("input") // "input", "questions", "results"
  const [framework, setFramework] = useState<AnalyzeResponse | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)

  const depthOptions = [
    {
      title: "Quick",
      value: "quick" as const,
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
      value: "balanced" as const,
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
      value: "thorough" as const,
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
      //  API call with a timeout
      const response = await decisionAPI.analyze({ scenario, depth })


      // Mock questions data that would come from the API
      const transformedQuestions = response.questions.map((q, index) => ({
        id: `q_${index}`,
        type: q.type,
        question: q.text,
        ...(q.type === 'scale' && {
          min: 1,
          max: 10,
          minLabel: "Low",
          maxLabel: "High"
        }),
        ...(q.type === 'rank' && {
          options: q.options || []
        }),
        ...(q.type === 'boolean' && {
          labels: ["No", "Yes"]
        }),
        ...(q.type === 'text' && {
          placeholder: "Enter your response..."
        }),
        criteria_link: q.criteria_link
      }))

      setFramework(response)
      setQuestions(transformedQuestions)
      setCurrentStep("questions")

    } catch (error) {
      console.error("Error analyzing scenario:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionsSubmit = async (answers: Record<string, any>) => {
    setLoading(true)

    try {
      if (!framework) {
        throw new Error("No framework available")
      }

      const transformedResponses: Record<string, any> = {}
      Object.entries(answers).forEach(([key, value]) => {
        // Extract the index from the question ID (e.g., "q_0" -> "0")
        const index = key.replace('q_', '')
        transformedResponses[index] = value
      })

      // Call the evaluation endpoint
      const evaluation = await decisionAPI.evaluate({
        framework,
        responses: transformedResponses
      })

      // Mock response data
      // const mockResponse = {
      //   options: [
      //     {
      //       name: "Job Offer A - New York",
      //       pros: ["Higher salary ($120k)", "Prestigious company", "Career advancement opportunities"],
      //       cons: ["Higher cost of living", "Longer commute", "More stressful work environment"],
      //     },
      //     {
      //       name: "Job Offer B - Austin",
      //       pros: ["Good salary ($105k)", "Better work-life balance", "Lower cost of living", "Emerging tech hub"],
      //       cons: ["Less prestigious company", "Potentially slower career growth", "Relocation required"],
      //     },
      //   ],
      //   criteria: [
      //     {
      //       name: "Financial Impact",
      //       analysis:
      //         "While Job A offers a higher nominal salary, Job B may provide better financial outcomes when adjusted for cost of living differences.",
      //     },
      //     {
      //       name: "Career Growth",
      //       analysis:
      //         "Job A offers more immediate prestige and potential for advancement, while Job B may provide more balanced growth over time.",
      //     },
      //     {
      //       name: "Quality of Life",
      //       analysis: "Job B appears to offer better work-life balance and potentially less stressful environment.",
      //     },
      //   ],
      //   recommendation:
      //     "Based on your scenario and your high ranking of work-life balance, Job B in Austin appears to align better with your priorities, though Job A offers stronger immediate career benefits. Since you indicated willingness to relocate and rated this decision as highly important (8/10), we recommend carefully considering the long-term lifestyle implications of each choice.",
      // }

      // Transform the evaluation response to match the expected result format
      const transformedResult = {
        options: Object.entries(evaluation.option_scores).map(([name, scores]) => ({
          name,
          pros: scores.strengths,
          cons: scores.weaknesses,
          score: scores.total_score,
          confidence: scores.confidence
        })),
        criteria: framework.criteria.map(criterion => ({
          name: criterion.name,
          analysis: `Weight: ${(criterion.weight * 100).toFixed(0)}% - ${criterion.description}`,
          scores: Object.entries(evaluation.option_scores).reduce((acc, [optionName, scores]) => {
            acc[optionName] = scores.criteria_scores[criterion.name] || 0
            return acc
          }, {} as Record<string, number>)
        })),
        recommendation: evaluation.recommendation.reasoning,
        primaryChoice: evaluation.recommendation.primary_choice,
        alternatives: evaluation.recommendation.alternatives,
        redFlags: evaluation.recommendation.red_flags
      }

      setResult(transformedResult)
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
    setFramework(null)
    setResult(null)
    setQuestions([])
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
                    placeholder="My friends and I are trying to decide a place to go for a tropical fall break trip."
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
