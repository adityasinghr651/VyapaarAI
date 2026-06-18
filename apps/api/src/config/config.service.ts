import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string URL'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type EnvConfig = z.infer<typeof envSchema>;

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private readonly config: EnvConfig;

  constructor() {
    // Load env variables
    dotenv.config();

    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      this.logger.error('❌ Invalid Environment Configuration:');
      result.error.errors.forEach((err) => {
        this.logger.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }

    this.config = result.data;
  }

  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }
}
