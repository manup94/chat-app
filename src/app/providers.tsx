"use client"

import { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <SessionProvider session={session}>
      <Toaster
        position="top-right"
        richColors
        expand={false}
        toastOptions={{
          style: {
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
      {children}
    </SessionProvider>
  )
}
