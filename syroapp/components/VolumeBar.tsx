"use client"

import { useRef, useState } from "react"

interface VolumeBarProps {
  volume: number
  onVolumeChange: (volume: number) => void
}

function SpeakerIcon({ volume }: { volume: number }) {
  if (volume === 0) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-white/70"
      >
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </svg>
    )
  }
  if (volume < 50) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-white/70"
      >
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
      </svg>
    )
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-white/70"
    >
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}

export default function VolumeBar({ volume, onVolumeChange }: VolumeBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragVolume, setDragVolume] = useState(volume)

  const displayVolume = isDragging ? dragVolume : volume

  function calcVolume(clientX: number) {
    if (!barRef.current) return 0
    const rect = barRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
  }

  function handleClick(e: React.MouseEvent) {
    const v = calcVolume(e.clientX)
    onVolumeChange(Math.round(v))
  }

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    setIsDragging(true)
    setDragVolume(calcVolume(e.clientX))

    const handleMouseMove = (ev: MouseEvent) => {
      setDragVolume(calcVolume(ev.clientX))
    }

    const handleMouseUp = (ev: MouseEvent) => {
      const v = calcVolume(ev.clientX)
      onVolumeChange(Math.round(v))
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onVolumeChange(volume === 0 ? 50 : 0)}
        className="shrink-0"
        aria-label="Toggle mute"
      >
        <SpeakerIcon volume={displayVolume} />
      </button>
      <div
        ref={barRef}
        className="relative w-24 cursor-pointer group py-2"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >
        <div className="w-full h-[4px] rounded-full bg-white/20 group-hover:h-[5px] transition-all">
          <div
            className="h-full rounded-full bg-white relative"
            style={{ width: `${displayVolume}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
          </div>
        </div>
      </div>
      <span className="text-[11px] text-white/40 tabular-nums w-7 text-right">
        {Math.round(displayVolume)}%
      </span>
    </div>
  )
}
