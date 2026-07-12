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
import { AiParserService } from '../ai/ai-parser.service';
import { ApprovalsService } from '../approvals/approvals.service';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly aiParser: AiParserService,
    private readonly approvalsService: ApprovalsService,
    private readonly invoicesService: InvoicesService,
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
      if (inserted) {
        processed += 1;
        this.processMessageWithAiAsync(organization.id, message).catch((err) => {
          this.logger.error('Failed to process WhatsApp message asynchronously with AI', err);
        });
      } else {
        duplicates += 1;
      }
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
      audio?: { id: string; mime_type: string };
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

  private async processMessageWithAiAsync(
    tenantId: string,
    message: {
      from: string;
      id: string;
      timestamp: string;
      type: string;
      text?: { body: string };
      audio?: { id: string; mime_type: string };
    },
  ): Promise<void> {
    try {
      this.logger.log(`Processing WhatsApp message id: ${message.id} with AI...`);

      let parsed: any;
      if (message.type === 'text' && message.text) {
        parsed = await this.aiParser.parseMessage(message.text.body, tenantId);
      } else if (message.type === 'audio' && message.audio) {
        const media = await this.downloadWhatsAppMedia(message.audio.id);
        if (!media) {
          this.logger.warn(`Could not retrieve media for audio ID: ${message.audio.id}. Skipping AI parsing.`);
          return;
        }
        parsed = await this.aiParser.parseAudio(media.buffer, media.mimeType, tenantId);
      } else {
        this.logger.log(`WhatsApp message type "${message.type}" is not supported for AI parsing.`);
        return;
      }

      if (!parsed) {
        this.logger.warn('AI Parsing returned empty results.');
        return;
      }

      this.logger.log(`AI Parsing result confidence: ${parsed.confidence}`);

      const defaultUser = await this.prisma.user.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
      });
      if (!defaultUser) {
        this.logger.error(`No user found for organization ${tenantId}. Cannot execute AI actions.`);
        return;
      }

      const threshold = this.config.get('AI_MIN_CONFIDENCE_THRESHOLD');

      if (parsed.confidence >= threshold && parsed.items && parsed.items.length > 0) {
        this.logger.log('High confidence: auto-creating draft invoice');
        
        const customerName = parsed.customer.name;
        let dbCustomer = await this.prisma.customer.findFirst({
          where: { tenantId, name: { equals: customerName, mode: 'insensitive' }, deletedAt: null },
        });

        if (!dbCustomer) {
          dbCustomer = await this.prisma.customer.create({
            data: {
              tenantId,
              name: customerName,
              phone: parsed.customer.phone || null,
              gstin: parsed.customer.gstin || null,
            },
          });
        }

        const itemsToCreate: { productId: string; quantity: number }[] = [];
        for (const item of parsed.items) {
          let dbProduct = await this.prisma.product.findFirst({
            where: { tenantId, name: { equals: item.productName, mode: 'insensitive' }, deletedAt: null },
          });

          if (!dbProduct) {
            dbProduct = await this.prisma.product.create({
              data: {
                tenantId,
                name: item.productName,
                price: new Prisma.Decimal(item.price || 0),
                gstRate: new Prisma.Decimal(18),
              },
            });
          }
          itemsToCreate.push({
            productId: dbProduct.id,
            quantity: item.quantity,
          });
        }

        await this.invoicesService.create(
          {
            customerId: dbCustomer.id,
            notes: parsed.rawSummary || 'Auto-created via WhatsApp message extraction',
            items: itemsToCreate,
          },
          tenantId,
          defaultUser.id,
        );

        this.logger.log('Draft invoice created successfully from WhatsApp message.');
      } else {
        this.logger.log('Low confidence / missing fields: routing to approvals queue');
        await this.approvalsService.create(
          {
            workflowType: 'WHATSAPP_INVOICE_PARSING',
            entityType: 'Invoice',
            payload: parsed as any,
          },
          tenantId,
          defaultUser.id,
        );
      }
    } catch (error) {
      this.logger.error('Failed processing WhatsApp message with AI', error);
    }
  }

  private async downloadWhatsAppMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const whatsappToken = this.config.get('WHATSAPP_VERIFY_TOKEN');
    if (!whatsappToken) {
      this.logger.warn('WhatsApp API credentials not fully configured. Simulating empty audio buffer for offline development.');
      return {
        buffer: Buffer.from('mock-audio-buffer'),
        mimeType: 'audio/ogg',
      };
    }

    try {
      const graphUrl = `https://graph.facebook.com/v19.0/${mediaId}`;
      const mediaResponse = await fetch(graphUrl, {
        headers: { Authorization: `Bearer ${whatsappToken}` },
      });
      if (!mediaResponse.ok) {
        throw new Error(`Graph API returned status ${mediaResponse.status}`);
      }
      const mediaData: any = await mediaResponse.json();
      const downloadUrl = mediaData.url;

      const fileResponse = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${whatsappToken}` },
      });
      if (!fileResponse.ok) {
        throw new Error(`Media download returned status ${fileResponse.status}`);
      }
      const arrayBuffer = await fileResponse.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        mimeType: mediaData.mime_type || 'audio/ogg',
      };
    } catch (error) {
      this.logger.error(`Error downloading WhatsApp media ${mediaId}`, error);
      return null;
    }
  }
}
