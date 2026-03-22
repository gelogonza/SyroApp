import { auth } from "@/lib/auth"
import { playContext } from "@/lib/spotify"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const result = await playContext(
    session.accessToken,
    `spotify:playlist:${params.id}`,
    body.deviceId
  )
  return Response.json({ success: true, result })
}
