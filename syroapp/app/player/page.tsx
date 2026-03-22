import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Player from "@/components/Player"

export default async function PlayerPage() {
  const session = await auth()

  if (!session?.accessToken) {
    redirect("/")
  }

  return <Player />
}
