import { HomeWrapper } from "@/components/wrappers/home-wrapper"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export default async function Page() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return <HomeWrapper initialSession={session} />
}
