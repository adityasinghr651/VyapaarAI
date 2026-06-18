import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateCustomerDto, actorId: string) {
    const customer = await this.prisma.client.customer.create({
      data: dto,
    });

    await this.auditService.log('CUSTOMER_CREATION', actorId, {
      customerId: customer.id,
      name: customer.name,
    });

    return customer;
  }

  async findAll() {
    return this.prisma.client.customer.findMany();
  }

  async findOne(id: string) {
    const customer = await this.prisma.client.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto, actorId: string) {
    await this.findOne(id);

    const customer = await this.prisma.client.customer.update({
      where: { id },
      data: dto,
    });

    await this.auditService.log('CUSTOMER_UPDATE', actorId, {
      customerId: customer.id,
      changes: dto,
    });

    return customer;
  }

  async remove(id: string, actorId: string) {
    await this.findOne(id);

    const customer = await this.prisma.client.customer.delete({
      where: { id },
    });

    await this.auditService.log('CUSTOMER_DELETION', actorId, {
      customerId: id,
    });

    return customer;
  }
}
