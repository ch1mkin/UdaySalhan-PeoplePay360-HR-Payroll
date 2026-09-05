import { roleLabel } from "@/lib/auth/permissions";
import type { AppRole } from "@/types/hr";
import { brandedEmail } from "@/lib/email/layout";

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
  const { html, text } = brandedEmail({
    eyebrow: "Welcome",
    title: "You have been added to PeoplePay360",
    paragraphs: [
      `Hi ${escapeHtml(greeting)}, you have been invited to <strong style="color:#2F2F2F;">${escapeHtml(companyName)}</strong>. Your workspace role will be <strong style="color:#2F2F2F;">${escapeHtml(roleName)}</strong> after an admin approves your details.`,
      "Set your password, then fill in your employee details. You cannot assign a role yourself. A platform admin reviews and approves your access.",
    ],
    cta: { label: "Set password and add your details", href: setupUrl },
  });

  return {
    subject: "Welcome to PeoplePay360",
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
      `This test message reached <strong style="color:#2F2F2F;">${escapeHtml(recipient)}</strong> through your Hostinger mailbox.`,
      `Sent from <strong style="color:#2F2F2F;">${escapeHtml(from)}</strong> via <strong style="color:#2F2F2F;">${escapeHtml(host)}:${port}</strong> at ${escapeHtml(sentAt)}.`,
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
