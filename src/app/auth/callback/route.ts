/**
 * Auth callback handler for Supabase invite/magic links.
 * Supabase redirects here after email confirmation, invite acceptance, etc.
 * Route: /auth/callback
 */

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const next = url.searchParams.get("next") ?? "/"

  if (code) {
    // With @supabase/ssr we'd exchange the code here.
    // Since we're using the browser client, redirect to the app
    // and let the client-side SDK handle the session.
    return NextResponse.redirect(new URL(next, url.origin))
  }

  // No code → redirect to login
  return NextResponse.redirect(new URL("/login", url.origin))
}
