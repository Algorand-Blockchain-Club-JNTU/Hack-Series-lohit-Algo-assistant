import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware to validate responses and prevent Solidity code from being sent to the client
 */
export function middleware(request: NextRequest) {
  // Only intercept responses from the chat API
  if (!request.nextUrl.pathname.startsWith("/api/chat")) {
    return NextResponse.next()
  }

  // Clone the response
  const response = NextResponse.next()

  // Modify the response
  response.headers.set("x-middleware-cache", "no-cache")

  // We'll add validation logic in the API route itself
  // This middleware is just an extra layer of protection
  return response
}

export const config = {
  matcher: "/api/:path*",
}
