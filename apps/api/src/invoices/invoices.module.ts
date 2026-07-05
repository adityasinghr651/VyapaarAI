import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { AuthModule } from '../auth/auth.module';
import { InvoiceCalculationService } from './invoice-calculation.service';
import { InvoicePdfController } from './invoice-pdf.controller';
import { InvoicePdfService } from './invoice-pdf.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [InvoicePdfController, InvoicesController],
  providers: [InvoicesService, InvoiceCalculationService, InvoicePdfService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
