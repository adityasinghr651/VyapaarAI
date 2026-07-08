import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { NotFoundError } from '../common/errors/application.errors';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateCustomerDto, tenantId: string, actorId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const customer = await transaction.customer.create({
        data: {
          ...dto,
          tenantId,
          gstin: dto.gstin?.toUpperCase(),
        },
      });
      await this.auditService.log(
        {
          tenantId,
          actorId,
          action: 'CUSTOMER_CREATED',
          entityType: 'Customer',
          entityId: customer.id,
          metadata: { name: customer.name },
        },
        transaction,
      );
      return customer;
    });
  }

  findAll(tenantId: string) {
    return this.prisma.customer.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!customer) {
      throw new NotFoundError('Customer');
    }
    return customer;
  }

  async update(
    id: string,
    dto: UpdateCustomerDto,
    tenantId: string,
    actorId: string,
  ) {
    await this.findOne(id, tenantId);
    return this.prisma.$transaction(async (transaction) => {
      const customer = await transaction.customer.update({
        where: { id },
        data: { ...dto, gstin: dto.gstin?.toUpperCase() },
      });
      await this.auditService.log(
        {
          tenantId,
          actorId,
          action: 'CUSTOMER_UPDATED',
          entityType: 'Customer',
          entityId: id,
          metadata: { changedFields: Object.keys(dto) },
        },
        transaction,
      );
      return customer;
    });
  }

  async remove(id: string, tenantId: string, actorId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.$transaction(async (transaction) => {
      const customer = await transaction.customer.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      await this.auditService.log(
        {
          tenantId,
          actorId,
          action: 'CUSTOMER_DELETED',
          entityType: 'Customer',
          entityId: id,
          metadata: {},
        },
        transaction,
      );
      return customer;
    });
  }
}
