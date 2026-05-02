import type { Metadata, Viewport } from "next"
import "./globals.css"
import Providers from "./providers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export const metadata: Metadata = {
  title: "Chat Application",
  description: "Chat Application",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es">
      <body
        className="antialiased h-full w-full"
      >
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  )
}
