"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { SpotifyPlaybackState } from "@/types/spotify"

export function usePlaybackState() {
  const [state, setState] = useState<SpotifyPlaybackState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/spotify/state")
      if (!res.ok) {
        if (res.status === 401) {
          setError("RefreshTokenError")
          return
        }
        throw new Error("Failed to fetch")
      }
      const data = await res.json()
      setState(data)
      setError(null)
    } catch {
      setError("FetchError")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
    intervalRef.current = setInterval(refetch, 2000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [refetch])

  useEffect(() => {
    if (error === "RefreshTokenError" && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [error])

  return { state, isLoading, error, refetch }
}
