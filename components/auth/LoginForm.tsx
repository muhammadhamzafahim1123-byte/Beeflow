"use client";

import { FormEvent, useState } from "react";
import VerifyCodeForm from "./VerifyCodeForm";

type AuthStep = "login" | "verify";

export default function LoginForm() {
  const [step, setStep] = useState<AuthStep>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid work email.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not send code.");

      setMessage("Code sent. Check your email.");
      setStep("verify");
    } catch {
      setError("We could not send a verification code right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "verify") {
    return (
      <VerifyCodeForm
        email={email}
        onBack={() => {
          setStep("login");
          setMessage("");
          setError("");
        }}
        onResend={() => {
          setStep("login");
          setTimeout(() => {
            const form = document.querySelector("form");
            form?.requestSubmit();
          }, 0);
        }}
      />
    );
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
        <h1>Login to BeeFlow</h1>
        <p>Use your work email. BeeFlow will send a one-time code before opening the workspace.</p>
        {message ? <div className="message">{message}</div> : null}
        {error ? <div className="message error">{error}</div> : null}
        <label className="field">
          <span>Your name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
        </label>
        <label className="field">
          <span>Work email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" type="email" />
        </label>
        <div className="actions">
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Sending code..." : "Send verification code"}
          </button>
        </div>
      </form>
    </main>
  );
}
