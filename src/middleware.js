import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Auth routes that should redirect if user is already logged in
  const authRoutes = ["/auth"];
  const isAuthRoute = authRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // If accessing protected route without session, redirect to auth
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  // If accessing auth route with active session, redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
