import { auth } from "@/lib/auth"
import { seek } from "@/lib/spotify"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json()
  const result = await seek(session.accessToken, body.positionMs)
  return Response.json(result)
}
