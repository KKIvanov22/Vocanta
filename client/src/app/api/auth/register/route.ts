import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/utils/backend";

const TOKEN_COOKIE = "token";
const JWT_MAX_AGE = 3600;

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");

  const redirectRegister = (error: string) =>
    NextResponse.redirect(
      new URL(
        `/register?error=${encodeURIComponent(error)}`,
        request.url,
      ),
    );

  if (!name || !email || !password) {
    return redirectRegister("Please fill in all required fields.");
  }
  if (password !== confirmPassword) {
    return redirectRegister("Passwords do not match.");
  }

  const backend = getBackendUrl();
  let upstream: Response;
  try {
    upstream = await fetch(`${backend}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: name,
        email,
        password,
      }),
    });
  } catch {
    return redirectRegister(
      "Could not reach the server. Is the API running?",
    );
  }

  const data = (await upstream.json().catch(() => ({}))) as {
    token?: string;
    error?: string;
  };

  if (!upstream.ok || !data.token) {
    return redirectRegister(
      typeof data.error === "string" ? data.error : "Registration failed.",
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
