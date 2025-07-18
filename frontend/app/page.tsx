"use client"

import type React from "react"

import { useState } from "react"
import ScenarioForm from "@/components/scenario-form"
import QuestionForm from "@/components/question-form"
import Results from "@/components/results"
import LoadingScreen from "@/components/loading-screen"
import { decisionAPI, AnalyzeResponse } from "@/lib/api"

type Step = "scenario" | "questions" | "results"

export default function Home() {
  const [scenario, setScenario] = useState("")
  const [depth, setDepth] = useState<"quick" | "balanced" | "thorough">("balanced")
  const [currentStep, setCurrentStep] = useState<Step>("scenario")
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)
  const [framework, setFramework] = useState<AnalyzeResponse | null>(null)

  /* ------- first step: /analyze ------- */
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoadingMessage("Analyzing your scenario...")

    try {
      const data = await decisionAPI.analyze({ scenario, depth })

      // transform questions
      const qs = data.questions.map((q: any, idx: number) => ({
        id: `q_${idx}`,
        question: q.text,
        type: q.type,
        ...q,
      }))

      setFramework(data)
      setQuestions(qs)
      setCurrentStep("questions")
    } catch (err) {
      console.error("Analyze failed:", err)
      alert("Analysis failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /* ------- second step: /evaluate ------- */
  const handleEvaluate = async (answers: Record<string, any>) => {
    if (!framework) return
    setLoading(true)
    setLoadingMessage("Generating recommendations...")

    try {
      const res = await decisionAPI.evaluate({
        framework,
        responses: answers,
      })

      // Transform the response to match what ResultsPage expects
      const merged = {
        ...res,
        options: framework.options.map((opt: any) => ({
          name: opt.name,
          description: opt.description,
          inferred: opt.inferred,
          pros: res.option_scores[opt.name]?.strengths || [],
          cons: res.option_scores[opt.name]?.weaknesses || [],
          score: res.option_scores[opt.name]?.total_score || 0,
          confidence: res.option_scores[opt.name]?.confidence || "medium",
        })),
        criteria: framework.criteria.map((c: any) => ({
          name: c.name,
          analysis: `${c.description} (weight ${(c.weight * 100).toFixed(0)}%)`,
        })),
        primaryChoice: res.recommendation.primary_choice,
        recommendation: res.recommendation.reasoning,
        redFlags: res.recommendation.red_flags,
      }

      setResult(merged)
      setCurrentStep("results")
    } catch (err) {
      console.error("Evaluate failed:", err)
      alert("Evaluation failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-900/50 to-slate-950"></div>

      <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {loading && <LoadingScreen message={loadingMessage} />}

        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent mb-2">
              Broadly
            </h1>
            <p className="text-slate-400 text-lg">AI-Powered Decision Frameworks</p>
          </div>

          {currentStep === "scenario" && (
            <ScenarioForm
              scenario={scenario}
              setScenario={setScenario}
              depth={depth}
              setDepth={setDepth}
              onSubmit={handleAnalyze}
            />
          )}

          {currentStep === "questions" && <QuestionForm questions={questions} onSubmit={handleEvaluate} />}

          {currentStep === "results" && result && <Results result={result} />}
        </div>

        {/* Footer */}
        <footer className="absolute bottom-4 text-center text-sm text-slate-500">
          by Eshaan ⌘
        </footer>
      </main>
    </div>
  )
}
