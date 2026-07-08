import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DecisionDto {
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  note?: string;
}
