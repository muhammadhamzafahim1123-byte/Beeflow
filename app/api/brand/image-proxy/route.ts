import { NextRequest, NextResponse } from "next/server";
import { upgradeProfileImageUrl } from "@/lib/profile-image-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl || !/^https:\/\//i.test(rawUrl)) {
    return new NextResponse("Invalid image url.", { status: 400 });
  }
  const url = upgradeProfileImageUrl(rawUrl);

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "BeeFlow/1.0" },
      next: { revalidate: 86400 }
    });
    if (!response.ok) throw new Error("image fetch failed");
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch {
    return new NextResponse("Image unavailable.", { status: 502 });
  }
}
