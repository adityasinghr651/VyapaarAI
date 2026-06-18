import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Body() dto: CreateCustomerDto, @CurrentUser('id') userId: string) {
    const data = await this.customersService.create(dto, userId);
    return {
      message: 'Customer created successfully',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.customersService.findAll();
    return {
      message: 'Customers retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.customersService.findOne(id);
    return {
      message: 'Customer retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.customersService.update(id, dto, userId);
    return {
      message: 'Customer updated successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const data = await this.customersService.remove(id, userId);
    return {
      message: 'Customer deleted successfully',
      data,
    };
  }
}
