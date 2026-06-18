import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateProductDto {
  @IsString({ message: 'name must be a string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'description must be a string' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'sku must be a string' })
  @IsOptional()
  sku?: string;

  @IsNumber({}, { message: 'price must be a number' })
  @Min(0, { message: 'price must be greater than or equal to 0' })
  @IsOptional()
  price?: number;

  @IsNumber({}, { message: 'gstRate must be a number' })
  @IsOptional()
  gstRate?: number;
}
