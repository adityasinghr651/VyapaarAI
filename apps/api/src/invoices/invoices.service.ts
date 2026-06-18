import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { AuditService } from '../audit/audit.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateInvoiceDto, actorId: string) {
    // 1. Verify customer exists
    const customer = await this.prisma.client.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Invoice must contain at least one item');
    }

    // 2. Load product details and calculate financial totals in a safe database transaction
    return this.prisma.client.$transaction(async (tx: any) => {
      let overallSubtotal = new Decimal(0);
      let overallGstAmount = new Decimal(0);
      let overallTotal = new Decimal(0);
      
      const invoiceItemsData: any[] = [];

      for (const itemDto of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: itemDto.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${itemDto.productId} not found`);
        }

        const price = new Decimal(product.price);
        const gstRate = new Decimal(product.gstRate);
        const qty = new Decimal(itemDto.quantity);

        const itemSubtotal = price.mul(qty);
        const itemGstAmount = itemSubtotal.mul(gstRate.div(100));
        const itemTotal = itemSubtotal.add(itemGstAmount);

        overallSubtotal = overallSubtotal.add(itemSubtotal);
        overallGstAmount = overallGstAmount.add(itemGstAmount);
        overallTotal = overallTotal.add(itemTotal);

        invoiceItemsData.push({
          productId: product.id,
          quantity: itemDto.quantity,
          price,
          gstRate,
          gstAmount: itemGstAmount,
          total: itemTotal,
        });
      }

      // 3. Generate sequential invoice number atomically
      const currentYear = new Date().getFullYear();
      const seq = await tx.invoiceSequence.upsert({
        where: { year: currentYear },
        update: { sequence: { increment: 1 } },
        create: { year: currentYear, sequence: 1 },
      });

      const invoiceNumber = `INV-${currentYear}-${seq.sequence.toString().padStart(4, '0')}`;

      // 4. Save Invoice and Line Items
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: customer.id,
          issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          subtotal: overallSubtotal,
          gstAmount: overallGstAmount,
          total: overallTotal,
          status: 'DRAFT',
          items: {
            create: invoiceItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });

      // 5. Track in audit logs
      await this.auditService.log('INVOICE_CREATION', actorId, {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total.toString(),
      });

      return invoice;
    });
  }

  async findAll() {
    return this.prisma.client.invoice.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.client.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateStatus(id: string, dto: UpdateInvoiceStatusDto, actorId: string) {
    await this.findOne(id);

    const invoice = await this.prisma.client.invoice.update({
      where: { id },
      data: { status: dto.status },
      include: {
        customer: true,
        items: true,
      },
    });

    await this.auditService.log('INVOICE_UPDATE', actorId, {
      invoiceId: invoice.id,
      status: invoice.status,
    });

    return invoice;
  }

  async remove(id: string, actorId: string) {
    await this.findOne(id);

    const invoice = await this.prisma.client.invoice.delete({
      where: { id },
    });

    await this.auditService.log('INVOICE_DELETION', actorId, {
      invoiceId: id,
    });

    return invoice;
  }
}
