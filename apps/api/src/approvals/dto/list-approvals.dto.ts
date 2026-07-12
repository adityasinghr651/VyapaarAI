import { IsOptional } from 'class-validator';

export class ListApprovalsDto {
  @IsOptional()
  status?: string;
}
