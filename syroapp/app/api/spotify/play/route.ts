import { auth } from "@/lib/auth"
import { play } from "@/lib/spotify"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json()
  const result = await play(session.accessToken, body.uri, body.deviceId)
  return Response.json(result)
}
