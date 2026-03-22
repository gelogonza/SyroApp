"use client"

import { useState, useEffect, useRef } from "react"

interface UseProgressParams {
  progressMs: number
  durationMs: number
  isPlaying: boolean
}

export function useProgress({
  progressMs,
  durationMs,
  isPlaying,
}: UseProgressParams) {
  const [displayProgress, setDisplayProgress] = useState(progressMs)
  const lastProgressRef = useRef(progressMs)

  useEffect(() => {
    if (Math.abs(progressMs - lastProgressRef.current) > 2500) {
      setDisplayProgress(progressMs)
    } else {
      setDisplayProgress(progressMs)
    }
    lastProgressRef.current = progressMs
  }, [progressMs])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        const next = prev + 1000
        return next > durationMs ? durationMs : next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, durationMs])

  return { displayProgress }
}
