import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuditService } from '../audit/audit.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateProductDto, actorId: string) {
    const product = await this.prisma.client.product.create({
      data: {
        ...dto,
        price: new Decimal(dto.price),
        gstRate: new Decimal(dto.gstRate !== undefined ? dto.gstRate : 18.0),
      },
    });

    await this.auditService.log('PRODUCT_CREATION', actorId, {
      productId: product.id,
      name: product.name,
      price: product.price.toString(),
    });

    return product;
  }

  async findAll() {
    return this.prisma.client.product.findMany();
  }

  async findOne(id: string) {
    const product = await this.prisma.client.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto, actorId: string) {
    await this.findOne(id);

    const updateData: any = { ...dto };
    if (dto.price !== undefined) {
      updateData.price = new Decimal(dto.price);
    }
    if (dto.gstRate !== undefined) {
      updateData.gstRate = new Decimal(dto.gstRate);
    }

    const product = await this.prisma.client.product.update({
      where: { id },
      data: updateData,
    });

    await this.auditService.log('PRODUCT_UPDATE', actorId, {
      productId: product.id,
      changes: dto,
    });

    return product;
  }

  async remove(id: string, actorId: string) {
    await this.findOne(id);

    const product = await this.prisma.client.product.delete({
      where: { id },
    });

    await this.auditService.log('PRODUCT_DELETION', actorId, {
      productId: id,
    });

    return product;
  }
}
