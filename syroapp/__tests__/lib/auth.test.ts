import { refreshAccessToken, SPOTIFY_SCOPES } from "@/lib/auth"

const mockFetch = jest.fn()
global.fetch = mockFetch

jest.mock("next-auth", () => {
  return jest.fn(() => ({
    handlers: {},
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  }))
})

beforeEach(() => {
  mockFetch.mockReset()
  process.env.SPOTIFY_CLIENT_ID = "test_client_id"
  process.env.SPOTIFY_CLIENT_SECRET = "test_client_secret"
})

describe("refreshAccessToken", () => {
  it("returns RefreshTokenError when refreshToken is undefined", async () => {
    const result = await refreshAccessToken({
      accessToken: "old_token",
      refreshToken: undefined,
    })
    expect(result.error).toBe("RefreshTokenError")
  })

  it("returns RefreshTokenError when refreshToken is falsy (empty string)", async () => {
    const result = await refreshAccessToken({
      accessToken: "old_token",
      refreshToken: "",
    })
    expect(result.error).toBe("RefreshTokenError")
  })

  it("returns RefreshTokenError when fetch throws", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))
    const result = await refreshAccessToken({
      refreshToken: "valid_token",
      accessToken: "old_token",
    })
    expect(result.error).toBe("RefreshTokenError")
  })

  it("returns RefreshTokenError when Spotify responds with !response.ok", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "invalid_grant" }),
    })
    const result = await refreshAccessToken({
      refreshToken: "valid_token",
      accessToken: "old_token",
    })
    expect(result.error).toBe("RefreshTokenError")
  })

  it("returns updated token with new accessToken on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "new_access_token",
          expires_in: 3600,
          refresh_token: "new_refresh_token",
        }),
    })
    const result = await refreshAccessToken({
      refreshToken: "valid_token",
      accessToken: "old_token",
    })
    expect(result.accessToken).toBe("new_access_token")
    expect(result.error).toBeUndefined()
  })

  it("uses the new refreshToken from response when Spotify returns one", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "new_at",
          expires_in: 3600,
          refresh_token: "new_rt",
        }),
    })
    const result = await refreshAccessToken({
      refreshToken: "old_rt",
      accessToken: "old_at",
    })
    expect(result.refreshToken).toBe("new_rt")
  })

  it("falls back to existing refreshToken when Spotify doesn't return a new one", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "new_at",
          expires_in: 3600,
        }),
    })
    const result = await refreshAccessToken({
      refreshToken: "old_rt",
      accessToken: "old_at",
    })
    expect(result.refreshToken).toBe("old_rt")
  })

  it("sends correct Authorization header (Base64 of clientId:clientSecret)", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "new",
          expires_in: 3600,
        }),
    })
    await refreshAccessToken({
      refreshToken: "rt",
      accessToken: "at",
    })
    const expectedAuth = `Basic ${Buffer.from("test_client_id:test_client_secret").toString("base64")}`
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expectedAuth,
        }),
      })
    )
  })

  it("sends correct grant_type and refresh_token in body", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "new",
          expires_in: 3600,
        }),
    })
    await refreshAccessToken({
      refreshToken: "my_refresh_token",
      accessToken: "at",
    })
    const body = mockFetch.mock.calls[0][1].body as URLSearchParams
    expect(body.get("grant_type")).toBe("refresh_token")
    expect(body.get("refresh_token")).toBe("my_refresh_token")
  })
})

describe("SPOTIFY_SCOPES", () => {
  it("contains playlist-modify-public", () => {
    expect(SPOTIFY_SCOPES).toContain("playlist-modify-public")
  })

  it("contains playlist-modify-private", () => {
    expect(SPOTIFY_SCOPES).toContain("playlist-modify-private")
  })

  it("contains user-read-playback-state", () => {
    expect(SPOTIFY_SCOPES).toContain("user-read-playback-state")
  })

  it("contains user-modify-playback-state", () => {
    expect(SPOTIFY_SCOPES).toContain("user-modify-playback-state")
  })

  it("contains streaming", () => {
    expect(SPOTIFY_SCOPES).toContain("streaming")
  })
})
