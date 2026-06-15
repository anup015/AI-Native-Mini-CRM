import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4001),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid channel-service env: ${parsed.error.message}`);
}

export const env = parsed.data;
