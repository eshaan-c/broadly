"use client"

import ResultsPage from "@/components/results-page"

interface Props {
  result: any
}

export default function Results({ result }: Props) {
  const handleBack = () => {
    window.location.reload() // Simple way to start over
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <ResultsPage result={result} onBack={handleBack} />
    </div>
  )
}
