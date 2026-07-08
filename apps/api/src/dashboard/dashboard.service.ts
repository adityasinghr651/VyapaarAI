import { Injectable } from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(tenantId: string) {
    const activeWhere = {
      tenantId,
      deletedAt: null,
    };
    const [
      revenue,
      gst,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      customerCount,
      productCount,
    ] = await this.prisma.$transaction([
      this.prisma.invoice.aggregate({
        where: { ...activeWhere, status: InvoiceStatus.PAID },
        _sum: { total: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...activeWhere, status: InvoiceStatus.PAID },
        _sum: { gstAmount: true },
      }),
      this.prisma.invoice.count({ where: activeWhere }),
      this.prisma.invoice.count({
        where: { ...activeWhere, status: InvoiceStatus.PAID },
      }),
      this.prisma.invoice.count({
        where: {
          ...activeWhere,
          status: {
            in: [
              InvoiceStatus.DRAFT,
              InvoiceStatus.SENT,
              InvoiceStatus.OVERDUE,
            ],
          },
        },
      }),
      this.prisma.customer.count({ where: activeWhere }),
      this.prisma.product.count({ where: activeWhere }),
    ]);

    return {
      revenue: revenue._sum.total?.toFixed(2) ?? '0.00',
      gstCollected: gst._sum.gstAmount?.toFixed(2) ?? '0.00',
      invoiceCounts: {
        total: totalInvoices,
        paid: paidInvoices,
        unpaid: unpaidInvoices,
      },
      customerCount,
      productCount,
    };
  }

  async monthlyRevenue(tenantId: string, months: number) {
    const startDate = new Date();
    startDate.setUTCDate(1);
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCMonth(startDate.getUTCMonth() - (months - 1));

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: InvoiceStatus.PAID,
        issueDate: { gte: startDate },
      },
      select: { issueDate: true, total: true },
    });
    const totals = new Map<string, Prisma.Decimal>();
    for (const invoice of invoices) {
      const key = invoice.issueDate.toISOString().slice(0, 7);
      totals.set(
        key,
        (totals.get(key) ?? new Prisma.Decimal(0)).add(invoice.total),
      );
    }

    return Array.from({ length: months }, (_, index) => {
      const month = new Date(startDate);
      month.setUTCMonth(startDate.getUTCMonth() + index);
      const key = month.toISOString().slice(0, 7);
      return { month: key, revenue: totals.get(key)?.toFixed(2) ?? '0.00' };
    });
  }

  recentInvoices(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { issueDate: 'desc' },
      take: 10,
      include: { customer: true },
    });
  }
}
