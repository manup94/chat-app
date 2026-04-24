import { signOut } from "next-auth/react"
import { HomeWrapper } from "@/components/wrappers/home-wrapper"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export default async function Page() {
  const session = await getServerSession(authOptions)

  if (!session) {
    signOut()
    return null
  }

  return <HomeWrapper initialSession={session} />
}
