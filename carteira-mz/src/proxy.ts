import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
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
