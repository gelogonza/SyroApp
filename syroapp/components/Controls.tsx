"use client"

interface ControlsProps {
  isPlaying: boolean
  shuffleState: boolean
  repeatState: "off" | "context" | "track"
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onShuffle: () => void
  onRepeat: () => void
}

function ShuffleIcon({ active }: { active: boolean }) {
  return (
    <div className="relative">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-colors ${active ? "text-white" : "text-white/60"}`}
      >
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
      {active && (
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
      )}
    </div>
  )
}

function PreviousIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-white"
    >
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-black ml-0.5"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-black"
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-white"
    >
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  )
}

function RepeatIcon({ state }: { state: "off" | "context" | "track" }) {
  const active = state !== "off"
  return (
    <div className="relative">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-colors ${active ? "text-white" : "text-white/60"}`}
      >
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
      {state === "track" && (
        <span className="absolute -top-1 -right-1.5 text-[9px] font-bold text-white">
          1
        </span>
      )}
      {active && (
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
      )}
    </div>
  )
}

export default function Controls({
  isPlaying,
  shuffleState,
  repeatState,
  onPlayPause,
  onNext,
  onPrevious,
  onShuffle,
  onRepeat,
}: ControlsProps) {
  return (
    <div className="flex items-center justify-center gap-6 md:gap-8">
      <button
        onClick={onShuffle}
        className="p-2 hover:scale-110 transition-transform"
        aria-label="Toggle shuffle"
      >
        <ShuffleIcon active={shuffleState} />
      </button>

      <button
        onClick={onPrevious}
        className="p-2 hover:scale-110 transition-transform"
        aria-label="Previous track"
      >
        <PreviousIcon />
      </button>

      <button
        onClick={onPlayPause}
        className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <button
        onClick={onNext}
        className="p-2 hover:scale-110 transition-transform"
        aria-label="Next track"
      >
        <NextIcon />
      </button>

      <button
        onClick={onRepeat}
        className="p-2 hover:scale-110 transition-transform"
        aria-label="Toggle repeat"
      >
        <RepeatIcon state={repeatState} />
      </button>
    </div>
  )
}
