import { Injectable } from '@nestjs/common';
import { ApprovalStatus, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import {
  ConflictError,
  NotFoundError,
} from '../common/errors/application.errors';
import { PrismaService } from '../database/prisma.service';
import { CreateApprovalDto } from './dto/create-approval.dto';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
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

  async findAll(tenantId: string, status?: ApprovalStatus) {
    await this.expirePending(tenantId);
    return this.prisma.pendingApproval.findMany({
      where: { tenantId, status },
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

  approve(id: string, tenantId: string, actorId: string, note?: string) {
    return this.decide(
      id,
      tenantId,
      actorId,
      ApprovalStatus.APPROVED,
      note,
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
  ) {
    await this.expirePending(tenantId, id);
    return this.prisma.$transaction(async (transaction) => {
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

      const approval = await transaction.pendingApproval.findUniqueOrThrow({
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
      return approval;
    });
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
