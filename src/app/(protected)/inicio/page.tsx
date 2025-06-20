"use client"

import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"

export default function IndexPage() {
  const session = useSession()

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-black text-xl font-bold">{session.data?.user?.name}</p>
      <h1 className="text-4xl font-bold">Bienvenido a la aplicación de chat</h1>
      <button
        onClick={() => {
          signOut({ callbackUrl: "/" })
        }}
        className="rounded-md mt-4 bg-red-500 text-white font-bold p-3"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
