import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto {
  @IsString({ message: 'name must be a string' })
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'phone must be a string' })
  @IsOptional()
  phone?: string;

  @IsString({ message: 'address must be a string' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'gstin must be a string' })
  @IsOptional()
  gstin?: string;
}
