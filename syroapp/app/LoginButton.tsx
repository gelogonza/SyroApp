import { signIn } from "@/lib/auth"

export default function LoginButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("spotify")
      }}
    >
      <button
        type="submit"
        className="px-8 py-3.5 bg-white text-black font-semibold rounded-full hover:scale-105 hover:bg-white/95 transition-all shadow-lg shadow-black/20 text-base"
      >
        Connect with Spotify
      </button>
    </form>
  )
}
