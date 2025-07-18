"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface LoadingScreenProps {
  message: string
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Define different loading messages based on the main message
  const getLoadingMessages = (baseMessage: string) => {
    if (baseMessage.includes("Analyzing")) {
      return ["Analyzing your scenario...", "Identifying key factors...", "Generating clarifying questions..."]
    } else if (baseMessage.includes("Generating")) {
      return ["Generating recommendations...", "Evaluating all options...", "Calculating final scores..."]
    } else {
      return ["Processing your request...", "Analyzing data...", "Almost ready..."]
    }
  }

  const loadingMessages = getLoadingMessages(message)

  useEffect(() => {
    // Reset when message changes
    setCurrentMessageIndex(0)
    setTimeElapsed(0)
  }, [message])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 100 // Update every 100ms for smooth progress

        // Stage 1: 0-8 seconds
        if (newTime >= 8000 && currentMessageIndex === 0) {
          setCurrentMessageIndex(1)
        }
        // Stage 2: 8-16 seconds
        else if (newTime >= 16000 && currentMessageIndex === 1) {
          setCurrentMessageIndex(2)
        }
        // Stage 3: 16+ seconds (stays until loading completes)

        return newTime
      })
    }, 100)

    return () => clearInterval(interval)
  }, [currentMessageIndex])

  // Calculate progress for current stage
  const getStageProgress = () => {
    if (currentMessageIndex === 0) {
      return Math.min((timeElapsed / 8000) * 100, 100)
    } else if (currentMessageIndex === 1) {
      return Math.min(((timeElapsed - 8000) / 8000) * 100, 100)
    } else {
      // Final stage - show indeterminate progress
      return 100
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md"
    >
      <div className="flex flex-col items-center space-y-8">
        {/* Animated logo/icon */}
        <div className="relative">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-16 h-16 border-2 border-slate-600 rounded-full"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute inset-2 bg-gradient-to-r from-slate-300 to-white rounded-full"
            />
          </motion.div>

          {/* Orbiting dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
                delay: i * 0.5,
              }}
              className="absolute inset-0"
            >
              <div className="w-2 h-2 bg-slate-300 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2" />
            </motion.div>
          ))}
        </div>

        {/* Loading text with transitions */}
        <div className="text-center space-y-2">
          <div className="h-8 flex items-center justify-center">
            <motion.p
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-slate-200 text-lg font-medium"
            >
              {loadingMessages[currentMessageIndex]}
            </motion.p>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
                className="w-1 h-1 bg-slate-400 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Enhanced Progress bar with stage-based progress */}
        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
          {currentMessageIndex < 2 ? (
            // Stages 1 & 2: Show actual progress
            <motion.div
              className="h-full bg-gradient-to-r from-slate-300 to-white rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${getStageProgress()}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          ) : (
            // Stage 3: Indeterminate progress
            <motion.div
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-slate-300 to-transparent"
            />
          )}
        </div>

        {/* Enhanced Step indicator with progress */}
        <div className="flex space-x-3">
          {loadingMessages.map((_, index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <motion.div
                className={`w-3 h-3 rounded-full transition-colors duration-500 ${
                  index < currentMessageIndex
                    ? "bg-slate-300"
                    : index === currentMessageIndex
                      ? "bg-slate-400"
                      : "bg-slate-600"
                }`}
                animate={index === currentMessageIndex ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
              />
              <div className="text-xs text-slate-500 text-center min-w-[60px]">
                {index < currentMessageIndex
                  ? "✓"
                  : index === currentMessageIndex
                    ? `${Math.floor(timeElapsed / 1000)}s`
                    : ""}
              </div>
            </div>
          ))}
        </div>

        {/* Time elapsed indicator */}
        <div className="text-xs text-slate-500">{Math.floor(timeElapsed / 1000)}s elapsed</div>
      </div>
    </motion.div>
  )
}
