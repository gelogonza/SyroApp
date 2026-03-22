"use client"

import { useEffect, useRef } from "react"

interface KeyboardShortcutsHelpProps {
  open: boolean
  onClose: () => void
}

const shortcuts = [
  { key: "Space", description: "Play / Pause" },
  { key: "→", description: "Seek forward 10s" },
  { key: "←", description: "Seek backward 10s" },
  { key: "↑", description: "Volume up 10%" },
  { key: "↓", description: "Volume down 10%" },
  { key: "Shift + N", description: "Next track" },
  { key: "Shift + P", description: "Previous track" },
  { key: "Shift + S", description: "Toggle shuffle" },
  { key: "M", description: "Mute / Unmute" },
  { key: "Esc", description: "Close panels" },
  { key: "?", description: "Show shortcuts" },
]

export default function KeyboardShortcutsHelp({ open, onClose }: KeyboardShortcutsHelpProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "?") {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener("keydown", handleKey, true)
    return () => window.removeEventListener("keydown", handleKey, true)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="rounded-2xl p-6 w-full max-w-sm mx-4"
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-2.5">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span
                className="px-2.5 py-1 rounded-md text-xs font-mono text-white/90"
                style={{ background: "rgba(255, 255, 255, 0.1)" }}
              >
                {s.key}
              </span>
              <span className="text-sm text-white/70">{s.description}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full py-2 rounded-lg text-sm text-white/50 hover:text-white/80 transition-colors"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
