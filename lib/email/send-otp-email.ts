import { Resend } from "resend";

type SendOtpEmailInput = {
  email: string;
  name: string;
  code: string;
};

export async function sendOtpEmail({ email, name, code }: SendOtpEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required");
  }

  const resend = new Resend(apiKey);
  const safeName = name.trim() || "there";

  const result = await resend.emails.send({
    from,
    to: email,
    subject: "Your BeeFlow verification code",
    text: [
      `Hi ${safeName},`,
      "",
      `Your BeeFlow login code is: ${code}`,
      "",
      "This code expires in 10 minutes.",
      "If you did not request this code, ignore this email."
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;background:#000;color:#fff;padding:24px">
        <div style="max-width:520px;margin:0 auto;border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:24px">
          <h1 style="margin:0 0 12px;font-size:22px">BeeFlow verification code</h1>
          <p style="color:rgba(255,255,255,.72)">Hi ${escapeHtml(safeName)},</p>
          <p style="color:rgba(255,255,255,.72)">Your BeeFlow login code is:</p>
          <div style="display:inline-block;background:#D5FF27;color:#000;border-radius:12px;padding:12px 18px;font-size:28px;font-weight:700;letter-spacing:4px">${code}</div>
          <p style="color:rgba(255,255,255,.72)">This code expires in 10 minutes.</p>
          <p style="color:rgba(255,255,255,.55);font-size:13px">If you did not request this code, ignore this email.</p>
        </div>
      </div>
    `
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char] || char);
}
