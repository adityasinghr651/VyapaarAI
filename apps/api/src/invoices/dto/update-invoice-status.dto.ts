import { IsEnum, IsNotEmpty } from 'class-validator';
import { InvoiceStatus } from '@vyapaarai/shared-types';

export class UpdateInvoiceStatusDto {
  @IsEnum(InvoiceStatus, { message: 'status must be DRAFT, SENT, PAID, OVERDUE, or CANCELLED' })
  @IsNotEmpty({ message: 'status is required' })
  status: InvoiceStatus;
}
