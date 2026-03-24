import { auth } from "@/lib/auth"
import { setVolume } from "@/lib/spotify"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json().catch(() => ({}))
  const result = await setVolume(session.accessToken, body.volumePercent)
  return Response.json(result)
}
