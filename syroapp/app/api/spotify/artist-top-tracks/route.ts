import { auth } from "@/lib/auth"
import { getArtistTopTracks } from "@/lib/spotify"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return Response.json({ error: "Missing artist id" }, { status: 400 })
  }

  const result = await getArtistTopTracks(session.accessToken, id)
  return Response.json(result)
}
