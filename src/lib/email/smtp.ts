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
    cid?: string;
  }[];
};

function transportOptions(port: number, secure: boolean) {
  const config = getSmtpConfig();
  return {
    host: config.SMTP_HOST,
    port,
    secure,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASSWORD,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
    family: 4 as const,
    tls: {
      servername: config.SMTP_HOST,
      minVersion: "TLSv1.2" as const,
    },
  };
}

async function sendWithTransport(port: number, secure: boolean, input: SendMailInput) {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport(transportOptions(port, secure));
  return transporter.sendMail({
    from: `"${config.SMTP_FROM_NAME}" <${config.SMTP_FROM_EMAIL || config.SMTP_USER}>`,
    sender: config.SMTP_USER,
    replyTo: config.SMTP_REPLY_TO,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments,
  });
}

export async function sendMail(input: SendMailInput) {
  const config = getSmtpConfig();
  const preferredPort = config.SMTP_PORT;
  const preferredSecure = config.SMTP_SECURE || preferredPort === 465;
  const attempts = [
    { port: preferredPort, secure: preferredSecure },
    { port: 587, secure: false },
    { port: 465, secure: true },
  ].filter(
    (attempt, index, list) =>
      list.findIndex((item) => item.port === attempt.port && item.secure === attempt.secure) === index,
  );

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      const result = await sendWithTransport(attempt.port, attempt.secure, input);
      return {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Could not send mail through Hostinger SMTP.");
}

export async function verifySmtp() {
  const config = getSmtpConfig();
  const preferredPort = config.SMTP_PORT;
  const preferredSecure = config.SMTP_SECURE || preferredPort === 465;
  const attempts = [
    { port: preferredPort, secure: preferredSecure },
    { port: 587, secure: false },
    { port: 465, secure: true },
  ].filter(
    (attempt, index, list) =>
      list.findIndex((item) => item.port === attempt.port && item.secure === attempt.secure) === index,
  );

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      const transporter = nodemailer.createTransport(transportOptions(attempt.port, attempt.secure));
      await transporter.verify();
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Could not connect to Hostinger SMTP.");
}

export function getSmtpPublicStatus() {
  try {
    const config = getSmtpConfig();
    return {
      configured: true as const,
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      from: config.SMTP_FROM_EMAIL,
      secure: config.SMTP_SECURE || config.SMTP_PORT === 465,
    };
  } catch {
    return { configured: false as const, host: null, port: null, from: null, secure: null };
  }
}
