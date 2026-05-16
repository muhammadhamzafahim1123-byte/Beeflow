import crypto from "node:crypto";
import { cookies } from "next/headers";
import { otpStore } from "./otp-store";

const SESSION_DAYS = 14;
export const SESSION_COOKIE = "beeflow_session";

export function createSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is required");
  }

  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export function getSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function createAuthenticatedSession(userId: string): Promise<void> {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = getSessionExpiry();

  await otpStore.createSession({ userId, tokenHash, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });
}
