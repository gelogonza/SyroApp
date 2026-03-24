"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePlaybackState } from "@/hooks/usePlaybackState"
import { useProgress } from "@/hooks/useProgress"
import VinylRecord from "./VinylRecord"
import ProgressBar from "./ProgressBar"
import Controls from "./Controls"
import VolumeBar from "./VolumeBar"
import SearchBar from "./SearchBar"
import DeviceSelector from "./DeviceSelector"
import Toast from "./Toast"
import QueuePanel from "./QueuePanel"
import PlaylistPanel from "./PlaylistPanel"
import AddToPlaylistModal from "./AddToPlaylistModal"
import KeyboardShortcutsHelp from "./KeyboardShortcutsHelp"
import { useToast } from "@/hooks/useToast"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = 50
        canvas.height = 50
        const ctx = canvas.getContext("2d")
        if (!ctx) { resolve("#1a4a3a"); return }
        ctx.drawImage(img, 0, 0, 50, 50)
        let data: Uint8ClampedArray
        try {
          data = ctx.getImageData(0, 0, 50, 50).data
        } catch {
          resolve("#1a4a3a")
          return
        }
        let r = 0, g = 0, b = 0, count = 0
        for (let i = 0; i < data.length; i += 16) {
          r += data[i]; g += data[i + 1]; b += data[i + 2]; count++
        }
        r = Math.round((r / count) * 0.6)
        g = Math.round((g / count) * 0.6)
        b = Math.round((b / count) * 0.6)
        resolve(`rgb(${r}, ${g}, ${b})`)
      } catch {
        resolve("#1a4a3a")
      }
    }
    img.onerror = () => resolve("#1a4a3a")
    img.src = imageUrl
  })
}

function darkenColor(color: string): string {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return "#0a1a14"
  const r = Math.round(parseInt(match[1]) * 0.3)
  const g = Math.round(parseInt(match[2]) * 0.3)
  const b = Math.round(parseInt(match[3]) * 0.3)
  return `rgb(${r}, ${g}, ${b})`
}

