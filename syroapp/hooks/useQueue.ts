"use client"

import { useState, useCallback } from "react"
import type { SpotifyTrack } from "@/types/spotify"

interface QueueState {
  currentlyPlaying: SpotifyTrack | null
  queue: SpotifyTrack[]
  isLoading: boolean
  error: string | null
}

export function useQueue() {
  const [state, setState] = useState<QueueState>({
    currentlyPlaying: null,
    queue: [],
    isLoading: false,
    error: null,
  })

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const res = await fetch("/api/spotify/queue")
      if (!res.ok) throw new Error("Failed to fetch queue")
      const data = await res.json()
      setState({
        currentlyPlaying: data.currently_playing ?? null,
        queue: data.queue ?? [],
        isLoading: false,
        error: null,
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }))
    }
  }, [])

  return {
    currentlyPlaying: state.currentlyPlaying,
    queue: state.queue,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
  }
}
