import { signOut, useSession } from "next-auth/react";
import { useCallback } from "react";

export const useApi = () => {
  const { data: session } = useSession();

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      ...options.headers,
    };

    if (session?.accessToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${session.accessToken}`;
    }

    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Clonamos la respuesta para poder leer el cuerpo y que el llamador original también pueda leerlo si es necesario
      const responseClone = response.clone();
      try {
        const data = await responseClone.json();
        if (
          data.error === "Invalid or expired token" ||
          data.error === "Authentication required"
        ) {
          console.warn("Sesión expirada o inválida. Cerrando sesión...");
          await signOut({ callbackUrl: "/login" });
        }
      } catch {
        // Si no es JSON o falla al leer, ignoramos
      }
    }

    return response;
  }, [session?.accessToken]);

  return { fetchWithAuth };
};
