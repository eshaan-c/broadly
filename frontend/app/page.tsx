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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First API call
      const response = await decisionAPI.analyze({ scenario, depth });

      // Initialize the options array from the first API response
      const initialOptions = response.options.map((option: any) => ({
        name: option.name,
        description: option.description,
        inferred: option.inferred,
      }));

      const transformedQuestions = response.questions.map((q, index) => ({
        id: `q_${index}`,
        type: q.type,
        question: q.text,
        ...(q.type === "scale" && {
          min: q.min,
          max: q.max,
          minLabel: q.minLabel,
          maxLabel: q.maxLabel,
        }),
        ...(q.type === "rank" && {
          options: q.options || [],
        }),
        ...(q.type === "boolean" && {
          labels: ["No", "Yes"],
        }),
        ...(q.type === "text" && {
          placeholder: "Enter your response...",
        }),
        criteria_link: q.criteria_link,
      }));

      setFramework({ ...response, initialOptions }); // Save initial options in the framework
      setQuestions(transformedQuestions);
      setCurrentStep("questions");
    } catch (error) {
      console.error("Error analyzing scenario:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionsSubmit = async (answers: Record<string, any>) => {
    setLoading(true);

    try {
      if (!framework) {
        throw new Error("No framework available");
      }

      const transformedResponses: Record<string, any> = {};
      Object.entries(answers).forEach(([key, value]) => {
        const index = key.replace("q_", "");
        transformedResponses[index] = value;
      });

      // Second API call
      const evaluation = await decisionAPI.evaluate({
        framework,
        responses: transformedResponses,
      });

      // Merge the initial options with the evaluation results
      const mergedOptions = framework.initialOptions.map((option: any) => ({
        ...option,
        ...evaluation.option_scores[option.name], // Merge scores and other data
      }));

      const transformedResult = {
        options: mergedOptions.map((option: any) => ({
          name: option.name,
          description: option.description,
          inferred: option.inferred,
          pros: option.strengths,
          cons: option.weaknesses,
          score: option.total_score,
          confidence: option.confidence,
        })),
        criteria: framework.criteria.map((criterion) => ({
          name: criterion.name,
          analysis: `Weight: ${(criterion.weight * 100).toFixed(0)}% - ${criterion.description}`,
          scores: Object.entries(evaluation.option_scores).reduce(
            (acc, [optionName, scores]) => {
              acc[optionName] = scores.criteria_scores[criterion.name] || 0;
              return acc;
            },
            {} as Record<string, number>
          ),
        })),
        recommendation: evaluation.recommendation.reasoning,
        primaryChoice: evaluation.recommendation.primary_choice,
        alternatives: evaluation.recommendation.alternatives,
        redFlags: evaluation.recommendation.red_flags,
      };

      setResult(transformedResult);
      setCurrentStep("results");
    } catch (error) {
      console.error("Error analyzing decision:", error);
    } finally {
      setLoading(false);
    }
  };

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
