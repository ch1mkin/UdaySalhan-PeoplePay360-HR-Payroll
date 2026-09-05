import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("PeoplePay360"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

const smtpSchema = z.object({
  SMTP_HOST: z.string().default("smtp.hostinger.com"),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM_NAME: z.string().default("PeoplePay360"),
  SMTP_FROM_EMAIL: z.string().email(),
  SMTP_REPLY_TO: z.string().email().optional().or(z.literal("").transform(() => undefined)),
});

export function getPublicEnv() {
  return publicSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return Boolean(url && key && !url.includes("YOUR_PROJECT") && !key.includes("your_supabase"));
}

export function getSmtpConfig() {
  return smtpSchema.parse({
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
    SMTP_REPLY_TO: process.env.SMTP_REPLY_TO,
  });
}

export type SmtpConfig = z.infer<typeof smtpSchema>;
