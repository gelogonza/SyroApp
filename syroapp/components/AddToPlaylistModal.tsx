"use client"

import { usePlaylists } from "@/hooks/usePlaylists"
import type { SpotifyTrack } from "@/types/spotify"
import type { SpotifyPlaylist } from "@/types/spotify"
import type { ToastVariant } from "@/hooks/useToast"

interface AddToPlaylistModalProps {
  open: boolean
  onClose: () => void
  currentTrack: SpotifyTrack | null
  showToast: (message: string, variant?: ToastVariant) => void
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
    </div>
  )
}

export default function AddToPlaylistModal({
  open,
  onClose,
  currentTrack,
  showToast,
}: AddToPlaylistModalProps) {
  const { playlists, isLoading } = usePlaylists()

  if (!open || !currentTrack) return null

  const handleAddToPlaylist = async (playlist: SpotifyPlaylist) => {
    const res = await fetch(`/api/spotify/playlists/${playlist.id}/add-track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uri: currentTrack.uri }),
    })

    if (res.status === 403) {
      showToast("You can only add tracks to playlists you own", "error")
      return
    }

    if (!res.ok) {
      showToast("Failed to add track", "error")
      return
    }

    onClose()
    showToast(`Added to ${playlist.name}`)
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm mx-4 rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "rgba(30, 30, 30, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          maxHeight: "70vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3 space-y-2">
          <h3 className="text-white text-lg font-bold">Add to playlist</h3>
          <div className="flex items-center gap-3">
            {currentTrack.album?.images?.[
              currentTrack.album.images.length - 1
            ]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  currentTrack.album.images[
                    currentTrack.album.images.length - 1
                  ].url
                }
                alt=""
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-white text-sm font-semibold truncate">
                {currentTrack.name}
              </div>
              <div className="text-white/45 text-xs truncate">
                {currentTrack.artists?.map((a) => a.name).join(", ")}
              </div>
            </div>
          </div>
          <div
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
          />
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {isLoading ? (
            <div className="space-y-2 px-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-12 h-12 rounded-lg bg-white/5 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 rounded bg-white/5 animate-pulse" />
                    <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="flex items-center justify-center py-8 px-6">
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
                  onClick={() => handleAddToPlaylist(playlist)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
