import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { AuthenticatedRequest } from '../common/types/authenticated-request';
import { UnauthorizedError } from '../common/errors/application.errors';
import { WhatsAppService } from './whatsapp.service';

@Public()
@Controller('webhooks/whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get()
  async verifyOrStatus(
    @Query('hub.mode') mode: string | undefined,
    @Query('hub.verify_token') token: string | undefined,
    @Query('hub.challenge') challenge: string | undefined,
    @Res() response: Response,
    @Headers('authorization') authHeader?: string,
  ): Promise<void> {
    if (challenge) {
      if (!this.whatsappService.verifySubscription(mode, token)) {
        throw new UnauthorizedError('WhatsApp webhook verification failed');
      }
      response.status(200).send(challenge);
      return;
    }

    const statusData = await this.whatsappService.getWebhookStatus(authHeader);
    response.status(200).json({
      success: true,
      message: 'WhatsApp webhook verification status retrieved successfully',
      data: statusData,
    });
  }

  @Throttle({ default: { limit: 300, ttl: 60_000 } })
  @Post()
  async receive(
    @Body() payload: unknown,
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    this.whatsappService.validateSignature(request.rawBody, signature);
    return {
      message: 'Webhook received',
      data: await this.whatsappService.receive(payload),
    };
  }
}
