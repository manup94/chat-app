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
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-internal-api-secret": process.env.API_INTERNAL_SECRET ?? "",
              },
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
          } as any
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
        const u = user as any
        token.id = u.id
        token.email = u.email
        token.name = u.name
        token.accessToken = u.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).accessToken = token.accessToken
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
