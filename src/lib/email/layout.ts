import { EMAIL_THEME } from "@/lib/email/theme";
import { getAppUrl } from "@/lib/env";

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
  const logoUrl = `${getAppUrl()}/logoHR360.png`;
  const body = paragraphs
    .map((paragraph) => {
      if (paragraph.trimStart().startsWith("<")) {
        return `<div style="margin:0 0 16px;">${paragraph}</div>`;
      }
      return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${EMAIL_THEME.muted};">${paragraph}</p>`;
    })
    .join("");

  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 16px;">
        <tr>
          <td style="border-radius:10px;background:${EMAIL_THEME.primary};">
            <a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
              ${escapeHtml(cta.label)}
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:${EMAIL_THEME.gray};">
        If the button does not work, paste this link into your browser:<br />
        <a href="${escapeHtml(cta.href)}" style="color:${EMAIL_THEME.secondary};word-break:break-all;">${escapeHtml(cta.href)}</a>
      </p>`
    : "";

  const html = `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${EMAIL_THEME.background};padding:32px 12px;font-family:Inter,Arial,Helvetica,sans-serif;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;width:100%;background:${EMAIL_THEME.surface};border:1px solid ${EMAIL_THEME.border};border-radius:18px;overflow:hidden;">
          <tr>
            <td style="background:${EMAIL_THEME.black};padding:22px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="${escapeHtml(logoUrl)}" width="40" height="40" alt="PeoplePay360" style="display:block;border-radius:8px;border:0;background:transparent;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:16px;font-weight:700;letter-spacing:-0.02em;color:#ffffff;">PeoplePay360</p>
                    <p style="margin:3px 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_THEME.secondary};">Personnel &amp; payroll</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${EMAIL_THEME.primary};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="height:3px;background:${EMAIL_THEME.secondary};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 28px 12px;">
              ${eyebrow ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL_THEME.primary};font-weight:700;">${escapeHtml(eyebrow)}</p>` : ""}
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${EMAIL_THEME.text};">${escapeHtml(title)}</h1>
              ${body}
              ${button}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;border-top:1px solid ${EMAIL_THEME.border};background:#FBF8FA;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${EMAIL_THEME.gray};">
                ${footer ?? "This message was sent by PeoplePay360. Open the app at " + escapeHtml(getAppUrl()) + "."}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;

  const text = [
    "PeoplePay360",
    title,
    "",
    ...paragraphs.map((paragraph) => paragraph.replaceAll(/<[^>]+>/g, "")),
    cta ? `${cta.label}: ${cta.href}` : "",
    footer ?? `Open PeoplePay360: ${getAppUrl()}`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { html, text };
}
