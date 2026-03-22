"use client"

import { useEffect } from "react"
import { useQueue } from "@/hooks/useQueue"
import type { SpotifyTrack } from "@/types/spotify"
import type { ToastVariant } from "@/hooks/useToast"

interface QueuePanelProps {
  open: boolean
  onClose: () => void
  showToast: (message: string, variant?: ToastVariant) => void
}

function SkeletonRows() {
  return (
    <div className="space-y-2 px-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-5 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function NowPlayingRow({ track }: { track: SpotifyTrack }) {
  const albumImage = track.album?.images?.[track.album.images.length - 1]?.url

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      {albumImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={albumImage}
          alt=""
          className="w-12 h-12 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-white/10 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-white text-sm font-semibold truncate">
          {track.name}
        </div>
        <div className="text-white/45 text-xs truncate">
          {track.artists?.map((a) => a.name).join(", ")}
        </div>
      </div>
    </div>
  )
}

function QueueTrackRow({
  track,
  index,
}: {
  track: SpotifyTrack
  index: number
}) {
  const albumImage = track.album?.images?.[track.album.images.length - 1]?.url

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors"
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span className="text-white/25 text-xs w-5 text-right shrink-0 tabular-nums">
        {index + 1}
      </span>
      {albumImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={albumImage}
          alt=""
          className="w-10 h-10 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-white text-sm font-semibold truncate">
          {track.name}
        </div>
        <div className="text-white/45 text-xs truncate">
          {track.artists?.map((a) => a.name).join(", ")}
        </div>
      </div>
    </div>
  )
}

export default function QueuePanel({
  open,
  onClose,
  showToast,
}: QueuePanelProps) {
  const { currentlyPlaying, queue, isLoading, refetch } = useQueue()

  useEffect(() => {
    if (open) refetch()
  }, [open, refetch])

  const handleClearQueue = () => {
    showToast("To clear the queue, skip through tracks on Spotify", "info")
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 md:hidden transition-opacity duration-300"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 z-[70] h-full w-full md:w-[340px] flex flex-col transition-transform duration-300 ease-out"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          background: "rgba(0, 0, 0, 0.9)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-white text-lg font-bold">Queue</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearQueue}
              className="text-white/35 text-xs hover:text-white/60 transition-colors"
            >
              Clear queue
            </button>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors p-1"
              aria-label="Close queue"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-8">
          {isLoading ? (
            <SkeletonRows />
          ) : (
            <>
              {/* Now Playing */}
              {currentlyPlaying && (
                <div className="mb-2">
                  <div className="px-5 pt-3 pb-1">
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-white/25">
                      Now Playing
                    </span>
                  </div>
                  <NowPlayingRow track={currentlyPlaying} />
                  <div
                    className="mx-5 mt-2"
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  />
                </div>
              )}

              {/* Up Next */}
              <div>
                <div className="px-5 pt-3 pb-1">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-white/25">
                    Up Next
                  </span>
                </div>
                {queue.length === 0 ? (
                  <div className="flex items-center justify-center py-16 px-6">
                    <p className="text-white/30 text-sm text-center">
                      Nothing in queue — add songs from search
                    </p>
                  </div>
                ) : (
                  <div>
                    {queue.map((track, i) => (
                      <QueueTrackRow
                        key={`${track.id}-${i}`}
                        track={track}
                        index={i}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
