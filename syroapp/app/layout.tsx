import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import PageTransitionProvider from "@/components/PageTransitionProvider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Syro",
  description: "Your Spotify player",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ background: "#111111" }}>
      <body className={inter.className}>
        <SessionProvider>
          <PageTransitionProvider>{children}</PageTransitionProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
