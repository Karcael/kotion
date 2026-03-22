import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { getDocumentWithAccess } from "@/lib/document-access"

type RouteParams = { params: Promise<{ documentId: string }> }

// GET /api/documents/[documentId]
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const { documentId } = await params
    const access = await getDocumentWithAccess(documentId, user.id)

    if (!access) {
      return NextResponse.json(
        { error: "Doküman bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json({ ...access.document, role: access.role })
  } catch (error) {
    console.error("Get document error:", error)
    return NextResponse.json(
      { error: "Doküman alınırken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// PATCH /api/documents/[documentId]
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const { documentId } = await params
    const body = await request.json()
    const access = await getDocumentWithAccess(documentId, user.id)

    if (!access) {
      return NextResponse.json(
        { error: "Doküman bulunamadı" },
        { status: 404 }
      )
    }

    // VIEWER düzenleyemez
    if (access.role === "VIEWER") {
      return NextResponse.json(
        { error: "Düzenleme yetkiniz yok" },
        { status: 403 }
      )
    }

    // Sadece sahip arşivleyebilir, silebilir, yayınlayabilir
    const ownerOnlyFields = ["isArchived", "isFavorite", "isPublished"]
    if (access.role !== "OWNER") {
      for (const field of ownerOnlyFields) {
        if (field in body) {
          return NextResponse.json(
            { error: "Bu işlem için sahip olmanız gerekiyor" },
            { status: 403 }
          )
        }
      }
    }

    const allowedFields = [
      "title",
      "content",
      "icon",
      "coverImage",
      "isArchived",
      "isFavorite",
      "isPublished",
    ]
    const updateData: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (body.isArchived === true) {
      await archiveChildren(documentId)
    }

    if (body.isArchived === false && access.document.parentId) {
      await restoreParentChain(access.document.parentId)
    }

    const document = await prisma.document.update({
      where: { id: documentId },
      data: updateData,
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error("Update document error:", error)
    return NextResponse.json(
      { error: "Doküman güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[documentId] — sadece sahip
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const { documentId } = await params
    const access = await getDocumentWithAccess(documentId, user.id)

    if (!access) {
      return NextResponse.json(
        { error: "Doküman bulunamadı" },
        { status: 404 }
      )
    }

    if (access.role !== "OWNER") {
      return NextResponse.json(
        { error: "Silme yetkisi sadece sayfa sahibine aittir" },
        { status: 403 }
      )
    }

    await deleteDocumentRecursive(documentId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete document error:", error)
    return NextResponse.json(
      { error: "Doküman silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

async function archiveChildren(parentId: string) {
  const children = await prisma.document.findMany({
    where: { parentId },
  })

  for (const child of children) {
    await prisma.document.update({
      where: { id: child.id },
      data: { isArchived: true },
    })
    await archiveChildren(child.id)
  }
}

async function restoreParentChain(parentId: string) {
  const parent = await prisma.document.findUnique({
    where: { id: parentId },
  })

  if (parent && parent.isArchived) {
    await prisma.document.update({
      where: { id: parent.id },
      data: { isArchived: false },
    })
    if (parent.parentId) {
      await restoreParentChain(parent.parentId)
    }
  }
}

async function deleteDocumentRecursive(documentId: string) {
  const children = await prisma.document.findMany({
    where: { parentId: documentId },
  })

  for (const child of children) {
    await deleteDocumentRecursive(child.id)
  }

  await prisma.document.delete({
    where: { id: documentId },
  })
}
