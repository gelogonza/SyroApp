"use client"

import { useState, useCallback, useEffect } from "react"
import type { SpotifyPlaylist } from "@/types/spotify"

interface PlaylistsState {
  playlists: SpotifyPlaylist[]
  isLoading: boolean
  error: string | null
}

export function usePlaylists() {
  const [state, setState] = useState<PlaylistsState>({
    playlists: [],
    isLoading: true,
    error: null,
  })

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const res = await fetch("/api/spotify/playlists")
      if (!res.ok) throw new Error("Failed to fetch playlists")
      const data = await res.json()
      setState({
        playlists: data.playlists ?? [],
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

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    playlists: state.playlists,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
  }
}
