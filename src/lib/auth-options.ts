import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const internalApiSecret = process.env.API_INTERNAL_SECRET
          const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
          const headers: HeadersInit = {
            "Content-Type": "application/json",
          }

          if (internalApiSecret) {
            headers["x-internal-api-secret"] = internalApiSecret
          } else {
            headers.origin = appUrl
            headers.referer = `${appUrl}/login`
          }

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
            }
          )

          if (!res.ok) {
            return null
          }

          const data = await res.json()

          if (!data.user || !data.token) {
            console.error("Respuesta inválida del backend:", data)
            return null
          }

          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            accessToken: data.token,
          }
        } catch (error) {
          console.error("Error en authorize:", error)
          throw new Error(
            "Error al intentar iniciar sesión. Inténtalo más tarde."
          )
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.accessToken = token.accessToken
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
