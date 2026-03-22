"use client"

import { useState, useEffect, useCallback } from "react"
import { usePlaylists } from "@/hooks/usePlaylists"
import type { SpotifyPlaylist } from "@/types/spotify"
import type { SpotifyTrack } from "@/types/spotify"
import type { ToastVariant } from "@/hooks/useToast"

interface PlaylistPanelProps {
  open: boolean
  onClose: () => void
  showToast: (message: string, variant?: ToastVariant) => void
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function SkeletonRows() {
  return (
    <div className="space-y-2 px-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-12 h-12 rounded-lg bg-white/5 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function PlaylistRow({
  playlist,
  onClick,
}: {
  playlist: SpotifyPlaylist
  onClick: () => void
}) {
  const image = playlist.images?.[0]?.url

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer"
      onClick={onClick}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="w-12 h-12 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-white/10 shrink-0 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
            <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-white text-sm font-semibold truncate">
          {playlist.name}
        </div>
        <div className="text-white/45 text-xs truncate">
          {playlist.tracks.total} tracks
        </div>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/20 shrink-0"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  )
}

function PlaylistDetailTrackRow({
  track,
  index,
  onPlay,
}: {
  track: SpotifyTrack
  index: number
  onPlay: (uri: string) => void
}) {
  const albumImage = track.album?.images?.[track.album.images.length - 1]?.url

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer"
      onClick={() => onPlay(track.uri)}
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
      {track.duration_ms > 0 && (
        <span className="text-white/35 text-xs shrink-0 tabular-nums">
          {formatDuration(track.duration_ms)}
        </span>
      )}
    </div>
  )
}

function NewPlaylistModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (name: string, description: string, isPublic: boolean) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [creating, setCreating] = useState(false)

  if (!open) return null

  const handleSubmit = async () => {
    if (!name.trim() || creating) return
    setCreating(true)
    onCreate(name.trim(), description.trim(), isPublic)
    setName("")
    setDescription("")
    setIsPublic(false)
    setCreating(false)
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm mx-4 rounded-2xl p-6 space-y-4"
        style={{
          background: "rgba(30, 30, 30, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white text-lg font-bold">New Playlist</h3>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Playlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-white/25 transition-colors"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-white/25 transition-colors resize-none"
          />
          <button
            onClick={() => setIsPublic(!isPublic)}
            className="flex items-center gap-2 text-sm"
          >
            <div
              className="w-8 h-[18px] rounded-full transition-colors relative"
              style={{
                background: isPublic
                  ? "rgba(255, 255, 255, 0.4)"
                  : "rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all"
                style={{ left: isPublic ? "16px" : "2px" }}
              />
            </div>
            <span className="text-white/60">
              {isPublic ? "Public" : "Private"}
            </span>
          </button>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-full text-sm text-white/60 hover:text-white transition-colors"
            style={{ border: "1px solid rgba(255, 255, 255, 0.15)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || creating}
            className="flex-1 py-2 rounded-full text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlaylistPanel({
  open,
  onClose,
  showToast,
}: PlaylistPanelProps) {
  const { playlists, isLoading, refetch } = usePlaylists()
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<SpotifyPlaylist | null>(null)
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [tracksLoading, setTracksLoading] = useState(false)
  const [newPlaylistOpen, setNewPlaylistOpen] = useState(false)

  useEffect(() => {
    if (open) refetch()
  }, [open, refetch])

  useEffect(() => {
    if (!open) {
      setSelectedPlaylist(null)
      setTracks([])
    }
  }, [open])

  const handleSelectPlaylist = useCallback(async (playlist: SpotifyPlaylist) => {
    setSelectedPlaylist(playlist)
    setTracksLoading(true)
    try {
      const res = await fetch(`/api/spotify/playlists/${playlist.id}/tracks`)
      if (!res.ok) throw new Error("Failed to fetch tracks")
      const data = await res.json()
      setTracks(data.tracks ?? [])
    } catch {
      showToast("Failed to load playlist tracks", "error")
    } finally {
      setTracksLoading(false)
    }
  }, [showToast])

  const handlePlayPlaylist = useCallback(async () => {
    if (!selectedPlaylist) return
    const res = await fetch(`/api/spotify/playlists/${selectedPlaylist.id}/play`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    if (!res.ok) {
      showToast("Open Spotify on a device first", "error")
      return
    }
    showToast(`Playing ${selectedPlaylist.name}`)
  }, [selectedPlaylist, showToast])

  const handlePlayTrack = useCallback(
    async (uri: string) => {
      const res = await fetch("/api/spotify/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri }),
      })
      if (!res.ok) {
        showToast("Open Spotify on a device first", "error")
      }
    },
    [showToast]
  )

  const handleCreatePlaylist = useCallback(
    async (name: string, description: string, isPublic: boolean) => {
      const res = await fetch("/api/spotify/playlists/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, public: isPublic }),
      })
      if (res.ok) {
        setNewPlaylistOpen(false)
        showToast("Playlist created")
        refetch()
      } else {
        showToast("Failed to create playlist", "error")
      }
    },
    [showToast, refetch]
  )

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
        className="fixed top-0 left-0 z-[70] h-full w-full md:w-[360px] flex flex-col transition-transform duration-300 ease-out"
        style={{
          transform: open ? "translateX(0)" : "translateX(-100%)",
          background: "rgba(0, 0, 0, 0.9)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {selectedPlaylist ? (
          <>
            {/* Detail Header */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-3">
              <button
                onClick={() => {
                  setSelectedPlaylist(null)
                  setTracks([])
                }}
                className="text-white/50 hover:text-white transition-colors p-1"
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
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="text-white/50 text-sm">Playlists</span>
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors p-1 md:hidden"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Playlist info */}
            <div className="px-5 pb-4 flex items-center gap-4">
              {selectedPlaylist.images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedPlaylist.images[0].url}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-white/10 shrink-0 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                    <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-white text-lg font-bold truncate">
                  {selectedPlaylist.name}
                </h2>
                <p className="text-white/45 text-xs mt-0.5">
                  {selectedPlaylist.tracks.total} tracks
                </p>
                <button
                  onClick={handlePlayPlaylist}
                  className="mt-2 px-5 py-1.5 rounded-full text-xs font-semibold bg-white text-black hover:bg-white/90 transition-colors"
                >
                  Play
                </button>
              </div>
            </div>

            <div
              className="mx-5"
              style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
            />

            {/* Track list */}
            <div className="flex-1 overflow-y-auto pb-8">
              {tracksLoading ? (
                <SkeletonRows />
              ) : tracks.length === 0 ? (
                <div className="flex items-center justify-center py-16 px-6">
                  <p className="text-white/30 text-sm text-center">
                    This playlist is empty
                  </p>
                </div>
              ) : (
                <div className="pt-2">
                  {tracks.map((track, i) => (
                    <PlaylistDetailTrackRow
                      key={`${track.id}-${i}`}
                      track={track}
                      index={i}
                      onPlay={handlePlayTrack}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* List Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-white text-lg font-bold">Your Playlists</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNewPlaylistOpen(true)}
                  className="text-white/60 text-xs hover:text-white transition-colors px-2.5 py-1 rounded-full"
                  style={{ border: "1px solid rgba(255, 255, 255, 0.15)" }}
                >
                  New Playlist
                </button>
                <button
                  onClick={onClose}
                  className="text-white/50 hover:text-white transition-colors p-1 md:hidden"
                  aria-label="Close playlists"
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

            {/* Playlist list */}
            <div className="flex-1 overflow-y-auto pb-8">
              {isLoading ? (
                <SkeletonRows />
              ) : playlists.length === 0 ? (
                <div className="flex items-center justify-center py-16 px-6">
                  <p className="text-white/30 text-sm text-center">
                    No playlists found
                  </p>
                </div>
              ) : (
                <div>
                  {playlists.map((playlist) => (
                    <PlaylistRow
                      key={playlist.id}
                      playlist={playlist}
                      onClick={() => handleSelectPlaylist(playlist)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <NewPlaylistModal
        open={newPlaylistOpen}
        onClose={() => setNewPlaylistOpen(false)}
        onCreate={handleCreatePlaylist}
      />
    </>
  )
}
