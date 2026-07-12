import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '../config/config.module';
import { AiService } from './ai.service';
import { AiParserService } from './ai-parser.service';

@Module({
  imports: [DatabaseModule, ConfigModule],
  providers: [AiService, AiParserService],
  exports: [AiParserService],
})
export class AiModule {}
