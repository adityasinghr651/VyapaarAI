import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigService } from '../config/config.service';
import { NotFoundError } from '../common/errors/application.errors';

@Injectable()
export class StorageService {
  private readonly rootPath: string;

  constructor(config: ConfigService) {
    this.rootPath = path.resolve(process.cwd(), config.get('PDF_STORAGE_PATH'));
  }

  async put(key: string, data: Buffer): Promise<void> {
    const filePath = this.resolveKey(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
  }

  async get(key: string): Promise<Buffer> {
    try {
      return await fs.readFile(this.resolveKey(key));
    } catch (error: unknown) {
      if (this.isMissingFile(error)) {
        throw new NotFoundError('Invoice PDF');
      }
      throw error;
    }
  }

  private resolveKey(key: string): string {
    const filePath = path.resolve(this.rootPath, key);
    if (!filePath.startsWith(`${this.rootPath}${path.sep}`)) {
      throw new Error('Invalid storage key');
    }
    return filePath;
  }

  private isMissingFile(error: unknown): error is NodeJS.ErrnoException {
    return (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    );
  }
}
