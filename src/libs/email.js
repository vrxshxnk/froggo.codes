// src/libs/email.js
// Server-side transactional email via Resend (https://resend.com)
// Requires RESEND_API_KEY in the environment. Fails soft (logs and skips)
// so a missing key never blocks payments or enrollment.
import config from "@/config";

export async function sendEmail({ to, subject, html, replyTo }) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn(`RESEND_API_KEY not set — skipping email "${subject}" to ${to}`);
        return { skipped: true };
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: config.resend.from,
            to: [to],
            subject,
            html,
            ...(replyTo ? { reply_to: replyTo } : {}),
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Resend API error ${response.status}: ${text}`);
    }

    return response.json();
}

export async function sendEnrollmentEmail({ to, courseTitle, courseId, amount, currency }) {
    const courseUrl = `https://${config.domainName}/my-courses/${courseId}`;
    const amountLine =
        amount != null
            ? `<p style="margin:0 0 16px;color:#555;">Amount paid: <strong>${currency === "INR" ? "₹" : ""}${amount}${currency && currency !== "INR" ? ` ${currency}` : ""}</strong></p>`
            : "";

    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
      <h1 style="font-size:22px;margin:0 0 8px;">🐸 Welcome to ${courseTitle}!</h1>
      <p style="margin:0 0 16px;color:#333;">
        Your payment was successful and your course is ready. You have lifetime access —
        start whenever you like and go at your own pace.
      </p>
      ${amountLine}
      <a href="${courseUrl}"
         style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:8px;margin:8px 0 24px;">
        Start Learning
      </a>
      <p style="margin:0 0 4px;color:#777;font-size:13px;">
        Need help? Just reply to this email and we'll get back to you.
      </p>
      <p style="margin:0;color:#aaa;font-size:12px;">FroggoCodes · https://${config.domainName}</p>
    </div>`;

    return sendEmail({
        to,
        subject: `You're in! ${courseTitle} is ready 🐸`,
        html,
        replyTo: config.resend.supportEmail,
    });
}
