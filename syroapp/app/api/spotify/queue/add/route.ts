import { auth } from "@/lib/auth"
import { addToQueue } from "@/lib/spotify"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json().catch(() => ({}))
  if (!body.uri) {
    return Response.json({ error: "Missing uri" }, { status: 400 })
  }
  const success = await addToQueue(session.accessToken, body.uri)
  if (!success) {
    return Response.json({ error: "Failed to add to queue" }, { status: 500 })
  }
  return Response.json({ success: true })
}
