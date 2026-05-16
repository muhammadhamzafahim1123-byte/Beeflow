# Beeflow

BeeFlow is a dark, compact internal workflow management prototype for Beenco.

It includes dashboard, work list, projects, tasks, QA, Figma work, docs, deliverables, team, reports, and settings views.

## Email OTP Auth

BeeFlow uses Vercel/Next API routes for professional email OTP login:

- `POST /api/auth/send-code`
- `POST /api/auth/verify-code`

Required environment variables:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev
OTP_SECRET=
SESSION_SECRET=
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

OTP codes are sent by Resend, hashed before storage, expire in 10 minutes, allow 5 attempts, and authentication is stored in an HTTP-only session cookie. This implementation uses Postgres through `DATABASE_URL` for OTPs, rate limits, users, and sessions.

For production, replace `onboarding@resend.dev` with a verified sender on your own domain in Resend.

Google OAuth callback URL:

```text
https://your-domain.com/api/auth/google/callback
```

Add that URL to your Google OAuth client authorized redirect URIs. `GOOGLE_REDIRECT_URI` is optional if the deployment URL matches the incoming request host, but setting it explicitly is recommended on Vercel.
