import { NextRequest, NextResponse } from "next/server";
import { compareHash, hashOtp, isValidEmail, isValidOtp, normalizeEmail } from "@/lib/auth/otp";
import { hasPersistentOtpStore, otpStore } from "@/lib/auth/otp-store";
import { createAuthenticatedSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const INVALID_MESSAGE = "Invalid or expired code.";

export async function POST(request: NextRequest) {
  try {
    const configError = getConfigError();
    if (configError) {
      return NextResponse.json({ ok: false, message: configError }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(String(body.email || ""));
    const code = String(body.code || "").trim();
    const ip = getClientIp(request);

    if (!isValidEmail(email) || !isValidOtp(code)) {
      return NextResponse.json({ ok: false, message: INVALID_MESSAGE }, { status: 400 });
    }

    const emailRate = await otpStore.checkRateLimit(`verify:email:${email}`, 10, 15 * 60);
    const ipRate = await otpStore.checkRateLimit(`verify:ip:${ip}`, 40, 15 * 60);

    if (!emailRate.allowed || !ipRate.allowed) {
      return NextResponse.json({ ok: false, message: "Too many attempts. Request a new code." }, { status: 429 });
    }

    const otp = await otpStore.findLatestActiveOtp(email);
    if (!otp) {
      return NextResponse.json({ ok: false, message: INVALID_MESSAGE }, { status: 400 });
    }

    if (otp.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ ok: false, message: "Too many attempts. Request a new code." }, { status: 429 });
    }

    const enteredHash = hashOtp(email, code);
    if (!compareHash(otp.hashedCode, enteredHash)) {
      await otpStore.incrementAttempts(otp.id);
      return NextResponse.json({ ok: false, message: INVALID_MESSAGE }, { status: 400 });
    }

    await otpStore.markOtpUsed(otp.id);
    const user = await otpStore.upsertUser({ email, name: otp.name });
    await createAuthenticatedSession(user.id);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
      next: user.hasWorkspace ? "dashboard" : "onboarding"
    });
  } catch {
    return NextResponse.json({ ok: false, message: "We could not verify the code right now. Please try again." }, { status: 500 });
  }
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function getConfigError(): string | null {
  if (!process.env.OTP_SECRET) return "Email service is not configured.";
  if (!process.env.SESSION_SECRET) return "Email service is not configured.";
  if (process.env.NODE_ENV === "production" && !hasPersistentOtpStore()) return "Email service is not configured.";
  return null;
}
