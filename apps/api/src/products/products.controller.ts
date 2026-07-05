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
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return {
      message: 'Product created successfully',
      data: await this.productsService.create(dto, tenantId, actorId),
    };
  }

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return {
      message: 'Products retrieved successfully',
      data: await this.productsService.findAll(tenantId),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return {
      message: 'Product retrieved successfully',
      data: await this.productsService.findOne(id, tenantId),
    };
  }

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return {
      message: 'Product updated successfully',
      data: await this.productsService.update(id, dto, tenantId, actorId),
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
      message: 'Product deleted successfully',
      data: await this.productsService.remove(id, tenantId, actorId),
    };
  }
}
