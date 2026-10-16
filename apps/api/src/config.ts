import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("3001"),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z
    .string()
    .default("postgres://fomo_user:fomo_secret@localhost:5432/campus_fomo"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters")
    .default("dev_jwt_access_secret_must_be_at_least_32_characters_long!"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters")
    .default("dev_jwt_refresh_secret_must_be_at_least_32_characters_long!"),
  COOKIE_SECRET: z
    .string()
    .min(32, "COOKIE_SECRET must be at least 32 characters")
    .default("dev_cookie_signing_secret_key_at_least_32_bytes_long!"),
  APP_ORIGIN: z.string().default("http://localhost:5173"),
  SMS_PROVIDER: z.enum(["dev", "tw", "msg91"]).default("dev"),
  EMAIL_PROVIDER: z
    .enum(["mailpit", "resend", "brevo", "smtp"])
    .default("mailpit"),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export const config = EnvSchema.parse(process.env);
