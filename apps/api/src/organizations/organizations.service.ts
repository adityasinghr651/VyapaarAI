import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

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
}
