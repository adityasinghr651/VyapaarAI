import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConversationDirection,
  ConversationMessageStatus,
  Prisma,
} from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';
import { ConfigService } from '../config/config.service';
import { PrismaService } from '../database/prisma.service';
import { UnauthorizedError } from '../common/errors/application.errors';
import {
  WhatsAppWebhookPayload,
  whatsappWebhookSchema,
} from './whatsapp-webhook.schema';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async getWebhookStatus(authHeader?: string): Promise<{ status: string; verified: boolean }> {
    let verified = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = await this.jwtService.verifyAsync<{ tenantId?: string }>(token, {
          secret: this.config.get('JWT_SECRET'),
        });
        if (payload?.tenantId) {
          const org = await this.prisma.organization.findUnique({
            where: { id: payload.tenantId },
          });
          if (org && org.whatsappPhoneNumberId && org.whatsappPhoneNumberId.trim() !== '') {
            verified = true;
          }
        }
      } catch {
        // Token invalid or expired, default to Verification Pending
      }
    }
    return {
      status: verified ? 'Verified' : 'Verification Pending',
      verified,
    };
  }

  verifySubscription(mode?: string, token?: string): boolean {
    const expected = this.config.get('WHATSAPP_VERIFY_TOKEN');
    return mode === 'subscribe' && !!expected && token === expected;
  }

  validateSignature(rawBody: Buffer | undefined, signature?: string): void {
    const secret = this.config.get('WHATSAPP_APP_SECRET');
    if (!secret || !rawBody || !signature?.startsWith('sha256=')) {
      throw new UnauthorizedError('Invalid WhatsApp webhook signature');
    }
    const expected = `sha256=${createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')}`;
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedError('Invalid WhatsApp webhook signature');
    }
  }

  async receive(payload: unknown): Promise<{ processed: number; duplicates: number }> {
    const parsed = whatsappWebhookSchema.parse(payload);
    let processed = 0;
    let duplicates = 0;

    for (const entry of parsed.entry) {
      for (const change of entry.changes) {
        const result = await this.processChange(parsed, change.value);
        processed += result.processed;
        duplicates += result.duplicates;
      }
    }
    return { processed, duplicates };
  }

  private async processChange(
    payload: WhatsAppWebhookPayload,
    value: WhatsAppWebhookPayload['entry'][number]['changes'][number]['value'],
  ): Promise<{ processed: number; duplicates: number }> {
    const organization = await this.prisma.organization.findUnique({
      where: { whatsappPhoneNumberId: value.metadata.phone_number_id },
      select: { id: true },
    });
    if (!organization) {
      this.logger.warn({
        message: 'WhatsApp phone number is not mapped to a tenant',
        phoneNumberId: value.metadata.phone_number_id,
      });
      return { processed: 0, duplicates: 0 };
    }

    let processed = 0;
    let duplicates = 0;
    for (const message of value.messages ?? []) {
      const contact = value.contacts?.find(
        (candidate) => candidate.wa_id === message.from,
      );
      const inserted = await this.persistMessage(
        organization.id,
        contact?.profile?.name,
        message,
        payload,
      );
      inserted ? (processed += 1) : (duplicates += 1);
    }
    return { processed, duplicates };
  }

  private async persistMessage(
    tenantId: string,
    contactName: string | undefined,
    message: {
      from: string;
      id: string;
      timestamp: string;
      type: string;
      text?: { body: string };
    },
    payload: WhatsAppWebhookPayload,
  ): Promise<boolean> {
    const occurredAt = new Date(Number(message.timestamp) * 1000);
    const ttlMinutes = this.config.get('WHATSAPP_SESSION_TTL_MINUTES');
    const expiresAt = new Date(occurredAt.getTime() + ttlMinutes * 60_000);

    try {
      await this.prisma.$transaction(async (transaction) => {
        const session = await transaction.conversationSession.upsert({
          where: {
            tenantId_channel_externalContactId: {
              tenantId,
              channel: 'WHATSAPP',
              externalContactId: message.from,
            },
          },
          update: { contactName, lastMessageAt: occurredAt, expiresAt },
          create: {
            tenantId,
            channel: 'WHATSAPP',
            externalContactId: message.from,
            contactName,
            state: {},
            lastMessageAt: occurredAt,
            expiresAt,
          },
        });
        await transaction.conversationMessage.create({
          data: {
            tenantId,
            sessionId: session.id,
            providerMessageId: message.id,
            direction: ConversationDirection.INBOUND,
            status: ConversationMessageStatus.RECEIVED,
            messageType: message.type,
            body: message.text?.body,
            payload: payload as Prisma.InputJsonValue,
            occurredAt,
          },
        });
      });
      return true;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return false;
      }
      throw error;
    }
  }
}
