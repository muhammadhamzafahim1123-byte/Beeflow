import { NextRequest, NextResponse } from "next/server";
import { generateOtp, getOtpExpiry, hashOtp, isValidEmail, normalizeEmail } from "@/lib/auth/otp";
import { otpStore } from "@/lib/auth/otp-store";
import { sendOtpEmail } from "@/lib/email/send-otp-email";

const GENERIC_SUCCESS = "If this email is valid, a verification code has been sent.";
const GENERIC_ERROR = "We could not send a verification code right now. Please try again shortly.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = normalizeEmail(String(body.email || ""));
    const ip = getClientIp(request);

    if (!name || !isValidEmail(email)) {
      return NextResponse.json({ ok: true, message: GENERIC_SUCCESS });
    }

    const emailRate = await otpStore.checkRateLimit(`send:email:${email}`, 5, 15 * 60);
    const ipRate = await otpStore.checkRateLimit(`send:ip:${ip}`, 20, 15 * 60);
    const cooldown = await otpStore.checkCooldown(`cooldown:${email}`, 60);

    if (!emailRate.allowed || !ipRate.allowed || !cooldown.allowed) {
      return NextResponse.json({ ok: true, message: GENERIC_SUCCESS });
    }

    const code = generateOtp();
    const hashedCode = hashOtp(email, code);

    const expiresAt = getOtpExpiry();

    await sendOtpEmail({ email, name, code });

    await otpStore.createOtp({
      email,
      name,
      hashedCode,
      expiresAt
    });

    return NextResponse.json({ ok: true, message: GENERIC_SUCCESS });
  } catch {
    return NextResponse.json({ ok: false, message: GENERIC_ERROR }, { status: 500 });
  }
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
