import { auth } from "@/lib/auth"
import { setRepeat } from "@/lib/spotify"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json().catch(() => ({}))
  const result = await setRepeat(session.accessToken, body.mode)
  return Response.json(result)
}
