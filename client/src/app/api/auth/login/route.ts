import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend";

const TOKEN_COOKIE = "token";
const JWT_MAX_AGE = 3600;

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  const redirectLogin = (error: string) =>
    NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url),
    );

  if (!email || !password) {
    return redirectLogin("Please enter your email and password.");
  }

  const backend = getBackendUrl();
  let upstream: Response;
  try {
    upstream = await fetch(`${backend}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return redirectLogin(
      "Could not reach the server. Is the API running?",
    );
  }

  const data = (await upstream.json().catch(() => ({}))) as {
    token?: string;
    error?: string;
  };

  if (!upstream.ok || !data.token) {
    return redirectLogin(
      typeof data.error === "string" ? data.error : "Sign in failed.",
    );
  }

  const res = NextResponse.redirect(new URL("/dashboard", request.url));
  res.cookies.set(TOKEN_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: JWT_MAX_AGE,
  });
  return res;
}
