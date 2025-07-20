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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg"
    >
      <div className="flex flex-col items-center space-y-10 p-8">
        {/* Enhanced Animated logo/icon */}
        <div className="relative">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-20 h-20 border-2 border-slate-600/50 rounded-full relative"
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute inset-3 bg-gradient-to-r from-slate-300 to-white rounded-full shadow-lg"
            />

            {/* Enhanced glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-400/20 to-slate-300/20 rounded-full blur-xl animate-pulse"></div>
          </motion.div>

          {/* Enhanced Orbiting dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
                delay: i * 0.6,
              }}
              className="absolute inset-0"
            >
              <div className="w-3 h-3 bg-gradient-to-r from-slate-300 to-slate-200 rounded-full absolute -top-1.5 left-1/2 transform -translate-x-1/2 shadow-lg" />
            </motion.div>
          ))}
        </div>

        {/* Enhanced Loading text with transitions */}
        <div className="text-center space-y-4">
          <div className="h-10 flex items-center justify-center">
            <motion.p
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-slate-200 text-xl font-medium tracking-wide"
            >
              {loadingMessages[currentMessageIndex]}
            </motion.p>
          </div>

          {/* Enhanced Animated dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.3,
                }}
                className="w-1.5 h-1.5 bg-slate-400 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Enhanced Progress bar with stage-based progress */}
        <div className="w-80 h-2.5 bg-slate-800/60 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50">
          {currentMessageIndex < 2 ? (
            // Stages 1 & 2: Show actual progress
            <motion.div
              className="h-full bg-gradient-to-r from-slate-300 via-white to-slate-300 rounded-full shadow-inner"
              initial={{ width: "0%" }}
              animate={{ width: `${getStageProgress()}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          ) : (
            // Stage 3: Enhanced indeterminate progress
            <motion.div
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="h-full w-2/5 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-full"
            />
          )}
        </div>

        {/* Enhanced Step indicator with progress */}
        <div className="flex space-x-6">
          {loadingMessages.map((_, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <motion.div
                className={`w-4 h-4 rounded-full transition-all duration-500 border-2 ${
                  index < currentMessageIndex
                    ? "bg-slate-300 border-slate-300 shadow-lg"
                    : index === currentMessageIndex
                      ? "bg-slate-400 border-slate-400 shadow-md"
                      : "bg-transparent border-slate-600"
                }`}
                animate={index === currentMessageIndex ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
              >
                {index < currentMessageIndex && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                )}
              </motion.div>
              <div className="text-xs text-slate-500 text-center min-w-[60px] font-medium">
                {index < currentMessageIndex
                  ? "✓"
                  : index === currentMessageIndex
                    ? `${Math.floor(timeElapsed / 1000)}s`
                    : ""}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Time elapsed indicator */}
        <div className="text-sm text-slate-500 bg-slate-800/40 px-4 py-2 rounded-full border border-slate-700/50 backdrop-blur-sm">
          {Math.floor(timeElapsed / 1000)}s elapsed
        </div>
      </div>
    </motion.div>
  )
}
