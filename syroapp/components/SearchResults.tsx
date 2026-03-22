"use client"

import { useState, useCallback } from "react"
import type {
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifySearchResults,
} from "@/types/spotify"
import type { ToastVariant } from "@/hooks/useToast"

interface SearchResultsProps {
  results: SpotifySearchResults
  isLoading: boolean
  query: string
  onPlayTrack: (uri: string) => Promise<void>
  showToast: (message: string, variant?: ToastVariant) => void
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function SkeletonRows() {
  return (
    <div className="p-3 space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
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

function TrackRow({
  track,
  onPlay,
  showToast,
  indent = false,
}: {
  track: SpotifyTrack
  onPlay: (uri: string) => Promise<void>
  showToast: (message: string, variant?: ToastVariant) => void
  indent?: boolean
}) {
  const handleClick = async () => {
    try {
      await onPlay(track.uri)
    } catch {
      showToast("Open Spotify on a device first", "error")
    }
  }

  const albumImage = track.album?.images?.[track.album.images.length - 1]?.url

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 py-2 px-3 transition-colors text-left rounded-lg"
      style={{ paddingLeft: indent ? "2rem" : undefined }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
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
    </button>
  )
}

function ArtistRow({
  artist,
  onPlay,
  showToast,
}: {
  artist: SpotifyArtist
  onPlay: (uri: string) => Promise<void>
  showToast: (message: string, variant?: ToastVariant) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(async () => {
    if (expanded) {
      setExpanded(false)
      return
    }
    setExpanded(true)
    if (tracks.length > 0) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/spotify/artist-top-tracks?id=${artist.id}`
      )
      if (res.ok) {
        const data = await res.json()
        setTracks(data.tracks ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [expanded, tracks.length, artist.id])

  const artistImage = artist.images?.[artist.images.length - 1]?.url

  return (
    <div>
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 py-2 px-3 transition-colors text-left rounded-lg"
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "transparent")
        }
      >
        {artistImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artistImage}
            alt=""
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm font-semibold truncate">
            {artist.name}
          </div>
          <div className="text-white/45 text-xs">Artist</div>
        </div>
        <svg
          className="w-4 h-4 text-white/30 shrink-0 transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div className="pl-2">
          {loading ? (
            <SkeletonRows />
          ) : (
            tracks.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                onPlay={onPlay}
                showToast={showToast}
                indent
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function AlbumRow({
  album,
  onPlay,
  showToast,
}: {
  album: SpotifyAlbum
  onPlay: (uri: string) => Promise<void>
  showToast: (message: string, variant?: ToastVariant) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(async () => {
    if (expanded) {
      setExpanded(false)
      return
    }
    setExpanded(true)
    if (tracks.length > 0) return
    setLoading(true)
    try {
      const res = await fetch(`/api/spotify/album-tracks?id=${album.id}`)
      if (res.ok) {
        const data = await res.json()
        setTracks(data.tracks ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [expanded, tracks.length, album.id])

  const albumImage = album.images?.[album.images.length - 1]?.url

  return (
    <div>
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 py-2 px-3 transition-colors text-left rounded-lg"
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "transparent")
        }
      >
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
            {album.name}
          </div>
          <div className="text-white/45 text-xs truncate">
            {album.artists?.map((a) => a.name).join(", ")}
          </div>
        </div>
        <svg
          className="w-4 h-4 text-white/30 shrink-0 transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div className="pl-2">
          {loading ? (
            <SkeletonRows />
          ) : (
            tracks.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                onPlay={onPlay}
                showToast={showToast}
                indent
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 pt-3 pb-1">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-white/35">
        {label}
      </span>
    </div>
  )
}

export default function SearchResults({
  results,
  isLoading,
  query,
  onPlayTrack,
  showToast,
}: SearchResultsProps) {
  if (isLoading && !results) {
    return (
      <div
        className="absolute top-full mt-2 w-full z-50 overflow-hidden"
        style={{
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          maxHeight: "420px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <SkeletonRows />
      </div>
    )
  }

  if (!results) return null

  const hasTracks = results.tracks.length > 0
  const hasArtists = results.artists.length > 0
  const hasAlbums = results.albums.length > 0
  const hasAny = hasTracks || hasArtists || hasAlbums

  return (
    <div
      className="absolute top-full mt-2 w-full z-50 overflow-y-auto"
      style={{
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        maxHeight: "420px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {!hasAny ? (
        <div className="py-8 text-center text-white/40 text-sm">
          No results for &ldquo;{query}&rdquo;
        </div>
      ) : (
        <div className="py-1">
          {hasTracks && (
            <div>
              <SectionHeader label="Tracks" />
              <div className="px-1">
                {results.tracks.map((track) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    onPlay={onPlayTrack}
                    showToast={showToast}
                  />
                ))}
              </div>
            </div>
          )}

          {hasArtists && (
            <div>
              <SectionHeader label="Artists" />
              <div className="px-1">
                {results.artists.map((artist) => (
                  <ArtistRow
                    key={artist.id}
                    artist={artist}
                    onPlay={onPlayTrack}
                    showToast={showToast}
                  />
                ))}
              </div>
            </div>
          )}

          {hasAlbums && (
            <div>
              <SectionHeader label="Albums" />
              <div className="px-1">
                {results.albums.map((album) => (
                  <AlbumRow
                    key={album.id}
                    album={album}
                    onPlay={onPlayTrack}
                    showToast={showToast}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
