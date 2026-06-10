import { Controller, Get, Post, Body, Req, Res, Headers, HttpStatus, Logger, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { AggregationService } from './aggregation.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly aggregationService: AggregationService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // INSTAGRAM WEBHOOKS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('instagram')
  verifyInstagramWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
    @Res() res: Response
  ) {
    const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'cg_tourism_ig_verify_token';
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      this.logger.log('Instagram Webhook Verified!');
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      this.logger.warn('Instagram Webhook Verification Failed');
      return res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }

  @Post('instagram')
  async handleInstagramWebhook(
    @Headers('x-hub-signature-256') signature: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    // 1. Verify payload signature (Important for security)
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    if (appSecret && signature) {
      const payload = JSON.stringify(body);
      const expectedSignature = 'sha256=' + crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
      if (signature !== expectedSignature) {
        this.logger.error('Invalid Instagram Webhook Signature');
        return res.sendStatus(HttpStatus.UNAUTHORIZED);
      }
    }

    // 2. Acknowledge receipt to Meta within 20 seconds
    res.status(HttpStatus.OK).send('EVENT_RECEIVED');

    // 3. Process the payload asynchronously
    try {
      if (body.object === 'instagram') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'media') {
              // Real-time post or story payload
              await this.aggregationService.handleRealtimePayload('INSTAGRAM', entry.id, change.value);
            }
          }
        }
      }
    } catch (err) {
      this.logger.error('Error processing Instagram Webhook', err);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // YOUTUBE WEBSUB WEBHOOKS (PubSubHubbub)
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('youtube')
  verifyYouTubeWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.topic') topic: string,
    @Res() res: Response
  ) {
    if (mode === 'subscribe' || mode === 'unsubscribe') {
      this.logger.log(`YouTube Webhook Verified for topic: ${topic}`);
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      return res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }

  @Post('youtube')
  async handleYouTubeWebhook(
    @Headers('x-hub-signature') signature: string,
    @Body() body: any, // Typically XML
    @Req() req: Request,
    @Res() res: Response
  ) {
    // 1. Acknowledge receipt
    res.status(HttpStatus.OK).send('EVENT_RECEIVED');

    // 2. Process XML payload (Parsed by body-parser middleware normally, assuming JSON/Object here for simplicity)
    try {
      // In a real scenario, you parse the ATOM XML feed to extract videoId and channelId
      // const xmlData = req.body;
      const videoId = body?.feed?.entry?.[0]?.['yt:videoId']?.[0];
      const channelId = body?.feed?.entry?.[0]?.['yt:channelId']?.[0];

      if (videoId && channelId) {
        await this.aggregationService.handleRealtimePayload('YOUTUBE', channelId, body.feed.entry[0]);
      }
    } catch (err) {
      this.logger.error('Error processing YouTube Webhook', err);
    }
  }
}
