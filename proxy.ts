import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"

const AUTH_PAGES = ["/login", "/register"] as const;
function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((page) => pathname.startsWith(page));
}

export default async function proxy(request: NextRequest) {
  const session = await auth()
  const isAuth = !!session?.user
  const onAuthPage = isAuthPage(request.nextUrl.pathname)

  if (onAuthPage) {
    if (isAuth) return NextResponse.redirect(new URL("/dashboard", request.url))
    return NextResponse.next()
  }

  if (!isAuth) return NextResponse.redirect(new URL("/login", request.url))

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/topics", "/topics/:path*",
    "/workspaces", "/workspaces/:path*",
    "/groups", "/groups/:path*",
    "/login", "/register",
  ],
}
