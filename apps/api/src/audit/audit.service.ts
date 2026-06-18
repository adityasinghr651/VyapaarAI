import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    action: string,
    actorId: string | null,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      await this.prisma.client.auditLog.create({
        data: {
          action,
          actorId,
          details,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });
    } catch (error) {
      // Prevent failure in audit logging from crashing request flow (but log locally)
      console.error('Failed to write audit log:', error);
    }
  }
}
