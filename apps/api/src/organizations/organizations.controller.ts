import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Get('current')
  async getCurrent(@CurrentTenant() tenantId: string) {
    return {
      message: 'Organization details retrieved successfully',
      data: await this.organizationsService.getCurrent(tenantId),
    };
  }

  @Roles(Role.OWNER)
  @Put('current')
  async updateCurrent(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return {
      message: 'Organization profile updated successfully',
      data: await this.organizationsService.updateCurrent(tenantId, dto),
    };
  }

  @Roles(Role.OWNER, Role.ACCOUNTANT)
  @Get('current/users')
  async getUsers(@CurrentTenant() tenantId: string) {
    return {
      message: 'Team members retrieved successfully',
      data: await this.organizationsService.getUsers(tenantId),
    };
  }

  @Roles(Role.OWNER)
  @Post('current/users')
  async inviteUser(
    @CurrentTenant() tenantId: string,
    @Body() dto: InviteUserDto,
  ) {
    return {
      message: 'User invited successfully',
      data: await this.organizationsService.inviteUser(tenantId, dto),
    };
  }

  @Roles(Role.OWNER)
  @Put('current/users/:userId/role')
  async updateUserRole(
    @CurrentTenant() tenantId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return {
      message: 'User role updated successfully',
      data: await this.organizationsService.updateUserRole(
        tenantId,
        userId,
        dto,
      ),
    };
  }
}
