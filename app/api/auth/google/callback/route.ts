import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { otpStore } from "@/lib/auth/otp-store";
import { createAuthenticatedSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GOOGLE_STATE_COOKIE = "beeflow_google_state";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleUserInfo = {
  email?: string;
  email_verified?: boolean;
  name?: string;
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;

  cookieStore.delete(GOOGLE_STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/?error=google_invalid_state", request.url));
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.SESSION_SECRET) {
    return NextResponse.redirect(new URL("/?error=google_not_configured", request.url));
  }

  try {
    const redirectUri = getRedirectUri(request);
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenResponse.ok || !tokenData.access_token) {
      return NextResponse.redirect(new URL("/?error=google_failed", request.url));
    }

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = (await profileResponse.json()) as GoogleUserInfo;

    if (!profileResponse.ok || !profile.email || profile.email_verified === false) {
      return NextResponse.redirect(new URL("/?error=google_unverified_email", request.url));
    }

    const user = await otpStore.upsertUser({
      email: profile.email.toLowerCase(),
      name: profile.name || profile.email
    });

    await createAuthenticatedSession(user.id);

    return NextResponse.redirect(new URL(user.hasWorkspace ? "/dashboard" : "/onboarding", request.url));
  } catch {
    return NextResponse.redirect(new URL("/?error=google_failed", request.url));
  }
}

function getRedirectUri(request: NextRequest): string {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  return new URL("/api/auth/google/callback", request.url).toString();
}
