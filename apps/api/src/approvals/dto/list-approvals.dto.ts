import { ApprovalStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListApprovalsDto {
  @IsEnum(ApprovalStatus)
  @IsOptional()
  status?: ApprovalStatus;
}
