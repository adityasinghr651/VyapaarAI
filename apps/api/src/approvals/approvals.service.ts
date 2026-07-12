import { Injectable, Logger } from '@nestjs/common';
import { ApprovalStatus, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import {
  ConflictError,
  NotFoundError,
} from '../common/errors/application.errors';
import { PrismaService } from '../database/prisma.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async create(dto: CreateApprovalDto, tenantId: string, actorId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const approval = await transaction.pendingApproval.create({
        data: {
          tenantId,
          requestedById: actorId,
          workflowType: dto.workflowType,
          entityType: dto.entityType,
          entityId: dto.entityId,
          payload: dto.payload as Prisma.InputJsonValue,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        },
      });
      await this.auditService.log(
        {
          tenantId,
          actorId,
          action: 'APPROVAL_REQUESTED',
          entityType: 'PendingApproval',
          entityId: approval.id,
          metadata: {
            workflowType: approval.workflowType,
            targetEntityType: approval.entityType,
            targetEntityId: approval.entityId,
          },
        },
        transaction,
      );
      return approval;
    });
  }

  async findAll(tenantId: string, status?: string | ApprovalStatus) {
    await this.expirePending(tenantId);
    let statusFilter: Prisma.EnumApprovalStatusFilter | ApprovalStatus | undefined;
    if (status) {
      if (typeof status === 'string' && status.includes(',')) {
        const statuses = status
          .split(',')
          .map((s) => s.trim() as ApprovalStatus)
          .filter((s) => Object.values(ApprovalStatus).includes(s));
        if (statuses.length > 0) {
          statusFilter = { in: statuses };
        }
      } else {
        const s = typeof status === 'string' ? status.trim() : status;
        if (Object.values(ApprovalStatus).includes(s as ApprovalStatus)) {
          statusFilter = s as ApprovalStatus;
        }
      }
    }
    return this.prisma.pendingApproval.findMany({
      where: { tenantId, status: statusFilter },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        decidedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    await this.expirePending(tenantId, id);
    const approval = await this.prisma.pendingApproval.findFirst({
      where: { id, tenantId },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        decidedBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!approval) {
      throw new NotFoundError('Approval');
    }
    return approval;
  }

  approve(
    id: string,
    tenantId: string,
    actorId: string,
    note?: string,
    payload?: Record<string, any>,
  ) {
    return this.decide(
      id,
      tenantId,
      actorId,
      ApprovalStatus.APPROVED,
      note,
      payload,
    );
  }

  reject(id: string, tenantId: string, actorId: string, note?: string) {
    return this.decide(
      id,
      tenantId,
      actorId,
      ApprovalStatus.REJECTED,
      note,
    );
  }

  private async decide(
    id: string,
    tenantId: string,
    actorId: string,
    status: ApprovalStatus,
    note?: string,
    payloadUpdate?: Record<string, any>,
  ) {
    await this.expirePending(tenantId, id);
    const approval = await this.prisma.$transaction(async (transaction) => {
      const result = await transaction.pendingApproval.updateMany({
        where: { id, tenantId, status: ApprovalStatus.PENDING },
        data: {
          status,
          decidedById: actorId,
          decisionNote: note,
          decidedAt: new Date(),
        },
      });
      if (result.count !== 1) {
        const exists = await transaction.pendingApproval.findFirst({
          where: { id, tenantId },
          select: { id: true },
        });
        if (!exists) {
          throw new NotFoundError('Approval');
        }
        throw new ConflictError('Approval is no longer pending');
      }

      const app = await transaction.pendingApproval.findUniqueOrThrow({
        where: { id },
      });
      await this.auditService.log(
        {
          tenantId,
          actorId,
          action: `APPROVAL_${status}`,
          entityType: 'PendingApproval',
          entityId: id,
          metadata: { note: note ?? null },
        },
        transaction,
      );
      return app;
    });

    if (status === ApprovalStatus.APPROVED && approval.workflowType === 'WHATSAPP_INVOICE_PARSING') {
      const finalPayload = {
        ...(approval.payload as Record<string, any>),
        ...(payloadUpdate || {}),
      };
      await this.executeInvoiceCreation(tenantId, actorId, finalPayload);
    }

    return approval;
  }

  private async executeInvoiceCreation(
    tenantId: string,
    actorId: string,
    payload: Record<string, any>,
  ): Promise<void> {
    try {
      // 1. Resolve Customer ID
      const customerName = payload.customerName || payload.customer?.name || 'WhatsApp Customer';
      const customerPhone = payload.customer?.phone || null;
      const customerGstin = payload.customer?.gstin || null;

      let dbCustomer = await this.prisma.customer.findFirst({
        where: { tenantId, name: { equals: customerName, mode: 'insensitive' }, deletedAt: null },
      });

      if (!dbCustomer) {
        dbCustomer = await this.prisma.customer.create({
          data: {
            tenantId,
            name: customerName,
            phone: customerPhone,
            gstin: customerGstin,
          },
        });
        await this.auditService.log({
          tenantId,
          actorId,
          action: 'CUSTOMER_CREATION',
          entityType: 'Customer',
          entityId: dbCustomer.id,
          metadata: { note: 'Auto-created during WhatsApp invoice approval flow' },
        });
      }

      // 2. Resolve Items and Product IDs
      const itemsToCreate: { productId: string; quantity: number }[] = [];
      const parsedItems = payload.items || [
        {
          productName: payload.product || 'General Service',
          quantity: payload.quantity || 1,
          price: null,
        },
      ];

      for (const item of parsedItems) {
        let dbProduct = await this.prisma.product.findFirst({
          where: { tenantId, name: { equals: item.productName, mode: 'insensitive' }, deletedAt: null },
        });

        if (!dbProduct) {
          const rate = item.price || 0;
          dbProduct = await this.prisma.product.create({
            data: {
              tenantId,
              name: item.productName,
              price: new Prisma.Decimal(rate),
              gstRate: new Prisma.Decimal(payload.gstRate || 18),
            },
          });
          await this.auditService.log({
            tenantId,
            actorId,
            action: 'PRODUCT_CREATION',
            entityType: 'Product',
            entityId: dbProduct.id,
            metadata: { note: 'Auto-created during WhatsApp invoice approval flow' },
          });
        }
        itemsToCreate.push({
          productId: dbProduct.id,
          quantity: item.quantity,
        });
      }

      // 3. Create Invoice via InvoicesService to leverage pdf/sequence generation
      await this.invoicesService.create(
        {
          customerId: dbCustomer.id,
          notes: 'Generated from WhatsApp conversation extraction',
          items: itemsToCreate,
        },
        tenantId,
        actorId,
      );
    } catch (error) {
      this.logger.error('Failed to auto-create invoice on approval sign-off', error);
      throw error;
    }
  }

  private async expirePending(tenantId: string, id?: string): Promise<void> {
    await this.prisma.pendingApproval.updateMany({
      where: {
        tenantId,
        id,
        status: ApprovalStatus.PENDING,
        expiresAt: { lte: new Date() },
      },
      data: { status: ApprovalStatus.EXPIRED },
    });
  }
}
