import type { Metadata } from "next"
import "./globals.css"
import Providers from "./providers"

export const metadata: Metadata = {
  title: "Chat Application",
  description: "Chat Application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body
        className={`flex items-center justify-center min-h-screen antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
