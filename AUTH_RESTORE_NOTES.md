# BeeFlow Auth Restore Notes

Login is paused temporarily.

Current temporary behavior:
- `/` opens the BeeFlow product directly.
- Auth components and API routes are still kept in the codebase.

When login should be restored:
- Change `app/page.tsx` back to render `LoginForm`.
- Keep the existing auth setup:
  - `components/auth/LoginForm.tsx`
  - `components/auth/VerifyCodeForm.tsx`
  - `app/api/auth/send-code/route.ts`
  - `app/api/auth/verify-code/route.ts`
  - `app/api/auth/google/start/route.ts`
  - `app/api/auth/google/callback/route.ts`
  - `app/api/auth/callback/google/route.ts`

Required env variables for restore:

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

Google callback paths currently supported:
- `/api/auth/google/callback`
- `/api/auth/callback/google`
