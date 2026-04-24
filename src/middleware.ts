import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { MiddlewareConfig, NextRequest } from "next/server"

const PUBLIC_PATHS = ["/login", "/signup"]

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const isAuth = !!token
  const isPublic = PUBLIC_PATHS.includes(pathname)

  // Si el usuario ya tiene sesión e intenta acceder a login/register, redirigimos
  if (isAuth && isPublic) {
    return NextResponse.redirect(new URL("/inicio", req.url))
  }

  // Si no tiene sesión y va a una ruta privada, redirigimos a login
  if (!isAuth && !isPublic && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
