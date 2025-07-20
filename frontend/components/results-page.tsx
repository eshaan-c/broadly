"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star, BarChart3, ArrowLeft } from "lucide-react"

type ResultsPageProps = {
  result: any
  onBack: () => void
}

export default function ResultsPage({ result, onBack }: ResultsPageProps) {
  // Sort options by score (high to low)
  const sortedOptions = [...result.options].sort((a, b) => b.score - a.score)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header - simplified without gradient */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onBack}
          className="bg-slate-800/60 border-slate-600/50 text-slate-200 hover:bg-slate-700/60 backdrop-blur-sm transition-all duration-300 group min-h-[44px] touch-manipulation"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Start New Analysis
        </Button>
      </div>

      {/* Main content - single scroll */}
      <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-md shadow-2xl">
        <CardHeader className="border-b border-slate-700/50 px-4 md:px-6">
          <CardTitle className="text-xl md:text-2xl text-slate-200 flex items-center space-x-3">
            <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />
            <span>Decision Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-8">
          <div className="space-y-12">
            {/* Enhanced Options Section - moved to top */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-6 text-slate-200">All Options Compared</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedOptions.map((option: any, index: number) => (
                  <Card
                    key={index}
                    className="bg-slate-700/40 border-slate-600/50 relative backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300 group"
                  >
                    {index === 0 && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        Top Choice
                      </div>
                    )}
                    <CardHeader className="pb-4 px-4 md:px-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base md:text-lg text-slate-200 mb-2">{option.name}</CardTitle>
                          <p className="text-sm text-slate-400 leading-relaxed mb-3">{option.description}</p>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm md:text-base font-semibold text-slate-300">
                              Score: {option.score}
                            </span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-4 w-4 transition-colors duration-200",
                                    i < Math.round(option.score / 2) ? "text-amber-400 fill-current" : "text-slate-600",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 px-4 md:px-6">
                      <div>
                        <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          Strengths
                        </h4>
                        <ul className="text-sm list-none space-y-2 text-slate-300">
                          {option.pros.map((pro: string, i: number) => (
                            <li key={i} className="flex items-start space-x-2">
                              <span className="text-green-400 mt-1 text-xs">●</span>
                              <span className="leading-relaxed">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                          Considerations
                        </h4>
                        <ul className="text-sm list-none space-y-2 text-slate-300">
                          {option.cons.map((con: string, i: number) => (
                            <li key={i} className="flex items-start space-x-2">
                              <span className="text-red-400 mt-1 text-xs">●</span>
                              <span className="leading-relaxed">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>


            {/* Enhanced Primary Choice Section */}
            <div>
              <div className="relative group transform transition-all duration-300 hover:scale-[1.01]">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                <div className="relative bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/30 rounded-xl p-5 md:p-8 backdrop-blur-sm">
                  {/* Mobile layout - stacked */}
                  <div className="md:hidden mb-4 flex justify-center">
                    <div className="p-4 bg-amber-400/20 rounded-full">
                      <Trophy className="h-12 w-12 text-amber-400" />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Desktop layout - side by side, hidden on mobile */}
                    <div className="hidden md:block flex-shrink-0 p-4 bg-amber-400/20 rounded-full">
                      <Trophy className="h-12 w-12 text-amber-400" />
                    </div>

                    <div className="flex-1">
                      <div className="border-b border-amber-400/30 pb-4 mb-4">
                        <p className="text-xl md:text-3xl font-bold text-amber-300 text-center md:text-left bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200 text-transparent">
                          {result.primaryChoice}
                        </p>
                      </div>

                      <div className="max-h-[200px] md:max-h-[300px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
                        <p className="text-amber-200/80 font-medium text-sm md:text-base leading-relaxed whitespace-pre-line">
                          {result.recommendation}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-amber-400/20 flex justify-center md:justify-start">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Evaluation Criteria - moved to middle */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-6 text-slate-200">Evaluation Criteria</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {result.criteria.map((criterion: any, index: number) => {
                  const weightMatch = criterion.analysis.match(/weight (\d+)%/)
                  const weight = weightMatch ? Number.parseInt(weightMatch[1]) : 0

                  return (
                    <div key={index} className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600/20 to-slate-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      <div className="relative bg-slate-700/40 border border-slate-600/50 rounded-xl p-4 md:p-6 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-semibold text-slate-200 text-base md:text-lg pr-4">{criterion.name}</h4>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xl md:text-2xl font-bold text-slate-300">{weight}%</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Weight</div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                          {criterion.analysis.replace(/\s*\(weight \d+%\)/, "").trim()}
                        </p>
                        <div className="w-full bg-slate-800/60 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-slate-400 to-slate-300 h-2.5 rounded-full transition-all duration-700 shadow-inner"
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
