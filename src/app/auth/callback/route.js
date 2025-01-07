import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    try {
      await supabase.auth.exchangeCodeForSession(code);
      // Clean redirect without exposing any tokens
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(new URL("/auth", requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
