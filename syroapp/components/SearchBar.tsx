"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSearch } from "@/hooks/useSearch"
import SearchResults from "./SearchResults"
import type { ToastVariant } from "@/hooks/useToast"

interface SearchBarProps {
  onPlay: (uri: string) => Promise<void>
  showToast: (message: string, variant?: ToastVariant) => void
}

export default function SearchBar({ onPlay, showToast }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { results, isLoading, clear } = useSearch(query)

  const showResults =
    isOpen && query.length >= 2 && (results !== null || isLoading)

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("")
        clear()
        setIsOpen(false)
        ;(e.target as HTMLInputElement).blur()
      }
    },
    [clear]
  )

  const handleBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }, [])

  const handleFocus = useCallback(() => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    setIsOpen(true)
  }, [])

  const handlePlayTrack = useCallback(
    async (uri: string) => {
      await onPlay(uri)
      setQuery("")
      clear()
      setIsOpen(false)
    },
    [onPlay, clear]
  )

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
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search for a song..."
          className="w-full pl-11 pr-4 py-2.5 rounded-full bg-black/25 border border-white/15 text-white text-sm placeholder:text-white/40 outline-none focus:border-white/30 focus:bg-black/35 transition-all"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showResults && (
        <SearchResults
          results={results ?? { tracks: [], artists: [], albums: [] }}
          isLoading={isLoading}
          query={query}
          onPlayTrack={handlePlayTrack}
          showToast={showToast}
        />
      )}
    </div>
  )
}
