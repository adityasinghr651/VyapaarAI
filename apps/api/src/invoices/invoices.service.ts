import { Injectable } from '@nestjs/common';
import {
  InvoiceStatus,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import {
  BusinessError,
  NotFoundError,
  ValidationError,
} from '../common/errors/application.errors';
import { PrismaService } from '../database/prisma.service';
import {
  CreateInvoiceDto,
  CreateInvoiceItemDto,
} from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  InvoiceCalculationService,
  InvoiceProductInput,
} from './invoice-calculation.service';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

const invoiceInclude = {
  customer: true,
  items: { include: { product: true } },
} satisfies Prisma.InvoiceInclude;

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly calculationService: InvoiceCalculationService,
  ) {}

  async create(dto: CreateInvoiceDto, tenantId: string, actorId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const customer = await this.requireCustomer(
        transaction,
        dto.customerId,
        tenantId,
      );
      const organization = await transaction.organization.findUniqueOrThrow({
        where: { id: tenantId },
        select: { stateCode: true },
      });
      const products = await this.loadProducts(
        transaction,
        dto.items,
        tenantId,
      );
      const calculation = this.calculationService.calculate(
        products,
        organization.stateCode,
        customer.stateCode,
      );
      const invoiceNumber = await this.nextInvoiceNumber(
        transaction,
        tenantId,
        dto.issueDate ? new Date(dto.issueDate) : new Date(),
      );

      const invoice = await transaction.invoice.create({
        data: {
          tenantId,
          invoiceNumber,
          customerId: customer.id,
          issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          notes: dto.notes,
          ...this.financialData(calculation),
          items: {
            create: calculation.items.map((item) => ({ ...item, tenantId })),
          },
        },
        include: invoiceInclude,
      });
      await this.auditService.log(
        {
          tenantId,
          actorId,
          action: 'INVOICE_CREATED',
          entityType: 'Invoice',
          entityId: invoice.id,
          metadata: {
            invoiceNumber: invoice.invoiceNumber,
            total: invoice.total.toString(),
          },
        },
        transaction,
      );
      return invoice;
    });
  }

  findAll(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId, deletedAt: null },
      include: invoiceInclude,
      orderBy: { issueDate: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: invoiceInclude,
    });
    if (!invoice) {
      throw new NotFoundError('Invoice');
    }
    return invoice;
  }

  async update(
    id: string,
    dto: UpdateInvoiceDto,
    tenantId: string,
    actorId: string,
  ) {
    const existing = await this.findOne(id, tenantId);
    if (existing.status !== InvoiceStatus.DRAFT) {
      throw new BusinessError('Only draft invoices can be edited');
    }

    return this.prisma.$transaction(async (transaction) => {
      const customerId = dto.customerId ?? existing.customerId;
      const customer = await this.requireCustomer(
        transaction,
        customerId,
        tenantId,
      );
      const organization = await transaction.organization.findUniqueOrThrow({
        where: { id: tenantId },
        select: { stateCode: true },
      });
      const itemInputs =
        dto.items ??
        existing.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));
      const products = await this.loadProducts(
        transaction,
        itemInputs,
        tenantId,
      );
      const calculation = this.calculationService.calculate(
        products,
        organization.stateCode,
        customer.stateCode,
      );

      await transaction.invoiceItem.deleteMany({
        where: { invoiceId: id, tenantId },
      });
      const invoice = await transaction.invoice.update({
        where: { id },
        data: {
          customerId,
          issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          notes: dto.notes,
          pdfStorageKey: null,
          pdfChecksum: null,
          pdfGeneratedAt: null,
          ...this.financialData(calculation),
          items: {
            create: calculation.items.map((item) => ({ ...item, tenantId })),
          },
        },
        include: invoiceInclude,
      });
      await this.auditService.log(
        {
          tenantId,
          actorId,
          action: 'INVOICE_UPDATED',
          entityType: 'Invoice',
          entityId: id,
          metadata: { changedFields: Object.keys(dto) },
        },
        transaction,
      );
      return invoice;
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateInvoiceStatusDto,
    tenantId: string,
    actorId: string,
  ) {
    const existing = await this.findOne(id, tenantId);
    if (
      existing.status === InvoiceStatus.CANCELLED &&
      dto.status !== InvoiceStatus.CANCELLED
    ) {
      throw new BusinessError('Cancelled invoices cannot be reopened');
    }

    return this.prisma.$transaction(async (transaction) => {
      const invoice = await transaction.invoice.update({
        where: { id },
        data: { status: dto.status },
        include: invoiceInclude,
      });
      await this.auditService.log(
        {
          tenantId,
          actorId,
          action: 'INVOICE_STATUS_UPDATED',
          entityType: 'Invoice',
          entityId: id,
          metadata: { from: existing.status, to: dto.status },
        },
        transaction,
      );
      return invoice;
    });
  }

  async remove(id: string, tenantId: string, actorId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.$transaction(async (transaction) => {
      const invoice = await transaction.invoice.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      await this.auditService.log(
        {
          tenantId,
          actorId,
          action: 'INVOICE_DELETED',
          entityType: 'Invoice',
          entityId: id,
          metadata: {},
        },
        transaction,
      );
      return invoice;
    });
  }

  private async requireCustomer(
    transaction: TransactionClient,
    customerId: string,
    tenantId: string,
  ) {
    const customer = await transaction.customer.findFirst({
      where: { id: customerId, tenantId, deletedAt: null },
    });
    if (!customer) {
      throw new NotFoundError('Customer');
    }
    return customer;
  }

  private async loadProducts(
    transaction: TransactionClient,
    items: CreateInvoiceItemDto[],
    tenantId: string,
  ): Promise<InvoiceProductInput[]> {
    const productIds = [...new Set(items.map((item) => item.productId))];
    if (productIds.length !== items.length) {
      throw new ValidationError('Invoice items cannot contain duplicate products');
    }
    const products = await transaction.product.findMany({
      where: { id: { in: productIds }, tenantId, deletedAt: null },
    });
    if (products.length !== productIds.length) {
      throw new NotFoundError('Product');
    }
    const quantities = new Map(
      items.map((item) => [item.productId, item.quantity]),
    );
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      hsnCode: product.hsnCode,
      price: product.price,
      gstRate: product.gstRate,
      quantity: quantities.get(product.id) ?? 0,
    }));
  }

  private async nextInvoiceNumber(
    transaction: TransactionClient,
    tenantId: string,
    issueDate: Date,
  ): Promise<string> {
    const year = issueDate.getUTCFullYear();
    const sequence = await transaction.invoiceSequence.upsert({
      where: { tenantId_year: { tenantId, year } },
      update: { sequence: { increment: 1 } },
      create: { tenantId, year, sequence: 1 },
    });
    return `INV-${year}-${sequence.sequence.toString().padStart(4, '0')}`;
  }

  private financialData(
    calculation: ReturnType<InvoiceCalculationService['calculate']>,
  ) {
    return {
      subtotal: calculation.subtotal,
      gstAmount: calculation.gstAmount,
      cgstAmount: calculation.cgstAmount,
      sgstAmount: calculation.sgstAmount,
      igstAmount: calculation.igstAmount,
      total: calculation.total,
      taxType: calculation.taxType,
    };
  }
}
