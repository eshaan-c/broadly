"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, GripVertical, ArrowUpDown } from "lucide-react"
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
  loading: boolean
}

export default function QuestionsPage({ questions, onSubmit, onBack, loading }: QuestionsPageProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [allAnswered, setAllAnswered] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

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
    // Check if all questions are answered
    const isAllAnswered = questions.every((question) => {
      if (question.type === "mcq" && answers[question.id] === null) return false
      if (question.type === "text" && !answers[question.id]?.trim()) return false
      return answers[question.id] !== undefined
    })

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

  return (
    <div className="space-y-6 pb-24 md:pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700/50 w-full sm:w-auto"
        >
          ← Back
        </Button>
        <h2 className="text-lg font-medium text-slate-200 text-center sm:text-left">Clarifying Questions</h2>
        <div className="hidden sm:block w-16"></div> {/* Spacer for centering on desktop */}
      </div>

      <div className="space-y-4 md:space-y-6">
        {questions.map((question, index) => (
          <Card
            key={question.id}
            className="transition-all hover:shadow-md bg-slate-800/50 border-slate-700 backdrop-blur-sm"
          >
            <CardHeader className="pb-2 px-4 md:px-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-600/50 flex items-center justify-center text-xs md:text-sm font-semibold text-slate-300 flex-shrink-0 mt-1">
                  {index + 1}
                </div>
                <CardTitle className="text-base md:text-lg text-slate-200 leading-relaxed">
                  {question.question}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              {question.type === "scale" && (
                <div className="space-y-8">
                  {/* Added space above slider */}
                  <div className="pt-4">
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
                        className="w-full [&_[role=slider]]:w-8 [&_[role=slider]]:h-8 [&_[role=slider]]:bg-gradient-to-br [&_[role=slider]]:from-slate-200 [&_[role=slider]]:to-slate-300 [&_[role=slider]]:border-2 [&_[role=slider]]:border-slate-500 [&_[role=slider]]:shadow-lg [&_[role=slider]]:cursor-pointer [&_[role=slider]]:hover:scale-110 [&_[role=slider]]:transition-transform [&_.slider-track]:h-2 [&_.slider-track]:bg-gradient-to-r [&_.slider-track]:from-slate-600 [&_.slider-track]:to-slate-500 [&_.slider-range]:bg-gradient-to-r [&_.slider-range]:from-slate-300 [&_.slider-range]:to-slate-200"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-slate-400 text-center max-w-[80px] md:max-w-none">
                      <div className="font-medium text-xs md:text-sm">{question.minLabel || question.min}</div>
                    </div>
                    <div className="bg-slate-700/50 px-3 py-1 rounded-md border border-slate-600">
                      <span className="font-semibold text-base text-slate-200">{answers[question.id]}</span>
                    </div>
                    <div className="text-slate-400 text-center max-w-[80px] md:max-w-none">
                      <div className="font-medium text-xs md:text-sm">{question.maxLabel || question.max}</div>
                    </div>
                  </div>
                </div>
              )}

              {question.type === "rank" && answers[question.id] && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-slate-400 mb-4 bg-slate-700/30 px-3 py-2 rounded-lg">
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="text-xs md:text-sm">Drag to reorder by preference</span>
                  </div>
                  {answers[question.id].map((item: string, index: number) => (
                    <div
                      key={`${question.id}-${item}-${index}`}
                      className={cn(
                        "group flex items-center p-3 md:p-4 bg-slate-700/50 rounded-lg border border-slate-600 transition-all cursor-move hover:bg-slate-600/50 hover:border-slate-500 touch-manipulation",
                        draggedItem === item && "opacity-50 scale-95",
                      )}
                      draggable
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
                      <div className="mr-3 md:mr-4 opacity-60 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                      </div>
                      <span className="text-slate-200 flex-1 font-medium text-sm md:text-base">{item}</span>
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs md:text-sm font-bold text-slate-200">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "boolean" && (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button
                    variant={answers[question.id] === false ? "default" : "outline"}
                    onClick={() => handleBooleanChange(question.id, false)}
                    className={cn(
                      "flex-1 py-3 text-sm md:text-base",
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
                      "flex-1 py-3 text-sm md:text-base",
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
                <div
                  className={cn(
                    "grid gap-3",
                    question.options && question.options.length > 2 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
                  )}
                >
                  {question.options?.map((option, index) => (
                    <Button
                      key={`${question.id}-${index}`}
                      variant={answers[question.id] === option ? "default" : "outline"}
                      onClick={() => handleMcqChange(question.id, option)}
                      className={cn(
                        "py-3 px-4 h-auto whitespace-normal text-left justify-start break-words min-h-[3rem] text-sm md:text-base",
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
                <Textarea
                  value={answers[question.id] || ""}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                  placeholder={question.placeholder || "Type your answer here..."}
                  className="resize-none bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-400/20 min-h-[100px] md:min-h-[120px]"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white font-medium py-4 text-base md:text-lg shadow-lg hover:shadow-xl transition-all"
          disabled={loading || !allAnswered}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Analysis...
            </>
          ) : (
            "Generate Analysis"
          )}
        </Button>
      </div>
    </div>
  )
}
