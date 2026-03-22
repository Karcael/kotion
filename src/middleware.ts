import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production"
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("kotion-token")?.value

  // Genel sayfalar - kimlik doğrulama gerekmez
  if (pathname === "/") {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET)
        return NextResponse.redirect(new URL("/documents", request.url))
      } catch {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Auth sayfaları - giriş yapmış kullanıcıları yönlendir
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET)
        return NextResponse.redirect(new URL("/documents", request.url))
      } catch {
        // Token geçersiz, auth sayfasına devam et
      }
    }
    return NextResponse.next()
  }

  // Auth API rotaları - herkese açık
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Korunan rotalar - kimlik doğrulama gerekli
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/files).*)"],
}
