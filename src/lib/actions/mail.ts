"use server";

import { getAccessContext } from "@/lib/auth/access";
import { getAppUrl, isSmtpConfigured } from "@/lib/env";
import { getSmtpPublicStatus, sendMail, verifySmtp } from "@/lib/email/smtp";
import { smtpTestEmail } from "@/lib/email/welcome";

function canTestMail(role: string) {
  return role === "admin" || role === "company_admin";
}

export async function sendSmtpTest(formData: FormData) {
  const access = await getAccessContext();
  if (!canTestMail(access.role)) {
    return { error: "Only an admin can send a test email." };
  }

  const to = String(formData.get("to") ?? access.email ?? "").trim().toLowerCase();
  if (!to || !to.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  if (!isSmtpConfigured()) {
    return { error: "Add Hostinger SMTP settings on the server first." };
  }

  try {
    await verifySmtp();
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `Could not connect to Hostinger SMTP: ${error.message}`
          : "Could not connect to Hostinger SMTP.",
    };
  }

  const status = getSmtpPublicStatus();
  if (!status.configured || !status.host || !status.port || !status.from) {
    return { error: "SMTP is not configured." };
  }

  try {
    const result = await sendMail({
      to,
      ...smtpTestEmail({
        recipient: to,
        host: status.host,
        port: status.port,
        from: status.from,
        sentAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        appUrl: getAppUrl(),
      }),
    });

    if (result.rejected.length > 0) {
      return { error: `Hostinger rejected the recipient: ${result.rejected.join(", ")}` };
    }

    return { error: null, to };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "The test email could not be sent.",
    };
  }
}
