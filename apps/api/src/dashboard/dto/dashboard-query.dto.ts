import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class DashboardQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  @IsOptional()
  months = 12;
}
