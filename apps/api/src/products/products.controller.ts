import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() dto: CreateProductDto, @CurrentUser('id') userId: string) {
    const data = await this.productsService.create(dto, userId);
    return {
      message: 'Product created successfully',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.productsService.findAll();
    return {
      message: 'Products retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.productsService.findOne(id);
    return {
      message: 'Product retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.productsService.update(id, dto, userId);
    return {
      message: 'Product updated successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const data = await this.productsService.remove(id, userId);
    return {
      message: 'Product deleted successfully',
      data,
    };
  }
}
