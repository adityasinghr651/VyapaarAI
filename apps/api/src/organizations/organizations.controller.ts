import { Body, Controller, Get, Put } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
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
}
