import NextAuth from "next-auth"

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com"
export const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ")

export async function refreshAccessToken(token: {
  refreshToken?: string
  accessToken?: string
  expiresAt?: number
  error?: "RefreshTokenError"
}) {
  try {
    if (!token.refreshToken) {
      return { ...token, error: "RefreshTokenError" as const }
    }
    const response = await fetch(`${SPOTIFY_AUTH_URL}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error("Refresh failed")
    }

    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
      refreshToken: data.refresh_token ?? token.refreshToken,
    }
  } catch {
    return { ...token, error: "RefreshTokenError" as const }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "spotify",
      name: "Spotify",
      type: "oauth",
      authorization: {
        url: `${SPOTIFY_AUTH_URL}/authorize`,
        params: { scope: SPOTIFY_SCOPES },
      },
      token: `${SPOTIFY_AUTH_URL}/api/token`,
      userinfo: "https://api.spotify.com/v1/me",
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.display_name,
          email: profile.email,
          image: profile.images?.[0]?.url,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        }
      }

      if (token.expiresAt && Date.now() / 1000 < token.expiresAt - 60) {
        return token
      }

      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.error = token.error as "RefreshTokenError" | undefined
      return session
    },
  },
  pages: {
    signIn: "/",
  },
})
