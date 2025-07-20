"use client"

import type React from "react"

import { useState, useEffect } from "react"
import ScenarioForm from "@/components/scenario-form"
import QuestionForm from "@/components/question-form"
import Results from "@/components/results"
import LoadingScreen from "@/components/loading-screen"
import { decisionAPI, type AnalyzeResponse } from "@/lib/api"

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

  // Scroll to top when step changes
  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [currentStep, loading])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to go back (except on scenario step)
      if (e.key === "Escape" && currentStep !== "scenario") {
        if (currentStep === "questions") {
          setCurrentStep("scenario")
        } else if (currentStep === "results") {
          setCurrentStep("scenario")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentStep])

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoadingMessage("Analyzing your scenario...")

    try {
      const data = await decisionAPI.analyze({ scenario, depth })

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
      // Better error handling
      const errorMessage = err instanceof Error ? err.message : "Analysis failed. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluate = async (answers: Record<string, any>) => {
    if (!framework) return
    setLoading(true)
    setLoadingMessage("Generating recommendations...")

    try {
      const res = await decisionAPI.evaluate({
        framework,
        responses: answers,
      })

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
      const errorMessage = err instanceof Error ? err.message : "Evaluation failed. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = () => {
    setScenario("")
    setDepth("balanced")
    setCurrentStep("scenario")
    setQuestions([])
    setResult(null)
    setFramework(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-900/50 to-slate-950"></div>

      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-800/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-700/10 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Progress indicator */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-full px-4 py-2 border border-slate-800/50">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentStep === "scenario" ? "bg-slate-300" : "bg-slate-600"
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentStep === "questions" ? "bg-slate-300" : "bg-slate-600"
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentStep === "results" ? "bg-slate-300" : "bg-slate-600"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Single scrollable container */}
      <div className="relative min-h-screen">
        {loading && <LoadingScreen message={loadingMessage} />}

        {/* Main content with proper spacing for mobile */}
        <div className="px-4 py-8 pb-24">
          <div className="w-full max-w-4xl mx-auto">
            {/* Enhanced Header */}
            <div className="text-center mb-8 md:mb-12 mt-16 md:mt-20">
              <div className="relative inline-block">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent mb-3 md:mb-4 tracking-tight animate-gradient">
                  broadly
                </h1>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 text-5xl md:text-6xl lg:text-7xl font-bold text-white/5 blur-xl">
                  broadly
                </div>
              </div>
              <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide px-4">
                Structured decisions, powered by AI
              </p>
              {/* Subtle divider */}
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent mx-auto mt-4 md:mt-6"></div>
            </div>

            {currentStep === "scenario" && (
              <div className="animate-fade-in-up">
                <ScenarioForm
                  scenario={scenario}
                  setScenario={setScenario}
                  depth={depth}
                  setDepth={setDepth}
                  onSubmit={handleAnalyze}
                />
              </div>
            )}

            {currentStep === "questions" && (
              <div className="animate-fade-in-up">
                <QuestionForm
                  questions={questions}
                  onSubmit={handleEvaluate}
                  onBack={() => setCurrentStep("scenario")}
                />
              </div>
            )}

            {currentStep === "results" && result && (
              <div className="animate-fade-in-up">
                <Results result={result} onBack={handleRestart} />
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer with better positioning */}
        <footer className="fixed bottom-0 left-0 right-0 z-10 p-4 pointer-events-none">
          <div className="flex justify-center">
            <div className="flex items-center justify-center space-x-2 bg-slate-900/90 backdrop-blur-md rounded-full px-4 py-2 border border-slate-800/50 pointer-events-auto transition-smooth hover:bg-slate-900/95">
              <span className="text-sm text-slate-500">by</span>
              <a
                href="https://github.com/eshaan-c"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 underline hover:text-slate-300 transition-colors duration-200 font-medium focus-ring rounded"
              >
                Eshaan
              </a>
              <span className="text-slate-400 text-base">⌘</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
