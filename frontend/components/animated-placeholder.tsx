"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface AnimatedPlaceholderProps {
  placeholders: string[]
  interval?: number
}

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function AnimatedPlaceholder({ placeholders, interval = 9000 }: AnimatedPlaceholderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [order, setOrder] = useState<number[]>([])
  const orderRef = useRef<number[]>([])

  useEffect(() => {
    if (placeholders.length === 0) return
    const newOrder = shuffle(Array.from({ length: placeholders.length }, (_, i) => i))
    setOrder(newOrder)
    orderRef.current = newOrder
    setCurrentIndex(0)
  }, [placeholders])

  useEffect(() => {
    if (placeholders.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1
        if (next >= orderRef.current.length) {
          // Reshuffle and restart
          const newOrder = shuffle(Array.from({ length: placeholders.length }, (_, i) => i))
          setOrder(newOrder)
          orderRef.current = newOrder
          return 0
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [placeholders, interval])

  if (placeholders.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={order[currentIndex]}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 flex items-start pt-3 px-3"
        >
          <span className="text-slate-400 text-base leading-relaxed">
            {placeholders[order[currentIndex]]}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
