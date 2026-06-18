import { IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @IsString({ message: 'productId must be a string' })
  @IsNotEmpty({ message: 'productId is required' })
  productId: string;

  @IsInt({ message: 'quantity must be an integer' })
  @Min(1, { message: 'quantity must be at least 1' })
  quantity: number;
}

export class CreateInvoiceDto {
  @IsString({ message: 'customerId must be a string' })
  @IsNotEmpty({ message: 'customerId is required' })
  customerId: string;

  @IsDateString({}, { message: 'issueDate must be a valid date string' })
  @IsOptional()
  issueDate?: string;

  @IsDateString({}, { message: 'dueDate must be a valid date string' })
  @IsOptional()
  dueDate?: string;

  @IsArray({ message: 'items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
