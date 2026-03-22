"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { SpotifyTrack } from "@/types/spotify"

interface SearchBarProps {
  onPlay: (uri: string) => void
}

export default function SearchBar({ onPlay }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SpotifyTrack[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const searchTracks = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data?.tracks?.items ?? [])
      }
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(() => searchTracks(query), 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, searchTracks])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(track: SpotifyTrack) {
    onPlay(track.uri)
    setQuery("")
    setResults([])
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-[60%] mx-auto">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for a song..."
          className="w-full pl-11 pr-4 py-2.5 rounded-full bg-black/25 border border-white/15 text-white text-sm placeholder:text-white/40 outline-none focus:border-white/30 focus:bg-black/35 transition-all"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl z-50 max-h-80 overflow-y-auto">
          {results.map((track) => (
            <button
              key={track.id}
              onClick={() => handleSelect(track)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left"
            >
              {track.album.images[track.album.images.length - 1] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={track.album.images[track.album.images.length - 1].url}
                  alt=""
                  className="w-10 h-10 rounded object-cover shrink-0"
                />
              )}
              <div className="min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {track.name}
                </div>
                <div className="text-white/50 text-xs truncate">
                  {track.artists.map((a) => a.name).join(", ")}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
