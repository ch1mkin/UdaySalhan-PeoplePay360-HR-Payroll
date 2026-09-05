import { roleLabel } from "@/lib/auth/permissions";
import type { AppRole } from "@/types/hr";

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
  const subject = `Welcome to PeoplePay360`;
  const text = [
    `Hi ${greeting},`,
    ``,
    `You have been added to ${companyName} on PeoplePay360 as ${roleName}.`,
    `Set your password with this link, then sign in:`,
    setupUrl,
    ``,
    `If you were not expecting this, you can ignore the message.`,
  ].join("\n");

  const html = `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F7F7F7;padding:32px 12px;font-family:Inter,Arial,sans-serif;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="background:#ffffff;border:1px solid #E5E5E5;border-radius:16px;padding:32px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#714B67;font-weight:600;">PeoplePay360</p>
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#2F2F2F;">Welcome to the platform</h1>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#6B6B6B;">
                Hi ${escapeHtml(greeting)}, you have been invited to <strong style="color:#2F2F2F;">${escapeHtml(companyName)}</strong>
                as <strong style="color:#2F2F2F;">${escapeHtml(roleName)}</strong>.
              </p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#6B6B6B;">
                Use the button below to choose your password. After that, sign in with your work email and that password.
              </p>
              <p style="margin:0 0 28px;">
                <a href="${escapeHtml(setupUrl)}" style="display:inline-block;background:#714B67;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;">
                  Set your password
                </a>
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#8F8F8F;">
                If the button does not work, paste this link into your browser:<br />
                ${escapeHtml(setupUrl)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;

  return { subject, text, html };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
