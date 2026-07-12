import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import {
  BusinessError,
  ConflictError,
  NotFoundError,
} from '../common/errors/application.errors';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrent(tenantId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: tenantId },
    });
    if (!organization) {
      throw new Error(`Organization not found for tenantId: ${tenantId}`);
    }
    return organization;
  }

  async updateCurrent(tenantId: string, dto: UpdateOrganizationDto) {
    const data: Prisma.OrganizationUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.gstin !== undefined) data.gstin = dto.gstin || null;
    if (dto.pan !== undefined) data.pan = dto.pan || null;
    if (dto.address !== undefined) data.address = dto.address || null;
    if (dto.stateCode !== undefined) data.stateCode = dto.stateCode || null;
    if (dto.whatsappPhoneNumberId !== undefined) {
      data.whatsappPhoneNumberId =
        dto.whatsappPhoneNumberId && dto.whatsappPhoneNumberId.trim() !== ''
          ? dto.whatsappPhoneNumberId.trim()
          : null;
    }

    return this.prisma.organization.update({
      where: { id: tenantId },
      data,
    });
  }

  async getUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async inviteUser(tenantId: string, dto: InviteUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictError('A user with this email address already exists.');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        role: dto.role,
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUserRole(
    tenantId: string,
    userId: string,
    dto: UpdateUserRoleDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.tenantId !== tenantId) {
      throw new NotFoundError('User');
    }

    if (user.role === Role.OWNER && dto.role !== Role.OWNER) {
      const ownerCount = await this.prisma.user.count({
        where: { tenantId, role: Role.OWNER },
      });
      if (ownerCount <= 1) {
        throw new BusinessError(
          'Every organization must always have at least one OWNER. Cannot demote the last remaining OWNER.',
        );
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
