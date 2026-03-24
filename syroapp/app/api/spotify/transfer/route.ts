import { auth } from "@/lib/auth"
import { transferPlayback } from "@/lib/spotify"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json().catch(() => ({}))
  const result = await transferPlayback(session.accessToken, body.deviceId)
  return Response.json(result)
}
