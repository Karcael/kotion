import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json([])
    }

    const documents = await prisma.document.findMany({
      where: {
        userId: user.id,
        isArchived: false,
        title: {
          contains: query,
          mode: "insensitive",
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        icon: true,
        parentId: true,
      },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Arama sırasında bir hata oluştu" },
      { status: 500 }
    )
  }
}
