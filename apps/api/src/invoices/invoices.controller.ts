import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Post()
  async create(
    @Body() dto: CreateInvoiceDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return {
      message: 'Invoice created successfully',
      data: await this.invoicesService.create(dto, tenantId, actorId),
    };
  }

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return {
      message: 'Invoices retrieved successfully',
      data: await this.invoicesService.findAll(tenantId),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return {
      message: 'Invoice retrieved successfully',
      data: await this.invoicesService.findOne(id, tenantId),
    };
  }

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return {
      message: 'Invoice updated successfully',
      data: await this.invoicesService.update(id, dto, tenantId, actorId),
    };
  }

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceStatusDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return {
      message: 'Invoice status updated successfully',
      data: await this.invoicesService.updateStatus(
        id,
        dto,
        tenantId,
        actorId,
      ),
    };
  }

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return {
      message: 'Invoice deleted successfully',
      data: await this.invoicesService.remove(id, tenantId, actorId),
    };
  }
}
