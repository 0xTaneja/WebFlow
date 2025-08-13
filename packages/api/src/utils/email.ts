import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const DEFAULT_FROM = process.env.RESEND_FROM || "Acme <onboarding@resend.dev>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await resend.emails.send({
      from: DEFAULT_FROM,
      ...opts,
    });
  } catch (err) {
    // Surface useful diagnostics during development
    console.error("Resend email send failed", err);
    throw err;
  }
}