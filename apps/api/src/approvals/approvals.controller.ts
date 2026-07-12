import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { DecisionDto } from './dto/decision.dto';
import { ListApprovalsDto } from './dto/list-approvals.dto';

@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  async create(
    @Body() dto: CreateApprovalDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return {
      message: 'Approval requested successfully',
      data: await this.approvalsService.create(dto, tenantId, actorId),
    };
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: ListApprovalsDto,
  ) {
    return {
      message: 'Approvals retrieved successfully',
      data: await this.approvalsService.findAll(tenantId, query.status),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return {
      message: 'Approval retrieved successfully',
      data: await this.approvalsService.findOne(id, tenantId),
    };
  }

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Post(':id/approve')
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecisionDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return {
      message: 'Approval approved successfully',
      data: await this.approvalsService.approve(
        id,
        tenantId,
        actorId,
        dto.note,
        dto.payload,
      ),
    };
  }

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Post(':id/reject')
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecisionDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return {
      message: 'Approval rejected successfully',
      data: await this.approvalsService.reject(
        id,
        tenantId,
        actorId,
        dto.note,
      ),
    };
  }
}
