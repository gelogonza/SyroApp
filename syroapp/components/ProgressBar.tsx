"use client"

import { useRef, useState } from "react"

interface ProgressBarProps {
  progressMs: number
  durationMs: number
  onSeek: (positionMs: number) => void
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export default function ProgressBar({
  progressMs,
  durationMs,
  onSeek,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)

  const fraction = durationMs > 0 ? progressMs / durationMs : 0
  const displayFraction = isDragging ? dragProgress : fraction

  function calcFraction(clientX: number) {
    if (!barRef.current) return 0
    const rect = barRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  function handleClick(e: React.MouseEvent) {
    const f = calcFraction(e.clientX)
    onSeek(Math.round(f * durationMs))
  }

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true)
    setDragProgress(calcFraction(e.clientX))

    const handleMouseMove = (ev: MouseEvent) => {
      setDragProgress(calcFraction(ev.clientX))
    }

    const handleMouseUp = (ev: MouseEvent) => {
      const f = calcFraction(ev.clientX)
      onSeek(Math.round(f * durationMs))
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div className="w-full">
      <div
        ref={barRef}
        className="relative w-full cursor-pointer group py-2"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >
        <div
          className="w-full rounded-full bg-white/20 transition-all duration-150"
          style={{ height: isHovering || isDragging ? 6 : 4 }}
        >
          <div
            className="h-full rounded-full bg-white relative"
            style={{ width: `${displayFraction * 100}%` }}
          >
            {(isHovering || isDragging) && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md" />
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[11px] text-white/50 tabular-nums">
          {formatTime(isDragging ? dragProgress * durationMs : progressMs)}
        </span>
        <span className="text-[11px] text-white/50 tabular-nums">
          {formatTime(durationMs)}
        </span>
      </div>
    </div>
  )
}
