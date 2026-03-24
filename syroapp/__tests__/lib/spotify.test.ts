import {
  spotifyFetch,
  seek,
  setVolume,
  addTrackToPlaylist,
  addToQueue,
  searchSpotify,
  getQueue,
} from "@/lib/spotify"
import * as spotify from "@/lib/spotify"

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe("spotifyFetch", () => {
  it("returns null when response status is 204", async () => {
    mockFetch.mockResolvedValue({ status: 204, json: jest.fn() })
    const result = await spotifyFetch("token123", "/me/player")
    expect(result).toBeNull()
  })

  it("returns parsed JSON on success", async () => {
    const data = { is_playing: true }
    mockFetch.mockResolvedValue({ status: 200, json: () => Promise.resolve(data) })
    const result = await spotifyFetch("token123", "/me/player")
    expect(result).toEqual({ is_playing: true })
  })

  it("returns null on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))
    const result = await spotifyFetch("token123", "/me/player")
    expect(result).toBeNull()
  })

  it("merges Authorization header correctly", async () => {
    mockFetch.mockResolvedValue({ status: 200, json: () => Promise.resolve({}) })
    await spotifyFetch("mytoken", "/endpoint", {
      headers: { "Content-Type": "application/json" },
    })
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.spotify.com/v1/endpoint",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer mytoken",
          "Content-Type": "application/json",
        },
      })
    )
  })
})

describe("seek", () => {
  it("sends position_ms as query param", async () => {
    mockFetch.mockResolvedValue({ status: 204, json: jest.fn() })
    await seek("token", 30000)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("position_ms=30000"),
      expect.any(Object)
    )
  })

  it("works correctly when positionMs is 0", async () => {
    mockFetch.mockResolvedValue({ status: 204, json: jest.fn() })
    await seek("token", 0)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("position_ms=0"),
      expect.any(Object)
    )
  })

  it("works correctly when positionMs is a large number", async () => {
    mockFetch.mockResolvedValue({ status: 204, json: jest.fn() })
    await seek("token", 999999999)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("position_ms=999999999"),
      expect.any(Object)
    )
  })
})

describe("setVolume", () => {
  it("sends volume_percent as query param", async () => {
    mockFetch.mockResolvedValue({ status: 204, json: jest.fn() })
    await setVolume("token", 50)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("volume_percent=50"),
      expect.any(Object)
    )
  })

  it("works correctly when volumePercent is 0", async () => {
    mockFetch.mockResolvedValue({ status: 204, json: jest.fn() })
    await setVolume("token", 0)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("volume_percent=0"),
      expect.any(Object)
    )
  })

  it("rounds non-integer volume values", async () => {
    mockFetch.mockResolvedValue({ status: 204, json: jest.fn() })
    await setVolume("token", 33.7)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("volume_percent=34"),
      expect.any(Object)
    )
  })
})

describe("addTrackToPlaylist", () => {
  it("returns { error: 'forbidden' } when Spotify returns 403", async () => {
    mockFetch.mockResolvedValue({ status: 403, ok: false })
    const result = await addTrackToPlaylist("token", "playlist1", "spotify:track:abc")
    expect(result).toEqual({ error: "forbidden" })
  })

  it("returns { error: 'failed' } when Spotify returns 500", async () => {
    mockFetch.mockResolvedValue({ status: 500, ok: false })
    const result = await addTrackToPlaylist("token", "playlist1", "spotify:track:abc")
    expect(result).toEqual({ error: "failed" })
  })

  it("returns { success: true } when Spotify returns 201", async () => {
    mockFetch.mockResolvedValue({ status: 201, ok: true })
    const result = await addTrackToPlaylist("token", "playlist1", "spotify:track:abc")
    expect(result).toEqual({ success: true })
  })

  it("returns { error: 'failed' } on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))
    const result = await addTrackToPlaylist("token", "playlist1", "spotify:track:abc")
    expect(result).toEqual({ error: "failed" })
  })
})

describe("addToQueue", () => {
  it("returns true when Spotify returns 204", async () => {
    mockFetch.mockResolvedValue({ status: 204, ok: true })
    const result = await addToQueue("token", "spotify:track:abc")
    expect(result).toBe(true)
  })

  it("returns true when Spotify returns 200", async () => {
    mockFetch.mockResolvedValue({ status: 200, ok: true })
    const result = await addToQueue("token", "spotify:track:abc")
    expect(result).toBe(true)
  })

  it("returns false on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))
    const result = await addToQueue("token", "spotify:track:abc")
    expect(result).toBe(false)
  })
})

describe("searchSpotify", () => {
  it("sends correct query params", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ tracks: [], artists: [], albums: [] }),
    })
    await searchSpotify("token", "test query")
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain("q=test+query")
    expect(url).toContain("type=track%2Cartist%2Calbum")
    expect(url).toContain("limit=5")
  })

  it("returns parsed results", async () => {
    const data = { tracks: { items: [] }, artists: { items: [] }, albums: { items: [] } }
    mockFetch.mockResolvedValue({ status: 200, json: () => Promise.resolve(data) })
    const result = await searchSpotify("token", "test")
    expect(result).toEqual(data)
  })
})

describe("getQueue", () => {
  it("returns default when Spotify returns null", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))
    const result = await getQueue("token")
    expect(result).toEqual({ currently_playing: null, queue: [] })
  })

  it("trims queue to 20 items when more are returned", async () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ id: `track${i}` }))
    mockFetch.mockResolvedValue({
      status: 200,
      json: () =>
        Promise.resolve({
          currently_playing: { id: "current" },
          queue: items,
        }),
    })
    const result = await getQueue("token")
    expect(result.queue).toHaveLength(20)
    expect(result.currently_playing).toEqual({ id: "current" })
  })
})

describe("search() function removal", () => {
  it("search function does not exist", () => {
    expect((spotify as Record<string, unknown>).search).toBeUndefined()
  })
})
