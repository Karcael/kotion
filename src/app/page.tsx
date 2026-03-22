import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export default async function HomePage() {
  const user = await getSession()

  if (user) {
    redirect("/documents")
  } else {
    redirect("/login")
  }
}
