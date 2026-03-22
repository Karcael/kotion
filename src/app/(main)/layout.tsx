import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { MainLayout as MainLayoutClient } from "@/components/main-layout"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  return <MainLayoutClient user={user}>{children}</MainLayoutClient>
}
