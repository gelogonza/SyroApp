import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import LoginButton from "./LoginButton"

export default async function Home() {
  const session = await auth()

  if (session?.accessToken) {
    redirect("/player")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a4a3a]">
      <div className="text-center space-y-8">
        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight">
          Syro
        </h1>
        <p className="text-white/50 text-lg">Your music, beautifully simple</p>
        <LoginButton />
      </div>
    </div>
  )
}
