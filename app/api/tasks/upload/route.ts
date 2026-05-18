import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "video/mp4", "application/zip", "application/x-zip-compressed"]);

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const taskId = String(form.get("taskId") || "");
    const figmaUrl = String(form.get("figmaUrl") || "");
    const file = form.get("file");

    if (!taskId) return NextResponse.json({ ok: false, message: "Task is required." }, { status: 400 });
    if (figmaUrl) {
      if (!/^https:\/\/(www\.)?figma\.com\//.test(figmaUrl)) {
        return NextResponse.json({ ok: false, message: "Figma URL is not valid." }, { status: 400 });
      }
      return NextResponse.json({
        ok: true,
        file: {
          id: crypto.randomUUID(),
          taskId,
          name: "Figma URL",
          type: "application/x-figma-url",
          size: 0,
          uploadedAt: new Date().toISOString()
        }
      });
    }
    if (!(file instanceof File)) return NextResponse.json({ ok: false, message: "Choose a file to upload." }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ ok: false, message: "File type is not supported." }, { status: 415 });
    if (file.size > MAX_SIZE) return NextResponse.json({ ok: false, message: "File must be 50MB or smaller." }, { status: 413 });

    return NextResponse.json({
      ok: true,
      file: {
        id: crypto.randomUUID(),
        taskId,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Upload failed." }, { status: 400 });
  }
}
