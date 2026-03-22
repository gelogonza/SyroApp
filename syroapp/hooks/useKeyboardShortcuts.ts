"use client"

import { useEffect } from "react"

export interface KeyboardShortcutActions {
  playPause: () => void
  next: () => void
  previous: () => void
  seekForward: () => void
  seekBackward: () => void
  volumeUp: () => void
  volumeDown: () => void
  toggleShuffle: () => void
  toggleMute: () => void
  closeAll: () => void
  toggleShortcutsHelp: () => void
}

const PANEL_BLOCKED_KEYS = new Set(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"])

function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

export function useKeyboardShortcuts(
  actions: KeyboardShortcutActions,
  options?: { isPanelOpen?: boolean }
): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isInputFocused()) return

      const isPanelOpen = options?.isPanelOpen ?? false

      if (isPanelOpen && PANEL_BLOCKED_KEYS.has(e.code)) return

      switch (e.code) {
        case "Space":
          e.preventDefault()
          actions.playPause()
          break
        case "ArrowRight":
          e.preventDefault()
          actions.seekForward()
          break
        case "ArrowLeft":
          e.preventDefault()
          actions.seekBackward()
          break
        case "ArrowUp":
          e.preventDefault()
          actions.volumeUp()
          break
        case "ArrowDown":
          e.preventDefault()
          actions.volumeDown()
          break
        case "Escape":
          actions.closeAll()
          break
        default:
          if (e.key === "N" && e.shiftKey) {
            actions.next()
          } else if (e.key === "P" && e.shiftKey) {
            actions.previous()
          } else if (e.key === "S" && e.shiftKey) {
            actions.toggleShuffle()
          } else if (e.key === "m" || e.key === "M") {
            if (!e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
              actions.toggleMute()
            }
          } else if (e.key === "?") {
            actions.toggleShortcutsHelp()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [actions, options?.isPanelOpen])
}
