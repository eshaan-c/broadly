"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, GripVertical } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

type Question = {
  id: string
  type: "scale" | "rank" | "boolean" | "text"
  question: string
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

  useEffect(() => {
    // Initialize answers with default values
    const initialAnswers: Record<string, any> = {}

    questions.forEach((question) => {
      if (question.type === "scale") {
        initialAnswers[question.id] = Math.floor((question.max - question.min) / 2) + question.min
      } else if (question.type === "rank") {
        initialAnswers[question.id] = [...question.options]
      } else if (question.type === "boolean") {
        initialAnswers[question.id] = null
      } else if (question.type === "text") {
        initialAnswers[question.id] = ""
      }
    })

    setAnswers(initialAnswers)
  }, [questions])

  useEffect(() => {
    // Check if all questions are answered
    const isAllAnswered = questions.every((question) => {
      if (question.type === "boolean" && answers[question.id] === null) return false
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

  const handleRankReorder = (id: string, result: any) => {
    if (!result.destination) return

    const items = Array.from(answers[id])
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setAnswers((prev) => ({ ...prev, [id]: items }))
  }

  const handleSubmit = () => {
    onSubmit(answers)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <h2 className="text-lg font-medium">Clarifying Questions</h2>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{question.question}</CardTitle>
            </CardHeader>
            <CardContent>
              {question.type === "scale" && (
                <div className="space-y-4">
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
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{question.minLabel || question.min}</span>
                    <span className="font-medium">{answers[question.id]}</span>
                    <span>{question.maxLabel || question.max}</span>
                  </div>
                </div>
              )}

              {question.type === "rank" && answers[question.id] && (
                <DragDropContext onDragEnd={(result) => handleRankReorder(question.id, result)}>
                  <Droppable droppableId={`droppable-${question.id}`}>
                    {(provided) => (
                      <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {answers[question.id].map((item: string, index: number) => (
                          <Draggable key={item} draggableId={item} index={index}>
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center p-3 bg-slate-50 rounded-md border border-slate-200"
                              >
                                <div {...provided.dragHandleProps} className="mr-2">
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                </div>
                                <span>{item}</span>
                                <span className="ml-auto text-sm text-gray-500">#{index + 1}</span>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              {question.type === "boolean" && (
                <div className="flex space-x-4">
                  <Button
                    variant={answers[question.id] === false ? "default" : "outline"}
                    onClick={() => handleBooleanChange(question.id, false)}
                    className="flex-1"
                  >
                    {question.labels?.[0] || "No"}
                  </Button>
                  <Button
                    variant={answers[question.id] === true ? "default" : "outline"}
                    onClick={() => handleBooleanChange(question.id, true)}
                    className="flex-1"
                  >
                    {question.labels?.[1] || "Yes"}
                  </Button>
                </div>
              )}

              {question.type === "text" && (
                <Textarea
                  value={answers[question.id] || ""}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                  placeholder={question.placeholder || "Type your answer here..."}
                  className="resize-none"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSubmit} className="w-full" disabled={loading || !allAnswered}>
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
  )
}
