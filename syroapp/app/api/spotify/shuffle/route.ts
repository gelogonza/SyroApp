import { auth } from "@/lib/auth"
import { setShuffle } from "@/lib/spotify"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json()
  const result = await setShuffle(session.accessToken, body.state)
  return Response.json(result)
}
