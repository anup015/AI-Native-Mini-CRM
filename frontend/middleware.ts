import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { env } from "@/lib/env";

export default async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: env.AUTH_SECRET });
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/api/leads") ||
    request.nextUrl.pathname.startsWith("/api/ai") ||
    request.nextUrl.pathname.startsWith("/api/customers") ||
    request.nextUrl.pathname.startsWith("/api/audience") ||
    request.nextUrl.pathname.startsWith("/api/segments");

  if (!isProtectedRoute || token) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/leads/:path*", "/api/ai/:path*", "/api/customers/:path*", "/api/audience/:path*", "/api/segments/:path*"]
};
