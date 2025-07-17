"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ResultsPageProps = {
  result: any
  onBack: () => void
}

export default function ResultsPage({ result, onBack }: ResultsPageProps) {
  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="mb-2 bg-transparent">
        ← Start New Analysis
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Decision Analysis</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-3">Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.options.map((option: any, index: number) => (
                  <Card key={index} className="bg-slate-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{option.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-green-600 mb-1">Pros</h4>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          {option.pros.map((pro: string, i: number) => (
                            <li key={i}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-red-600 mb-1">Cons</h4>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          {option.cons.map((con: string, i: number) => (
                            <li key={i}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Evaluation Criteria</h3>
              <div className="space-y-4">
                {result.criteria.map((criterion: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-1">{criterion.name}</h4>
                    <p className="text-sm text-gray-700">{criterion.analysis}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Recommendation</h3>
              <div className="border-l-4 border-blue-500 pl-4 py-1">
                <p className="text-sm">{result.recommendation}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
