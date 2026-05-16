import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = [
  "/dashboard",
  "/contas",
  "/transacoes",
  "/transferencias",
  "/emprestimos",
  "/metas",
  "/orcamentos",
  "/relatorios",
  "/configuracoes",
]

const adminRoutes = ["/admin/dashboard", "/admin/usuarios", "/admin/contas"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCookie = request.cookies.get("carteira_session")?.value

  if (adminRoutes.some((route) => pathname.startsWith(route)) || pathname === "/admin") {
    if (!authCookie || authCookie !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!authCookie || authCookie !== "authenticated") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/contas/:path*",
    "/transacoes/:path*",
    "/transferencias/:path*",
    "/emprestimos/:path*",
    "/metas/:path*",
    "/orcamentos/:path*",
    "/relatorios/:path*",
    "/configuracoes/:path*",
    "/admin/:path*",
  ],
}
