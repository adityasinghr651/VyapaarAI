import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@Body() dto: CreateInvoiceDto, @CurrentUser('id') userId: string) {
    const data = await this.invoicesService.create(dto, userId);
    return {
      message: 'Invoice created successfully',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.invoicesService.findAll();
    return {
      message: 'Invoices retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.invoicesService.findOne(id);
    return {
      message: 'Invoice retrieved successfully',
      data,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.invoicesService.updateStatus(id, dto, userId);
    return {
      message: 'Invoice status updated successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const data = await this.invoicesService.remove(id, userId);
    return {
      message: 'Invoice deleted successfully',
      data,
    };
  }
}
