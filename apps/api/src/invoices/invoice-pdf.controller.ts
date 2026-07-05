import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { InvoicePdfService } from './invoice-pdf.service';

@Controller('invoices')
export class InvoicePdfController {
  constructor(private readonly invoicePdfService: InvoicePdfService) {}

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Post(':id/pdf')
  async generate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return {
      message: 'Invoice PDF generated successfully',
      data: await this.invoicePdfService.generate(id, tenantId, actorId),
    };
  }

  @Get(':id/pdf')
  async get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const pdf = await this.invoicePdfService.get(id, tenantId);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `inline; filename="${id}.pdf"`);
    return new StreamableFile(pdf);
  }
}
