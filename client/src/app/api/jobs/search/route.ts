import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend";

const TOKEN_COOKIE = "token";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value?.trim();
  if (!token) {
    return NextResponse.json(
      { status: "error", message: "Not authenticated" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid JSON" },
      { status: 400 },
    );
  }

  const backend = getBackendUrl();
  let upstream: Response;
  try {
    upstream = await fetch(`${backend}/api/jobs/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Could not reach the job search service." },
      { status: 502 },
    );
  }

  const data = (await upstream.json().catch(() => ({}))) as unknown;
  return NextResponse.json(data, { status: upstream.status });
}
