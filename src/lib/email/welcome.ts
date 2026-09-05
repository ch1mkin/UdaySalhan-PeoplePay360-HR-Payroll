import { roleLabel } from "@/lib/auth/permissions";
import type { AppRole } from "@/types/hr";
import { brandedEmail } from "@/lib/email/layout";
import { EMAIL_THEME } from "@/lib/email/theme";
import { getAppUrl } from "@/lib/env";

export function welcomeInviteEmail({
  fullName,
  role,
  setupUrl,
  companyName,
}: {
  fullName: string;
  role: AppRole;
  setupUrl: string;
  companyName: string;
}) {
  const greeting = fullName || "there";
  const roleName = roleLabel(role);
  const appUrl = getAppUrl();
  const { html, text } = brandedEmail({
    eyebrow: "You are invited",
    title: "Welcome to PeoplePay360",
    paragraphs: [
      `Hi ${escapeHtml(greeting)}, an admin has created your login for <strong style="color:${EMAIL_THEME.text};">${escapeHtml(companyName)}</strong>.`,
      `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 8px;border:1px solid ${EMAIL_THEME.border};border-radius:12px;background:#FBF8FA;">
        <tr>
          <td style="padding:14px 16px;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_THEME.gray};">Company</p>
            <p style="margin:0 0 14px;font-size:15px;font-weight:700;color:${EMAIL_THEME.text};">${escapeHtml(companyName)}</p>
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_THEME.gray};">Workspace role</p>
            <p style="margin:0;font-size:15px;font-weight:700;color:${EMAIL_THEME.primary};">${escapeHtml(roleName)}</p>
          </td>
        </tr>
      </table>`,
      "Use the button below to set your password, then add your employee details. A platform admin reviews and approves access. You cannot assign a role yourself.",
    ],
    cta: { label: "Set your password", href: setupUrl },
    footer: `This invite was sent by PeoplePay360 for ${companyName}. Open the workspace at ${appUrl}.`,
  });

  return {
    subject: `You are invited to ${companyName} on PeoplePay360`,
    text,
    html,
  };
}

export function smtpTestEmail({
  recipient,
  host,
  port,
  from,
  sentAt,
  appUrl,
}: {
  recipient: string;
  host: string;
  port: number;
  from: string;
  sentAt: string;
  appUrl: string;
}) {
  const { html, text } = brandedEmail({
    eyebrow: "Mail test",
    title: "Hostinger SMTP is working",
    paragraphs: [
      `This test message reached <strong style="color:${EMAIL_THEME.text};">${escapeHtml(recipient)}</strong> through your Hostinger mailbox.`,
      `Sent from <strong style="color:${EMAIL_THEME.text};">${escapeHtml(from)}</strong> via <strong style="color:${EMAIL_THEME.text};">${escapeHtml(host)}:${port}</strong> at ${escapeHtml(sentAt)}.`,
      "If you can read this, PeoplePay360 can send welcome invites and payroll mail from the same template.",
    ],
    cta: { label: "Open PeoplePay360", href: appUrl },
    footer: "You sent this test from Settings. It is safe to ignore.",
  });

  return {
    subject: "PeoplePay360 SMTP test",
    text,
    html,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
