/**
 * @jest-environment node
 */

import { POST } from "@/app/api/spotify/playlists/[id]/add-track/route"

jest.mock("@/lib/auth", () => {
  const mockAuth = jest.fn()
  return {
    auth: mockAuth,
    __esModule: true,
    default: jest.fn(() => ({
      handlers: {},
      auth: mockAuth,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })),
  }
})

jest.mock("@/lib/spotify", () => ({
  addTrackToPlaylist: jest.fn(),
  spotifyFetch: jest.fn(),
}))

import { auth } from "@/lib/auth"
import { addTrackToPlaylist } from "@/lib/spotify"

const mockAuth = auth as unknown as jest.Mock
const mockAddTrack = addTrackToPlaylist as jest.MockedFunction<typeof addTrackToPlaylist>

function makeRequest(body?: object) {
  return new Request("http://localhost/api/spotify/playlists/playlist123/add-track", {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
}

beforeEach(() => {
  mockAuth.mockReset()
  mockAddTrack.mockReset()
})

describe("POST /api/spotify/playlists/[id]/add-track", () => {
  it("returns 401 when no session", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await POST(makeRequest({ uri: "spotify:track:abc" }), {
      params: { id: "playlist123" },
    })
    expect(res.status).toBe(401)
  })

  it("returns 400 when body has no uri", async () => {
    mockAuth.mockResolvedValue({ accessToken: "token" })
    const res = await POST(makeRequest({ name: "test" }), {
      params: { id: "playlist123" },
    })
    expect(res.status).toBe(400)
  })

  it("returns 400 when body is malformed JSON (empty body)", async () => {
    mockAuth.mockResolvedValue({ accessToken: "token" })
    const req = new Request("http://localhost/api/spotify/playlists/playlist123/add-track", {
      method: "POST",
    })
    const res = await POST(req, { params: { id: "playlist123" } })
    expect(res.status).toBe(400)
  })

  it("returns 200 with { success: true } when addTrackToPlaylist succeeds", async () => {
    mockAuth.mockResolvedValue({ accessToken: "token" })
    mockAddTrack.mockResolvedValue({ success: true })
    const res = await POST(makeRequest({ uri: "spotify:track:abc" }), {
      params: { id: "playlist123" },
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it("returns 403 with error message when addTrackToPlaylist returns forbidden", async () => {
    mockAuth.mockResolvedValue({ accessToken: "token" })
    mockAddTrack.mockResolvedValue({ error: "forbidden" })
    const res = await POST(makeRequest({ uri: "spotify:track:abc" }), {
      params: { id: "playlist123" },
    })
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain("playlists you own")
  })

  it("returns 500 when addTrackToPlaylist returns failed", async () => {
    mockAuth.mockResolvedValue({ accessToken: "token" })
    mockAddTrack.mockResolvedValue({ error: "failed" })
    const res = await POST(makeRequest({ uri: "spotify:track:abc" }), {
      params: { id: "playlist123" },
    })
    expect(res.status).toBe(500)
  })

  it("calls addTrackToPlaylist with correct playlistId, uri, and accessToken", async () => {
    mockAuth.mockResolvedValue({ accessToken: "my_token" })
    mockAddTrack.mockResolvedValue({ success: true })
    await POST(makeRequest({ uri: "spotify:track:xyz" }), {
      params: { id: "pl_id_42" },
    })
    expect(mockAddTrack).toHaveBeenCalledWith("my_token", "pl_id_42", "spotify:track:xyz")
  })
})
