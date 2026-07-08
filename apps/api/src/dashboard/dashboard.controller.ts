import { Controller, Get, Query } from '@nestjs/common';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async summary(@CurrentTenant() tenantId: string) {
    return {
      message: 'Dashboard summary retrieved successfully',
      data: await this.dashboardService.summary(tenantId),
    };
  }

  @Get('monthly-revenue')
  async monthlyRevenue(
    @CurrentTenant() tenantId: string,
    @Query() query: DashboardQueryDto,
  ) {
    return {
      message: 'Monthly revenue retrieved successfully',
      data: await this.dashboardService.monthlyRevenue(tenantId, query.months),
    };
  }

  @Get('recent-invoices')
  async recentInvoices(@CurrentTenant() tenantId: string) {
    return {
      message: 'Recent invoices retrieved successfully',
      data: await this.dashboardService.recentInvoices(tenantId),
    };
  }
}
