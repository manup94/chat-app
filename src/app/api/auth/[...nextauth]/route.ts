import { User } from "@/models/interfaces/user"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
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
              headers: { "Content-Type": "application/json" },
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

          if (!data.token || !data.user) {
            console.error("Respuesta inválida del backend:", data)
            return null
          }

          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            token: data.token,
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
        const u = user as User

        token.accessToken = u.token
        token.id = u.id
        token.email = u.email
        token.name = u.name
      }
      return token
    },
    async session({ session, token }) {
      const user = {
        id: token.id,
        email: token.email,
        name: token.name,
      }
      session.user = user
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
