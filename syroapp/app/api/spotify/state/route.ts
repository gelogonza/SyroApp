import { auth } from "@/lib/auth"
import { getPlaybackState } from "@/lib/spotify"

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const result = await getPlaybackState(session.accessToken)
  return Response.json(result)
}
