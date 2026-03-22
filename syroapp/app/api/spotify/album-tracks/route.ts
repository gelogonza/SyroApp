import { auth } from "@/lib/auth"
import { getAlbumTracks } from "@/lib/spotify"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return Response.json({ error: "Missing album id" }, { status: 400 })
  }

  const result = await getAlbumTracks(session.accessToken, id)
  return Response.json(result)
}
