import "server-only";

import nodemailer from "nodemailer";
import { getSmtpConfig } from "@/lib/env";

export type SendMailInput = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
};

function createTransport() {
  const config = getSmtpConfig();

  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE || config.SMTP_PORT === 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASSWORD,
    },
  });
}

export async function sendMail(input: SendMailInput) {
  const config = getSmtpConfig();
  const transporter = createTransport();

  const result = await transporter.sendMail({
    from: `"${config.SMTP_FROM_NAME}" <${config.SMTP_FROM_EMAIL}>`,
    replyTo: config.SMTP_REPLY_TO,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments,
  });

  return {
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected,
  };
}

export async function verifySmtp() {
  const transporter = createTransport();
  await transporter.verify();
}
