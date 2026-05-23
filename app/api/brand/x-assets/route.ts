import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle")?.replace(/^@/, "").trim();
  if (!handle) {
    return NextResponse.json({ error: "handle required" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.fxtwitter.com/${encodeURIComponent(handle)}`, {
      headers: { "User-Agent": "BeeFlow/1.0" },
      next: { revalidate: 3600 }
    });
    if (!response.ok) throw new Error("profile lookup failed");
    const data = await response.json();
    const user = data?.user;
    return NextResponse.json({
      avatar: typeof user?.avatar_url === "string" ? user.avatar_url : "",
      banner: typeof user?.banner_url === "string" ? user.banner_url : ""
    });
  } catch {
    return NextResponse.json({ avatar: "", banner: "" });
  }
}
