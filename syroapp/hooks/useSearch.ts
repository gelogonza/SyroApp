"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { SpotifySearchResults } from "@/types/spotify"

const DEBOUNCE_DELAY = 300
const MIN_QUERY_LENGTH = 2

export function useSearch(query: string) {
  const [results, setResults] = useState<SpotifySearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const clear = useCallback(() => {
    setResults(null)
    setIsLoading(false)
    setError(null)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query || query.length < MIN_QUERY_LENGTH) {
      if (abortRef.current) abortRef.current.abort()
      clear()
      return
    }

    setIsLoading(true)

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(
          `/api/spotify/search?q=${encodeURIComponent(query)}&type=track,artist,album`,
          { signal: controller.signal }
        )
        if (!res.ok) {
          throw new Error(res.status === 401 ? "Unauthorized" : "Search failed")
        }
        const data: SpotifySearchResults = await res.json()
        if (!controller.signal.aborted) {
          setResults(data)
          setError(null)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        if (!controller.signal.aborted) {
          setError("Search failed")
          setResults(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, DEBOUNCE_DELAY)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, clear])

  return { results, isLoading, error, clear }
}
