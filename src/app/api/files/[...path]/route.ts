import { NextResponse } from "next/server"
import { readFile, stat } from "fs/promises"
import { join, resolve } from "path"

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || join(process.cwd(), "data", "uploads")

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const filePath = resolve(join(UPLOAD_DIR, ...path))

    // Dizin geçiş saldırısını önle
    if (!filePath.startsWith(resolve(UPLOAD_DIR))) {
      return NextResponse.json(
        { error: "Erişim reddedildi" },
        { status: 403 }
      )
    }

    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) {
      return NextResponse.json(
        { error: "Dosya bulunamadı" },
        { status: 404 }
      )
    }

    const buffer = await readFile(filePath)

    const ext = filePath.split(".").pop()?.toLowerCase()
    const contentTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentTypes[ext || ""] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Dosya bulunamadı" },
      { status: 404 }
    )
  }
}
