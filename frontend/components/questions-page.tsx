"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, GripVertical, ArrowUpDown, CheckCircle, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

type Question = {
  id: string
  type: "scale" | "rank" | "boolean" | "text" | "mcq"
  question: string
  options?: string[]
  [key: string]: any
}

type QuestionsPageProps = {
  questions: Question[]
  onSubmit: (answers: Record<string, any>) => void
  onBack: () => void
  loading?: boolean
}

export default function QuestionsPage({ questions, onSubmit, onBack, loading = false }: QuestionsPageProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [allAnswered, setAllAnswered] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set())

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  useEffect(() => {
    // Initialize answers with default values
    const initialAnswers: Record<string, any> = {}

    questions.forEach((question) => {
      if (question.type === "scale") {
        initialAnswers[question.id] = Math.floor((question.max - question.min) / 2) + question.min
      } else if (question.type === "rank" && question.options) {
        initialAnswers[question.id] = [...question.options]
      } else if (question.type === "boolean") {
        initialAnswers[question.id] = null
      } else if (question.type === "text") {
        initialAnswers[question.id] = ""
      } else if (question.type === "mcq") {
        initialAnswers[question.id] = null
      }
    })

    setAnswers(initialAnswers)
  }, [questions])

  useEffect(() => {
    // Check if all questions are answered and track completed ones
    const completed = new Set<string>()
    const isAllAnswered = questions.every((question) => {
      const isAnswered = (() => {
        if (question.type === "mcq" && answers[question.id] === null) return false
        if (question.type === "boolean" && answers[question.id] === null) return false
        if (question.type === "text" && !answers[question.id]?.trim()) return false
        return answers[question.id] !== undefined
      })()

      if (isAnswered) {
        completed.add(question.id)
      }
      return isAnswered
    })

    setCompletedQuestions(completed)
    setAllAnswered(isAllAnswered)
  }, [answers, questions])

  const handleScaleChange = (id: string, value: number[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value[0] }))
  }

  const handleTextChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleBooleanChange = (id: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleMcqChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const moveItem = (questionId: string, fromIndex: number, toIndex: number) => {
    const items = [...answers[questionId]]
    const [movedItem] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, movedItem)
    setAnswers((prev) => ({ ...prev, [questionId]: items }))
  }

  const handleSubmit = () => {
    onSubmit(answers)
  }

  const handleSkipQuestions = () => {
    // Send a special signal to indicate no user responses
    onSubmit({
      _skipQuestions: true,
      _message:
        "User elected to skip clarifying questions. Please provide an objective assessment based solely on the original scenario description without additional user input.",
    })
  }

  const completionPercentage = Math.round((completedQuestions.size / questions.length) * 100)

  return (
    <div className="space-y-6">
      {/* Header with progress and blindfold mode - completely rebuilt */}
      <div className="mb-6">
        {/* First row: Back button + Title on larger screens */}
        <div className="hidden sm:flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-slate-800/60 border-slate-600/50 text-slate-200 hover:bg-slate-700/60 backdrop-blur-sm min-h-[44px] touch-manipulation transition-smooth button-press focus-ring px-4"
          >
            ← Back
          </Button>

          {/* <div className="flex-1 flex justify-center">
            <h2 className="text-xl font-medium text-slate-200 text-center">Clarifying Questions</h2>
          </div> */}

          <Button
            variant="outline"
            onClick={handleSkipQuestions}
            disabled={loading}
            className="bg-slate-800/60 border-slate-600/50 text-slate-200 hover:bg-slate-700/60 backdrop-blur-sm transition-smooth min-h-[44px] touch-manipulation button-press focus-ring relative group"
          >
            <EyeOff className="mr-2 h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Skip Questions</span>
              <span className="text-xs text-slate-400 group-hover:text-slate-300">AI decides without user bias</span>
            </div>
            {/* <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
              BETA
            </div> */}
          </Button>
        </div>

        {/* Mobile only layout */}
        <div className="sm:hidden space-y-4">
          {/* Centered title above buttons */}
          {/* <h2 className="text-xl font-medium text-slate-200 text-center mb-2">Clarifying Questions</h2> */}
          {/* Back button */}
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-slate-800/60 border-slate-600/50 text-slate-200 hover:bg-slate-700/60 backdrop-blur-sm w-full min-h-[44px] touch-manipulation transition-smooth button-press focus-ring"
          >
            ← Back
          </Button>

          {/* Mobile blindfold button */}
          <Button
            variant="outline"
            onClick={handleSkipQuestions}
            disabled={loading}
            className="bg-slate-800/60 border-slate-600/50 text-slate-200 hover:bg-slate-700/60 backdrop-blur-sm transition-smooth min-h-[44px] touch-manipulation button-press focus-ring relative group w-full"
          >
            <div className="flex items-center justify-center w-full relative">
              <EyeOff className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Skip Questions</span>
              <span className="ml-2 text-s text-slate-400 whitespace-nowrap">(AI evaluation)</span>
              {/* <div className="absolute right-0 bg-blue-500 text-white text-xs px-3 py-0.5 rounded-full font-bold">
                BETA
              </div> */}
            </div>
          </Button>
        </div>

        {/* Progress info - shown on both layouts */}
        {/* <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">
            {completedQuestions.size} of {questions.length} completed
          </p>
        </div> */}

        {/* Progress bar */}
        {/* <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden mt-3">
          <div
            className="bg-gradient-to-r from-slate-400 to-slate-300 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div> */}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card
            key={question.id}
            className={cn(
              "transition-smooth card-hover bg-slate-800/50 border-slate-700 backdrop-blur-sm",
              completedQuestions.has(question.id) && "ring-1 ring-slate-500/50",
            )}
          >
            <CardHeader className="pb-4 px-4 md:px-6">
              <div className="flex items-start space-x-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-1 transition-smooth",
                    completedQuestions.has(question.id)
                      ? "bg-slate-500/50 text-slate-200"
                      : "bg-slate-600/50 text-slate-300",
                  )}
                >
                  {completedQuestions.has(question.id) ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                <CardTitle className="text-base md:text-lg text-slate-200 leading-relaxed">
                  {question.question}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-6">
              {question.type === "scale" && (
                <div className="space-y-8">
                  <div className="pt-6">
                    <div className="relative px-4">
                      <Slider
                        value={
                          answers[question.id]
                            ? [answers[question.id]]
                            : [Math.floor((question.max - question.min) / 2) + question.min]
                        }
                        min={question.min}
                        max={question.max}
                        step={1}
                        onValueChange={(value) => handleScaleChange(question.id, value)}
                        className="w-full [&_[role=slider]]:w-10 [&_[role=slider]]:h-10 [&_[role=slider]]:bg-gradient-to-br [&_[role=slider]]:from-slate-200 [&_[role=slider]]:to-slate-300 [&_[role=slider]]:border-2 [&_[role=slider]]:border-slate-500 [&_[role=slider]]:shadow-lg [&_[role=slider]]:cursor-pointer [&_[role=slider]]:hover:scale-110 [&_[role=slider]]:transition-transform [&_[role=slider]]:touch-manipulation [&_[role=slider]]:focus-ring [&_.slider-track]:h-3 [&_.slider-track]:bg-gradient-to-r [&_.slider-track]:from-slate-600 [&_.slider-track]:to-slate-500 [&_.slider-range]:bg-gradient-to-r [&_.slider-range]:from-slate-300 [&_.slider-range]:to-slate-200"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-slate-400 text-center max-w-[100px] md:max-w-none">
                      <div className="font-medium text-xs md:text-sm leading-tight">
                        {question.minLabel || question.min}
                      </div>
                    </div>
                    <div className="bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600">
                      <span className="font-semibold text-lg text-slate-200">{answers[question.id]}</span>
                    </div>
                    <div className="text-slate-400 text-center max-w-[100px] md:max-w-none">
                      <div className="font-medium text-xs md:text-sm leading-tight">
                        {question.maxLabel || question.max}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {question.type === "rank" && answers[question.id] && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-400 bg-slate-700/30 px-4 py-3 rounded-lg">
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="text-sm">Drag to reorder by preference</span>
                  </div>
                  <div className="space-y-3">
                    {answers[question.id].map((item: string, index: number) => (
                      <div
                        key={`${question.id}-${item}-${index}`}
                        className={cn(
                          "group flex items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600 transition-smooth cursor-move hover:bg-slate-600/50 hover:border-slate-500 touch-manipulation min-h-[60px] focus-ring",
                          draggedItem === item && "opacity-50 scale-95",
                        )}
                        draggable
                        tabIndex={0}
                        onDragStart={(e) => {
                          setDraggedItem(item)
                          e.dataTransfer.effectAllowed = "move"
                          e.dataTransfer.setData("text/plain", JSON.stringify({ questionId: question.id, item, index }))
                        }}
                        onDragEnd={() => setDraggedItem(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const dragData = JSON.parse(e.dataTransfer.getData("text/plain"))
                          if (dragData.questionId === question.id && dragData.index !== index) {
                            moveItem(question.id, dragData.index, index)
                          }
                          setDraggedItem(null)
                        }}
                      >
                        <div className="mr-4 opacity-60 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-5 w-5 text-slate-400" />
                        </div>
                        <span className="text-slate-200 flex-1 font-medium text-base leading-relaxed">{item}</span>
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold text-slate-200">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.type === "boolean" && (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                  <Button
                    variant={answers[question.id] === false ? "default" : "outline"}
                    onClick={() => handleBooleanChange(question.id, false)}
                    className={cn(
                      "flex-1 py-4 text-base font-medium min-h-[48px] touch-manipulation transition-smooth button-press focus-ring",
                      answers[question.id] === false
                        ? "bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-lg"
                        : "bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50",
                    )}
                  >
                    {question.labels?.[0] || "No"}
                  </Button>
                  <Button
                    variant={answers[question.id] === true ? "default" : "outline"}
                    onClick={() => handleBooleanChange(question.id, true)}
                    className={cn(
                      "flex-1 py-4 text-base font-medium min-h-[48px] touch-manipulation transition-smooth button-press focus-ring",
                      answers[question.id] === true
                        ? "bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-lg"
                        : "bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50",
                    )}
                  >
                    {question.labels?.[1] || "Yes"}
                  </Button>
                </div>
              )}

              {question.type === "mcq" && (
                <div className="grid gap-3 grid-cols-1 pt-2">
                  {question.options?.map((option, index) => (
                    <Button
                      key={`${question.id}-${index}`}
                      variant={answers[question.id] === option ? "default" : "outline"}
                      onClick={() => handleMcqChange(question.id, option)}
                      className={cn(
                        "py-4 px-4 h-auto whitespace-normal text-left justify-start break-words min-h-[56px] text-base font-medium touch-manipulation transition-smooth button-press focus-ring",
                        answers[question.id] === option
                          ? "bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-lg"
                          : "bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50",
                      )}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {question.type === "text" && (
                <div className="pt-2">
                  <Textarea
                    value={answers[question.id] || ""}
                    onChange={(e) => handleTextChange(question.id, e.target.value)}
                    placeholder={question.placeholder || "Type your answer here..."}
                    className="resize-none bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-400/20 min-h-[120px] text-base leading-relaxed transition-smooth focus-ring"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit button */}
      <div className="pt-8 pb-4">
        <Button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white font-medium py-4 text-lg shadow-lg hover:shadow-xl transition-smooth min-h-[56px] touch-manipulation button-press focus-ring"
          disabled={loading || !allAnswered}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Analysis...
            </>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <span>Generate Analysis</span>
              <span className="text-lg">→</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
