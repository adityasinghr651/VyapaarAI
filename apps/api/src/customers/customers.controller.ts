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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Post()
  async create(
    @Body() dto: CreateCustomerDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return {
      message: 'Customer created successfully',
      data: await this.customersService.create(dto, tenantId, actorId),
    };
  }

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return {
      message: 'Customers retrieved successfully',
      data: await this.customersService.findAll(tenantId),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return {
      message: 'Customer retrieved successfully',
      data: await this.customersService.findOne(id, tenantId),
    };
  }

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return {
      message: 'Customer updated successfully',
      data: await this.customersService.update(id, dto, tenantId, actorId),
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
      message: 'Customer deleted successfully',
      data: await this.customersService.remove(id, tenantId, actorId),
    };
  }
}
