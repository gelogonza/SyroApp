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
        className="px-8 py-3.5 bg-black text-white font-semibold rounded-full hover:scale-105 hover:bg-black/80 transition-all shadow-lg shadow-white/20 text-base"
      >
        Connect with Spotify
      </button>
    </form>
  )
}
