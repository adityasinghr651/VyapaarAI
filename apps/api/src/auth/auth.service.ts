import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../audit/audit.service';
import {
  ConflictError,
  UnauthorizedError,
} from '../common/errors/application.errors';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const password = await bcrypt.hash(dto.password, 12);
    const organizationName = dto.organizationName?.trim() || `${dto.name}'s Business`;
    const slug = await this.createUniqueSlug(organizationName);

    const user = await this.prisma.$transaction(async (transaction) => {
      const organization = await transaction.organization.create({
        data: { name: organizationName, slug, email },
      });
      const createdUser = await transaction.user.create({
        data: {
          tenantId: organization.id,
          email,
          password,
          name: dto.name.trim(),
          role: Role.OWNER,
        },
        select: this.authUserSelect(),
      });
      await this.auditService.log(
        {
          tenantId: organization.id,
          actorId: createdUser.id,
          action: 'USER_REGISTERED',
          entityType: 'User',
          entityId: createdUser.id,
          metadata: { email, role: createdUser.role },
        },
        transaction,
      );
      return createdUser;
    });

    return { token: await this.generateToken(user), user };
  }

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
    requestId?: string,
    traceId?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    await this.auditService.log({
      tenantId: user.tenantId,
      actorId: user.id,
      action: 'USER_LOGGED_IN',
      entityType: 'User',
      entityId: user.id,
      metadata: { email: user.email },
      ipAddress,
      userAgent,
      requestId,
      traceId,
    });

    const authUser: AuthUser = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return { token: await this.generateToken(authUser), user: authUser };
  }

  async getCurrentUser(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        ...this.authUserSelect(),
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            gstin: true,
            stateCode: true,
          },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return user;
  }

  private generateToken(user: AuthUser): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });
  }

  private async createUniqueSlug(name: string): Promise<string> {
    const base =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'organization';
    for (let suffix = 0; suffix < 100; suffix += 1) {
      const slug = suffix === 0 ? base : `${base}-${suffix}`;
      const existing = await this.prisma.organization.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!existing) {
        return slug;
      }
    }
    return `${base}-${Date.now()}`;
  }

  private authUserSelect(): Prisma.UserSelect {
    return {
      id: true,
      tenantId: true,
      email: true,
      name: true,
      role: true,
    };
  }
}
