import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedRequest } from '../types/authenticated-request';
import { UnauthorizedError } from '../errors/application.errors';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedError('Tenant context is missing');
    }

    const tenant = await this.prisma.organization.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) {
      throw new UnauthorizedError('Tenant is invalid');
    }
    return true;
  }
}
