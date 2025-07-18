"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface AnimatedPlaceholderProps {
  placeholders: string[]
  interval?: number
}

export default function AnimatedPlaceholder({ placeholders, interval = 6000 }: AnimatedPlaceholderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (placeholders.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % placeholders.length)
    }, interval)

    return () => clearInterval(timer)
  }, [placeholders, interval])

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 flex items-start pt-3 px-3"
        >
          <span className="text-slate-400 text-base leading-relaxed">{placeholders[currentIndex]}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
