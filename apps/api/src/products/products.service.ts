import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import {
  ConflictError,
  NotFoundError,
} from '../common/errors/application.errors';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateProductDto, tenantId: string, actorId: string) {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const product = await transaction.product.create({
          data: {
            ...dto,
            tenantId,
            price: new Prisma.Decimal(dto.price),
            gstRate: new Prisma.Decimal(dto.gstRate ?? 18),
          },
        });
        await this.auditService.log(
          {
            tenantId,
            actorId,
            action: 'PRODUCT_CREATED',
            entityType: 'Product',
            entityId: product.id,
            metadata: { name: product.name, sku: product.sku },
          },
          transaction,
        );
        return product;
      });
    } catch (error: unknown) {
      this.handleUniqueConstraint(error);
    }
  }

  findAll(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    tenantId: string,
    actorId: string,
  ) {
    await this.findOne(id, tenantId);
    const data: Prisma.ProductUpdateInput = {
      name: dto.name,
      description: dto.description,
      sku: dto.sku,
      hsnCode: dto.hsnCode,
      price:
        dto.price === undefined ? undefined : new Prisma.Decimal(dto.price),
      gstRate:
        dto.gstRate === undefined
          ? undefined
          : new Prisma.Decimal(dto.gstRate),
    };

    try {
      return await this.prisma.$transaction(async (transaction) => {
        const product = await transaction.product.update({
          where: { id },
          data,
        });
        await this.auditService.log(
          {
            tenantId,
            actorId,
            action: 'PRODUCT_UPDATED',
            entityType: 'Product',
            entityId: id,
            metadata: { changedFields: Object.keys(dto) },
          },
          transaction,
        );
        return product;
      });
    } catch (error: unknown) {
      this.handleUniqueConstraint(error);
    }
  }

  async remove(id: string, tenantId: string, actorId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.$transaction(async (transaction) => {
      const product = await transaction.product.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      await this.auditService.log(
        {
          tenantId,
          actorId,
          action: 'PRODUCT_DELETED',
          entityType: 'Product',
          entityId: id,
          metadata: {},
        },
        transaction,
      );
      return product;
    });
  }

  private handleUniqueConstraint(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictError('SKU already exists for this tenant');
    }
    throw error;
  }
}
