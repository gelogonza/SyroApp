import { auth } from "@/lib/auth"
import { getPlaylistTracks } from "@/lib/spotify"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getPlaylistTracks(session.accessToken, params.id)
  const tracks = (data?.items ?? [])
    .filter((item: { track: unknown }) => item.track !== null)
    .map((item: { track: unknown }) => item.track)

  return Response.json({ tracks })
}
