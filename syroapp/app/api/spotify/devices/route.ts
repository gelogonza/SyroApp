import { auth } from "@/lib/auth"
import { getDevices } from "@/lib/spotify"

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const result = await getDevices(session.accessToken)
  return Response.json(result)
}
