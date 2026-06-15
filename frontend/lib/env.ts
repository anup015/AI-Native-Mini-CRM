import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional().default(""),
  AUTH_SECRET: z.string().optional().default("99304a9ef1cde85a6db4983a54b3e8ab"),
  AUTH_URL: z.string().optional().default("http://localhost:3000"),
  GEMINI_API_KEY: z.string().optional().default(""),
  CHANNEL_SERVICE_URL: z.string().optional().default("http://localhost:4001")
});

const parsed = envSchema.safeParse(process.env);

// Fallback to direct process.env lookups if parse fails to avoid breaking middleware
export const env = parsed.success ? parsed.data : {
  DATABASE_URL: process.env.DATABASE_URL || "",
  AUTH_SECRET: process.env.AUTH_SECRET || "99304a9ef1cde85a6db4983a54b3e8ab",
  AUTH_URL: process.env.AUTH_URL || "http://localhost:3000",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  CHANNEL_SERVICE_URL: process.env.CHANNEL_SERVICE_URL || "http://localhost:4001"
};
