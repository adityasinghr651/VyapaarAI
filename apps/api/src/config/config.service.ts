import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .default(
      'postgresql://postgres:postgrespassword@localhost:5432/vyapaarai_dev?schema=public',
    ),
  DIRECT_URL: z.string().min(1).optional(),
  JWT_SECRET: z
    .string()
    .min(32)
    .default('super-secret-development-key-change-in-production-12345678'),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PDF_STORAGE_PATH: z.string().default('storage/invoices'),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_APP_SECRET: z.string().optional(),
  WHATSAPP_SESSION_TTL_MINUTES: z.coerce.number().int().positive().default(1440),
  AI_PROVIDER: z.enum(['gemini', 'openai']).default('gemini'),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  AI_MIN_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.90),
});

export type EnvConfig = z.infer<typeof envSchema>;

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private readonly config: EnvConfig;

  constructor() {
    const apiRoot = process.cwd();
    const monorepoRoot = path.resolve(apiRoot, '../..');
    for (const envPath of [
      path.join(monorepoRoot, '.env.local'),
      path.join(monorepoRoot, '.env'),
      path.join(apiRoot, '.env'),
    ]) {
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
      }
    }

    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      for (const error of result.error.errors) {
        this.logger.error(`${error.path.join('.')}: ${error.message}`);
      }
      throw new Error('Invalid environment configuration');
    }
    this.config = result.data;
  }

  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }
}
