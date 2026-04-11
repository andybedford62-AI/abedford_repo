import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/register", "/pricing", "/about", "/blog"];
const authPaths = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect dashboard and app routes
  if (!isAuthenticated && !publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/projects") ||
        pathname.startsWith("/ai") || pathname.startsWith("/team") ||
        pathname.startsWith("/settings") || pathname.startsWith("/chat")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
