import { auth } from "@/lib/auth"
import { next } from "@/lib/spotify"

export async function POST() {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const result = await next(session.accessToken)
  return Response.json(result)
}
