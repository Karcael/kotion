import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import { getSession } from "@/lib/auth"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production"
)

// GET /api/auth/collab-token — WebSocket auth için kısa ömürlü token
export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 })
    }

    const token = await new SignJWT({
      userId: user.id,
      name: user.name,
      email: user.email,
      type: "collab",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(JWT_SECRET)

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Collab token error:", error)
    return NextResponse.json(
      { error: "Token oluşturulurken bir hata oluştu." },
      { status: 500 }
    )
  }
}
