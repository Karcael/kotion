import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

// POST /api/invitations — Davet gönder
export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 })
    }

    const { documentId, email, role = "EDITOR" } = await request.json()

    if (!documentId || !email) {
      return NextResponse.json(
        { error: "Doküman ID ve e-posta gereklidir." },
        { status: 400 }
      )
    }

    if (email === user.email) {
      return NextResponse.json(
        { error: "Kendinizi davet edemezsiniz." },
        { status: 400 }
      )
    }

    // Doküman sahibi mi?
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId: user.id },
    })

    if (!document) {
      return NextResponse.json(
        { error: "Doküman bulunamadı veya yetkiniz yok." },
        { status: 404 }
      )
    }

    // Davet edilen kullanıcı sistemde var mı?
    const invitee = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    // Zaten davet edilmiş mi?
    const existing = await prisma.invitation.findUnique({
      where: { documentId_email: { documentId, email } },
    })

    if (existing) {
      if (existing.status === "ACCEPTED") {
        return NextResponse.json(
          { error: "Bu kişi zaten işbirlikçi." },
          { status: 409 }
        )
      }
      // Bekleyen daveti güncelle
      const updated = await prisma.invitation.update({
        where: { id: existing.id },
        data: { status: "PENDING", role: role as "EDITOR" | "VIEWER" },
      })
      return NextResponse.json(updated)
    }

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role: role as "EDITOR" | "VIEWER",
        documentId,
        inviterId: user.id,
        inviteeId: invitee?.id || null,
      },
    })

    return NextResponse.json(invitation, { status: 201 })
  } catch (error) {
    console.error("Create invitation error:", error)
    return NextResponse.json(
      { error: "Davet gönderilirken bir hata oluştu." },
      { status: 500 }
    )
  }
}

// GET /api/invitations — Kullanıcının bekleyen davetlerini listele
export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 })
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        OR: [{ inviteeId: user.id }, { email: user.email }],
        status: "PENDING",
      },
      include: {
        document: { select: { id: true, title: true, icon: true } },
        inviter: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.error("List invitations error:", error)
    return NextResponse.json(
      { error: "Davetler alınırken bir hata oluştu." },
      { status: 500 }
    )
  }
}