export default function Player() {
  const { state, refetch } = usePlaybackState()
  const [bgColor, setBgColor] = useState("#1a4a3a")
  const lastAlbumId = useRef<string | null>(null)
  const { toast, showToast } = useToast()
  const [queueOpen, setQueueOpen] = useState(false)
  const [playlistOpen, setPlaylistOpen] = useState(false)
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const lastVolumeRef = useRef(100)
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)
  const [searchClearTrigger, setSearchClearTrigger] = useState(0)

  const track = state?.item ?? null
  const isPlaying = state?.is_playing ?? false
  const progressMs = state?.progress_ms ?? 0
  const durationMs = track?.duration_ms ?? 0
  const shuffleState = state?.shuffle_state ?? false
  const repeatState = state?.repeat_state ?? "off"
  const device = state?.device ?? null
  const albumArt = track?.album?.images?.[0]?.url ?? null

  const { displayProgress } = useProgress({ progressMs, durationMs, isPlaying })

  useEffect(() => {
    const albumId = track?.album?.id
    if (!albumId || albumId === lastAlbumId.current) return
    lastAlbumId.current = albumId
    if (albumArt) {
      extractDominantColor(albumArt).then(setBgColor)
    }
  }, [track?.album?.id, albumArt])

  useEffect(() => {
    if (device?.volume_percent !== undefined) {
      setVolume(device.volume_percent)
      if (device.volume_percent > 0) {
        lastVolumeRef.current = device.volume_percent
        setIsMuted(false)
      }
    }
  }, [device?.volume_percent])

  const apiCall = useCallback(
    async (
      endpoint: string,
      method: "GET" | "POST" = "POST",
      body?: Record<string, unknown>
    ) => {
      await fetch(`/api/spotify/${endpoint}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      setTimeout(refetch, 500)
    },
    [refetch]
  )

  const handlePlayPause = useCallback(() => {
    apiCall(isPlaying ? "pause" : "resume")
  }, [apiCall, isPlaying])

  const handleNext = useCallback(() => apiCall("next"), [apiCall])
  const handlePrevious = useCallback(() => apiCall("previous"), [apiCall])

  const handleShuffle = useCallback(() => {
    apiCall("shuffle", "POST", { state: !shuffleState })
  }, [apiCall, shuffleState])

  const handleRepeat = useCallback(() => {
    const nextMode =
      repeatState === "off"
        ? "context"
        : repeatState === "context"
          ? "track"
          : "off"
    apiCall("repeat", "POST", { mode: nextMode })
  }, [apiCall, repeatState])

  const handleSeek = useCallback(
    (positionMs: number) => {
      apiCall("seek", "POST", { positionMs })
    },
    [apiCall]
  )

  const handleVolume = useCallback(
    (volumePercent: number) => {
      setVolume(volumePercent)
      setIsMuted(volumePercent === 0)
      if (volumePercent > 0) lastVolumeRef.current = volumePercent
      apiCall("volume", "POST", { volumePercent })
    },
    [apiCall]
  )

  const handlePlay = useCallback(
    async (uri: string) => {
      const res = await fetch("/api/spotify/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri }),
      })
      if (!res.ok) {
        showToast("Open Spotify on a device first", "error")
        return
      }
      setTimeout(refetch, 600)
    },
    [refetch, showToast]
  )

  const handleAddToQueue = useCallback(
    async (uri: string) => {
      const res = await fetch("/api/spotify/queue/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri }),
      })
      if (res.ok) {
        showToast("Added to queue")
      } else {
        showToast("Failed to add to queue", "error")
      }
    },
    [showToast]
  )

  const handleTransfer = useCallback(
    (deviceId: string) => {
      apiCall("transfer", "POST", { deviceId })
    },
    [apiCall]
  )

  const kbPlayPause = useCallback(() => {
    handlePlayPause()
    showToast(isPlaying ? "\u23F8 Paused" : "\u25B6 Playing", "shortcut", 1500)
  }, [handlePlayPause, isPlaying, showToast])

  const kbNext = useCallback(() => {
    handleNext()
    showToast("\u23ED Next track", "shortcut", 1500)
  }, [handleNext, showToast])

  const kbPrevious = useCallback(() => {
    handlePrevious()
    showToast("\u23EE Previous track", "shortcut", 1500)
  }, [handlePrevious, showToast])

  const kbSeekForward = useCallback(() => {
    const current = state?.progress_ms ?? 0
    const duration = state?.item?.duration_ms ?? 0
    const newPos = Math.min(current + 10000, duration)
    apiCall("seek", "POST", { positionMs: newPos })
    showToast("+10s", "shortcut", 1500)
  }, [state, apiCall, showToast])

  const kbSeekBackward = useCallback(() => {
    const current = state?.progress_ms ?? 0
    const newPos = Math.max(current - 10000, 0)
    apiCall("seek", "POST", { positionMs: newPos })
    showToast("\u221210s", "shortcut", 1500)
  }, [state, apiCall, showToast])

  const kbVolumeUp = useCallback(() => {
    const newVol = Math.min(volume + 10, 100)
    setVolume(newVol)
    setIsMuted(false)
    lastVolumeRef.current = newVol
    apiCall("volume", "POST", { volumePercent: newVol })
    showToast(`Volume ${newVol}%`, "shortcut", 1500)
  }, [volume, apiCall, showToast])

  const kbVolumeDown = useCallback(() => {
    const newVol = Math.max(volume - 10, 0)
    setVolume(newVol)
    if (newVol === 0) setIsMuted(true)
    apiCall("volume", "POST", { volumePercent: newVol })
    showToast(`Volume ${newVol}%`, "shortcut", 1500)
  }, [volume, apiCall, showToast])

  const kbToggleMute = useCallback(() => {
    if (isMuted) {
      const restored = lastVolumeRef.current
      setVolume(restored)
      setIsMuted(false)
      apiCall("volume", "POST", { volumePercent: restored })
      showToast("\uD83D\uDD0A Volume restored", "shortcut", 1500)
    } else {
      lastVolumeRef.current = volume
      setVolume(0)
      setIsMuted(true)
      apiCall("volume", "POST", { volumePercent: 0 })
      showToast("\uD83D\uDD07 Muted", "shortcut", 1500)
    }
  }, [isMuted, volume, apiCall, showToast])

  const kbToggleShuffle = useCallback(() => {
    handleShuffle()
    showToast(shuffleState ? "\uD83D\uDD00 Shuffle off" : "\uD83D\uDD00 Shuffle on", "shortcut", 1500)
  }, [handleShuffle, shuffleState, showToast])

  const kbCloseAll = useCallback(() => {
    setQueueOpen(false)
    setPlaylistOpen(false)
    setSearchClearTrigger((prev) => prev + 1)
  }, [])

  useKeyboardShortcuts(
    {
      playPause: kbPlayPause,
      next: kbNext,
      previous: kbPrevious,
      seekForward: kbSeekForward,
      seekBackward: kbSeekBackward,
      volumeUp: kbVolumeUp,
      volumeDown: kbVolumeDown,
      toggleShuffle: kbToggleShuffle,
      toggleMute: kbToggleMute,
      closeAll: kbCloseAll,
      toggleShortcutsHelp: () => setShortcutsHelpOpen((prev) => !prev),
    },
    { isPanelOpen: queueOpen || playlistOpen }
  )

  const darkBg = darkenColor(bgColor)

  return (
    <div
      className="fixed inset-0 flex flex-col items-center overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at center, ${bgColor} 0%, ${darkBg} 100%)`,
        transition: "background 1.5s ease",
      }}
    >
      {/* Search */}
      <div className="w-full max-w-[680px] px-6 pt-6 pb-2 z-10">
        <SearchBar onPlay={handlePlay} showToast={showToast} onAddToQueue={handleAddToQueue} clearTrigger={searchClearTrigger} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[680px] px-6 gap-6 md:gap-8 -mt-4">
        {/* Vinyl */}
        <VinylRecord albumArt={albumArt} isPlaying={isPlaying} />

        {/* Track info */}
        <div className="text-center space-y-1 min-h-[80px]">
          {track ? (
            <>
              <h1 className="text-2xl md:text-[2rem] font-bold text-white leading-tight">
                {track.name}
              </h1>
              <p className="text-base md:text-[1.1rem] text-white/80">
                {track.artists.map((a) => a.name).join(", ")}
              </p>
              <p className="text-sm md:text-[0.9rem] text-white/55">
                {track.album.name}
              </p>
              <button
                onClick={() => setAddToPlaylistOpen(true)}
                className="inline-flex items-center gap-1 mt-1 text-white/25 hover:text-white/60 transition-colors"
                aria-label="Add to playlist"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-xs">Add to playlist</span>
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-[2rem] font-bold text-white/40">
                No track playing
              </h1>
              <p className="text-base text-white/25">
                Play something on Spotify to get started
              </p>
            </>
          )}
        </div>

        {/* Progress */}
        <div className="w-full">
          <ProgressBar
            progressMs={displayProgress}
            durationMs={durationMs}
            onSeek={handleSeek}
          />
        </div>

        {/* Controls */}
        <Controls
          isPlaying={isPlaying}
          shuffleState={shuffleState}
          repeatState={repeatState}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onShuffle={handleShuffle}
          onRepeat={handleRepeat}
          onQueueToggle={() => {
            setQueueOpen((prev) => {
              const next = !prev
              if (next && window.innerWidth < 768) setPlaylistOpen(false)
              return next
            })
          }}
          queueOpen={queueOpen}
          onPlaylistToggle={() => {
            setPlaylistOpen((prev) => {
              const next = !prev
              if (next && window.innerWidth < 768) setQueueOpen(false)
              return next
            })
          }}
          playlistOpen={playlistOpen}
        />
      </div>

      {/* Bottom bar */}
      <div className="w-full max-w-[680px] px-6 pb-6 pt-2 flex items-center justify-between">
        <VolumeBar volume={volume} onVolumeChange={handleVolume} />
        <div className="relative z-20">
          <DeviceSelector currentDevice={device} onTransfer={handleTransfer} />
        </div>
      </div>

      <PlaylistPanel
        open={playlistOpen}
        onClose={() => setPlaylistOpen(false)}
        showToast={showToast}
      />

      <QueuePanel
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        showToast={showToast}
      />

      <AddToPlaylistModal
        open={addToPlaylistOpen}
        onClose={() => setAddToPlaylistOpen(false)}
        currentTrack={track}
        showToast={showToast}
      />

      <KeyboardShortcutsHelp
        open={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />

      <Toast toast={toast} />

      <button
        onClick={() => setShortcutsHelpOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-30 hover:opacity-80 transition-opacity z-[5]"
        style={{ background: "rgba(255, 255, 255, 0.1)" }}
        aria-label="Keyboard shortcuts"
      >
        ?
      </button>
    </div>
  )
}
