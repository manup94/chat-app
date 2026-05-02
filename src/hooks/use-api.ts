import { signOut, useSession } from "next-auth/react"
import { useCallback } from "react"

export const useApi = (fallbackAccessToken?: string) => {
  const { data: session, status } = useSession()
  const accessToken = session?.accessToken ?? fallbackAccessToken

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      ...options.headers,
    }

    if (accessToken) {
      ;(headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`
    }

    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers,
    })

    if (response.status === 401) {
      // Clonamos la respuesta para poder leer el cuerpo y que el llamador original tambien pueda leerlo si es necesario
      const responseClone = response.clone()
      try {
        const data = await responseClone.json()
        if (
          status === "authenticated" &&
          accessToken &&
          (data.error === "Invalid or expired token" ||
            data.error === "Authentication required")
        ) {
          console.warn("Sesion expirada o invalida. Cerrando sesion...")
          await signOut({ callbackUrl: "/login" })
        }
      } catch {
        // Si no es JSON o falla al leer, ignoramos
      }
    }

    return response
  }, [accessToken, status])

  return {
    fetchWithAuth,
    authStatus: status,
    hasAccessToken: Boolean(accessToken),
    accessToken,
  }
}
