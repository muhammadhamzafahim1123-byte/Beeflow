import { NextRequest, NextResponse } from "next/server";
import { generateOtp, getOtpExpiry, hashOtp, isValidEmail, normalizeEmail } from "@/lib/auth/otp";
import { hasPersistentOtpStore, otpStore } from "@/lib/auth/otp-store";
import { sendOtpEmail } from "@/lib/email/send-otp-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUCCESS_MESSAGE = "Verification code sent.";
const CONFIG_MESSAGE = "Email service is not configured.";

export async function POST(request: NextRequest) {
  try {
    const configError = getConfigError();
    if (configError) {
      return NextResponse.json({ ok: false, message: configError }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = normalizeEmail(String(body.email || ""));
    const ip = getClientIp(request);

    if (!name || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, message: "Enter a valid name and email." }, { status: 400 });
    }

    const emailRate = await otpStore.checkRateLimit(`send:email:${email}`, 5, 15 * 60);
    const ipRate = await otpStore.checkRateLimit(`send:ip:${ip}`, 20, 15 * 60);
    const cooldown = await otpStore.checkCooldown(`cooldown:${email}`, 60);

    if (!emailRate.allowed || !ipRate.allowed || !cooldown.allowed) {
      return NextResponse.json({ ok: true, message: SUCCESS_MESSAGE });
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

    return NextResponse.json({ ok: true, message: SUCCESS_MESSAGE });
  } catch {
    return NextResponse.json({ ok: false, message: "We could not send a verification code right now. Please try again shortly." }, { status: 500 });
  }
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function getConfigError(): string | null {
  if (!process.env.RESEND_API_KEY) return CONFIG_MESSAGE;
  if (!process.env.OTP_SECRET) return CONFIG_MESSAGE;
  if (!process.env.SESSION_SECRET) return CONFIG_MESSAGE;
  if (process.env.NODE_ENV === "production" && !hasPersistentOtpStore()) return CONFIG_MESSAGE;
  return null;
}
