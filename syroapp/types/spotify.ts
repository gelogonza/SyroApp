export interface SpotifyPlaybackState {
  is_playing: boolean
  progress_ms: number
  item: SpotifyTrack | null
  device: SpotifyDevice
  shuffle_state: boolean
  repeat_state: 'off' | 'context' | 'track'
}

export interface SpotifyTrack {
  id: string
  name: string
  uri: string
  duration_ms: number
  artists: Array<{ id: string; name: string }>
  album: {
    id: string
    name: string
    images: Array<{ url: string; width: number; height: number }>
  }
}

export interface SpotifyDevice {
  id: string
  name: string
  type: string
  is_active: boolean
  volume_percent: number
}

export interface SpotifyArtist {
  id: string
  name: string
  images: Array<{ url: string; width: number; height: number }>
  genres: string[]
}

export interface SpotifyAlbum {
  id: string
  name: string
  artists: Array<{ id: string; name: string }>
  images: Array<{ url: string; width: number; height: number }>
  release_date: string
  total_tracks: number
}

export interface SpotifySearchResults {
  tracks: SpotifyTrack[]
  artists: SpotifyArtist[]
  albums: SpotifyAlbum[]
}
