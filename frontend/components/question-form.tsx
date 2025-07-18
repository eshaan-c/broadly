"use client"

import { useState } from "react"
import QuestionsPage from "@/components/questions-page"

interface Props {
  questions: any[]
  onSubmit: (answers: Record<string, any>) => void
}

export default function QuestionForm({ questions, onSubmit }: Props) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (answers: Record<string, any>) => {
    setLoading(true)
    try {
      await onSubmit(answers)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    window.location.reload() // Simple way to go back to start
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <QuestionsPage questions={questions} onSubmit={handleSubmit} onBack={handleBack} loading={loading} />
    </div>
  )
}
