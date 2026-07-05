import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  sku?: string;

  @Matches(/^[0-9]{4,8}$/, { message: 'hsnCode must contain 4 to 8 digits' })
  @IsOptional()
  hsnCode?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsOptional()
  gstRate?: number;
}
