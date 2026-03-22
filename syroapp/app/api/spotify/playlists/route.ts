import { auth } from "@/lib/auth"
import { getUserPlaylists } from "@/lib/spotify"

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getUserPlaylists(session.accessToken)
  return Response.json({ playlists: data?.items ?? [] })
}
