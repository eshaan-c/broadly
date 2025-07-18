"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface AnimatedTextCyclerProps {
  texts: string[]
  interval?: number
}

export default function AnimatedTextCycler({ texts, interval = 4000 }: AnimatedTextCyclerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (texts.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, interval)

    return () => clearInterval(timer)
  }, [texts, interval])

  return (
    <div className="h-12 relative overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-xs text-slate-400 absolute text-center"
        >
          {texts[currentIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
