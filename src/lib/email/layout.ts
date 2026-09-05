import { readFile } from "node:fs/promises";
import path from "node:path";
import { EMAIL_THEME, LOGO_CID } from "@/lib/email/theme";

export type EmailCta = {
  label: string;
  href: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function brandedEmail({
  eyebrow,
  title,
  paragraphs,
  cta,
  footer,
}: {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  cta?: EmailCta;
  footer?: string;
}) {
  const body = paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:${EMAIL_THEME.muted};">${paragraph}</p>`,
    )
    .join("");

  const button = cta
    ? `<p style="margin:28px 0 8px;">
        <a href="${escapeHtml(cta.href)}" style="display:inline-block;background:${EMAIL_THEME.primary};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-size:14px;font-weight:600;">
          ${escapeHtml(cta.label)}
        </a>
      </p>
      <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:${EMAIL_THEME.gray};">
        If the button does not work, paste this link into your browser:<br />
        ${escapeHtml(cta.href)}
      </p>`
    : "";

  const html = `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${EMAIL_THEME.background};padding:28px 12px;font-family:Inter,Arial,Helvetica,sans-serif;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;width:100%;background:${EMAIL_THEME.surface};border:1px solid ${EMAIL_THEME.border};border-radius:18px;overflow:hidden;">
          <tr>
            <td style="background:${EMAIL_THEME.black};padding:22px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="cid:${LOGO_CID}" width="40" height="40" alt="PeoplePay360" style="display:block;border-radius:8px;border:0;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:15px;font-weight:700;letter-spacing:-0.02em;color:#ffffff;">PeoplePay360</p>
                    <p style="margin:2px 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_THEME.secondary};">Personnel &amp; payroll</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${EMAIL_THEME.primary};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 28px 20px;">
              ${eyebrow ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_THEME.primary};font-weight:700;">${escapeHtml(eyebrow)}</p>` : ""}
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${EMAIL_THEME.text};">${escapeHtml(title)}</h1>
              ${body}
              ${button}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid ${EMAIL_THEME.border};">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${EMAIL_THEME.gray};">
                ${footer ?? "This message was sent by PeoplePay360 using your Hostinger mailbox."}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;

  const text = [
    "PeoplePay360",
    title.replaceAll(/<[^>]+>/g, ""),
    "",
    ...paragraphs.map((paragraph) => paragraph.replaceAll(/<[^>]+>/g, "")),
    cta ? `${cta.label}: ${cta.href}` : "",
    footer ?? "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { html, text };
}

export async function brandLogoAttachment() {
  const filePath = path.join(process.cwd(), "src/lib/email/assets/logo.png");
  const content = await readFile(filePath);
  return {
    filename: "logoHR360.png",
    content,
    contentType: "image/png" as const,
    cid: LOGO_CID,
  };
}
