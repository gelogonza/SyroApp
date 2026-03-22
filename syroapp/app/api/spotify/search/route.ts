import { auth } from "@/lib/auth"
import { search } from "@/lib/spotify"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  if (!query) {
    return Response.json({ error: "Missing query" }, { status: 400 })
  }
  const result = await search(session.accessToken, query)
  return Response.json(result)
}
