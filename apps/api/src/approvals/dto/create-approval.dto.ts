import {
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateApprovalDto {
  @IsString()
  @MaxLength(100)
  workflowType: string;

  @IsString()
  @MaxLength(100)
  entityType: string;

  @IsUUID()
  @IsOptional()
  entityId?: string;

  @IsObject()
  payload: Record<string, unknown>;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
