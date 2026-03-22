import { auth } from "@/lib/auth"
import { getCurrentUserId, createPlaylist } from "@/lib/spotify"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  if (!body.name) {
    return Response.json({ error: "Missing playlist name" }, { status: 400 })
  }

  const userId = await getCurrentUserId(session.accessToken)
  if (!userId) {
    return Response.json({ error: "Failed to get user" }, { status: 500 })
  }

  const playlist = await createPlaylist(
    session.accessToken,
    userId,
    body.name,
    body.description ?? "",
    body.public ?? false
  )

  return Response.json(playlist)
}
