import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { InvoicesModule } from '../invoices/invoices.module';
import { ApprovalsModule } from '../approvals/approvals.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AuthModule, InvoicesModule, ApprovalsModule, AiModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
})
export class WhatsAppModule {}

