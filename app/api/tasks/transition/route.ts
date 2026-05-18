import { NextRequest, NextResponse } from "next/server";
import { validateStageTransition, type PipelineStage } from "@/lib/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      from?: PipelineStage;
      to?: PipelineStage;
      attachmentCount?: number;
      reviewerName?: string;
    };

    if (!body.from || !body.to) {
      return NextResponse.json({ ok: false, message: "Missing workflow stage." }, { status: 400 });
    }

    const result = validateStageTransition({
      from: body.from,
      to: body.to,
      attachmentCount: Number(body.attachmentCount || 0),
      reviewerName: body.reviewerName
    });

    if (!result.ok) return NextResponse.json(result, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Could not validate workflow transition." }, { status: 400 });
  }
}
