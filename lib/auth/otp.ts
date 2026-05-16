import crypto from "node:crypto";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;

export function generateOtp(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(OTP_LENGTH, "0");
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidOtp(code: string): boolean {
  return /^\d{6}$/.test(code);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashOtp(email: string, code: string): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) {
    throw new Error("OTP_SECRET is required");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${normalizeEmail(email)}:${code}`)
    .digest("hex");
}

export function compareHash(expectedHash: string, actualHash: string): boolean {
  const expected = Buffer.from(expectedHash, "hex");
  const actual = Buffer.from(actualHash, "hex");

  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}
