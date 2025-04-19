import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the route is have admin-auth cookie
  const cookie = request.cookies.get("admin-auth");

  // Check if the token matches our expected value
  if (!cookie || cookie.value !== "admin123@@") {
    // Redirect to admin login if token is invalid
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/tests/:path*",
    "/api/typing-tests/:path*",
  ],
};
