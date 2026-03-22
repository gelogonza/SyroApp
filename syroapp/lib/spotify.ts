const BASE_URL = "https://api.spotify.com/v1"

function headers(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` }
}

async function spotifyFetch(
  accessToken: string,
  endpoint: string,
  options?: RequestInit
) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...headers(accessToken), ...options?.headers },
    })
    if (res.status === 204) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function getPlaybackState(accessToken: string) {
  return spotifyFetch(accessToken, "/me/player")
}

export async function getDevices(accessToken: string) {
  return spotifyFetch(accessToken, "/me/player/devices")
}

export async function play(
  accessToken: string,
  uri?: string,
  deviceId?: string
) {
  const params = deviceId ? `?device_id=${deviceId}` : ""
  const body = uri ? JSON.stringify({ uris: [uri] }) : undefined
  return spotifyFetch(accessToken, `/me/player/play${params}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  })
}

export async function pause(accessToken: string, deviceId?: string) {
  const params = deviceId ? `?device_id=${deviceId}` : ""
  return spotifyFetch(accessToken, `/me/player/pause${params}`, {
    method: "PUT",
  })
}

export async function resume(accessToken: string, deviceId?: string) {
  const params = deviceId ? `?device_id=${deviceId}` : ""
  return spotifyFetch(accessToken, `/me/player/play${params}`, {
    method: "PUT",
  })
}

export async function next(accessToken: string, deviceId?: string) {
  const params = deviceId ? `?device_id=${deviceId}` : ""
  return spotifyFetch(accessToken, `/me/player/next${params}`, {
    method: "POST",
  })
}

export async function previous(accessToken: string, deviceId?: string) {
  const params = deviceId ? `?device_id=${deviceId}` : ""
  return spotifyFetch(accessToken, `/me/player/previous${params}`, {
    method: "POST",
  })
}

export async function seek(
  accessToken: string,
  positionMs: number,
  deviceId?: string
) {
  const params = new URLSearchParams({ position_ms: String(positionMs) })
  if (deviceId) params.set("device_id", deviceId)
  return spotifyFetch(accessToken, `/me/player/seek?${params}`, {
    method: "PUT",
  })
}

export async function setVolume(
  accessToken: string,
  volumePercent: number,
  deviceId?: string
) {
  const params = new URLSearchParams({
    volume_percent: String(Math.round(volumePercent)),
  })
  if (deviceId) params.set("device_id", deviceId)
  return spotifyFetch(accessToken, `/me/player/volume?${params}`, {
    method: "PUT",
  })
}

export async function setShuffle(
  accessToken: string,
  state: boolean,
  deviceId?: string
) {
  const params = new URLSearchParams({ state: String(state) })
  if (deviceId) params.set("device_id", deviceId)
  return spotifyFetch(accessToken, `/me/player/shuffle?${params}`, {
    method: "PUT",
  })
}

export async function setRepeat(
  accessToken: string,
  mode: "off" | "context" | "track",
  deviceId?: string
) {
  const params = new URLSearchParams({ state: mode })
  if (deviceId) params.set("device_id", deviceId)
  return spotifyFetch(accessToken, `/me/player/repeat?${params}`, {
    method: "PUT",
  })
}

export async function transferPlayback(
  accessToken: string,
  deviceId: string
) {
  return spotifyFetch(accessToken, "/me/player", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device_ids: [deviceId] }),
  })
}

export async function search(accessToken: string, query: string) {
  const params = new URLSearchParams({
    q: query,
    type: "track,artist,album",
    limit: "5",
  })
  return spotifyFetch(accessToken, `/search?${params}`)
}

export async function searchSpotify(accessToken: string, query: string) {
  const params = new URLSearchParams({
    q: query,
    type: "track,artist,album",
    limit: "5",
  })
  return spotifyFetch(accessToken, `/search?${params}`)
}

export async function getArtistTopTracks(
  accessToken: string,
  artistId: string
) {
  const data = await spotifyFetch(
    accessToken,
    `/artists/${artistId}/top-tracks?market=US`
  )
  return { tracks: data?.tracks?.slice(0, 5) ?? [] }
}

export async function getQueue(accessToken: string) {
  const data = await spotifyFetch(accessToken, "/me/player/queue")
  if (!data) return { currently_playing: null, queue: [] }
  return {
    currently_playing: data.currently_playing ?? null,
    queue: (data.queue ?? []).slice(0, 20),
  }
}

export async function addToQueue(accessToken: string, uri: string) {
  try {
    const res = await fetch(`${BASE_URL}/me/player/queue?uri=${encodeURIComponent(uri)}`, {
      method: "POST",
      headers: headers(accessToken),
    })
    return res.ok || res.status === 204
  } catch {
    return false
  }
}

export async function getAlbumTracks(accessToken: string, albumId: string) {
  const [tracksData, albumData] = await Promise.all([
    spotifyFetch(accessToken, `/albums/${albumId}/tracks?limit=50`),
    spotifyFetch(accessToken, `/albums/${albumId}`),
  ])

  const albumImage = albumData?.images?.[0]?.url ?? null
  const albumName = albumData?.name ?? ""
  const tracks = (tracksData?.items ?? []).map(
    (t: { id: string; name: string; uri: string; duration_ms: number; artists: Array<{ id: string; name: string }> }) => ({
      ...t,
      album: {
        id: albumId,
        name: albumName,
        images: albumData?.images ?? [],
      },
    })
  )

  return { tracks, albumImage }
}
