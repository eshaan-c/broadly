"use client"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star, BarChart3 } from "lucide-react"

type ResultsPageProps = {
  result: any
  onBack: () => void
}

export default function ResultsPage({ result, onBack }: ResultsPageProps) {
  // Sort options by score (high to low)
  const sortedOptions = [...result.options].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={onBack}
        className="mb-2 bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700/50"
      >
        ← Start New Analysis
      </Button>

      <Card className="mb-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">Decision Analysis</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto">
          <div className="space-y-8">
            {/* Enhanced Primary Choice Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-slate-200">Primary Choice</h3>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 rounded-lg blur"></div>
                <div className="relative bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/30 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-8 w-8 text-amber-400" />
                    <div>
                      <p className="text-2xl font-bold text-amber-300 mb-1">{result.primaryChoice}</p>
                      <p className="text-sm text-amber-200/80">Recommended choice</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Recommendation Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-slate-200">Recommendation</h3>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-lg blur"></div>
                <div className="relative bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <Star className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-base text-blue-100 leading-relaxed">{result.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Options Section with Sorted Results */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-slate-200">Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedOptions.map((option: any, index: number) => (
                  <Card key={index} className="bg-slate-700/30 border-slate-600 relative">
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                        #1
                      </div>
                    )}
                    <CardHeader className="pb-2 flex flex-col items-start">
                      <CardTitle className="text-base text-slate-200">{option.name}</CardTitle>
                      <p className="text-sm text-slate-400">{option.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-semibold text-slate-300">Score: {option.score}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3 w-3",
                                i < Math.round(option.score / 2) ? "text-amber-400 fill-current" : "text-slate-600",
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-green-400 mb-1">Pros</h4>
                        <ul className="text-sm list-disc pl-5 space-y-1 text-slate-300">
                          {option.pros.map((pro: string, i: number) => (
                            <li key={i}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-red-400 mb-1">Cons</h4>
                        <ul className="text-sm list-disc pl-5 space-y-1 text-slate-300">
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

            {/* Enhanced Evaluation Criteria */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-slate-200 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Evaluation Criteria</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.criteria.map((criterion: any, index: number) => {
                  // Extract weight from analysis text
                  const weightMatch = criterion.analysis.match(/weight (\d+)%/)
                  const weight = weightMatch ? Number.parseInt(weightMatch[1]) : 0

                  return (
                    <div key={index} className="relative group hover:scale-[1.02] transition-transform duration-200">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600/20 to-slate-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative bg-slate-700/40 border border-slate-600 rounded-lg p-5 backdrop-blur-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-200 text-base">{criterion.name}</h4>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-300">{weight}%</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Weight</div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {criterion.analysis.replace(/\s*\(.*?weight \d+%.*?\)/, '').trim()}
                        </p>
                        {/* Visual weight indicator */}
                        <div className="mt-3 w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-slate-400 to-slate-300 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${weight}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
