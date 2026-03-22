import { auth } from "@/lib/auth"
import { previous } from "@/lib/spotify"

export async function POST() {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const result = await previous(session.accessToken)
  return Response.json(result)
}
