import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
  path: ".env.test",
});

const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string(),
});

const env = envSchema.parse(process.env);

export { env };
