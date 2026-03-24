import { auth } from "@/lib/auth"
import { addTrackToPlaylist } from "@/lib/spotify"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  if (!body.uri) {
    return Response.json({ error: "Missing track uri" }, { status: 400 })
  }

  const result = await addTrackToPlaylist(
    session.accessToken,
    params.id,
    body.uri
  )

  if (result.error === "forbidden") {
    return Response.json(
      { error: "You can only add tracks to playlists you own" },
      { status: 403 }
    )
  }
  if (result.error) {
    return Response.json({ error: "Failed to add track" }, { status: 500 })
  }

  return Response.json({ success: true })
}
