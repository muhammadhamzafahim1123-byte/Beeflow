"use client";

import { FormEvent, useState } from "react";

type VerifyCodeFormProps = {
  email: string;
  onBack: () => void;
  onResend: () => void;
};

export default function VerifyCodeForm({ email, onBack, onResend }: VerifyCodeFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(code.trim())) {
      setError("Invalid code. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid code. Please try again.");

      window.location.href = data.next === "dashboard" ? "/dashboard" : "/onboarding";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand-row">
          <span className="brand-mark">B</span>
          <div>
            <strong>BeeFlow</strong>
            <small>Verified workspace login</small>
          </div>
        </div>
        <h1>Enter verification code</h1>
        <p>We sent a one-time verification code to {email}. Check your inbox and enter the code below.</p>
        {error ? <div className="message error">{error}</div> : null}
        <label className="field">
          <span>Verification code</span>
          <input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="6 digit code" />
        </label>
        <div className="actions">
          <button className="secondary" type="button" onClick={onBack}>
            Use another email
          </button>
          <button className="secondary" type="button" onClick={onResend}>
            Resend code
          </button>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify and continue"}
          </button>
        </div>
      </form>
    </main>
  );
}
