import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';
import { AiProcessorService } from './ai-processor.service';

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(
    private prisma: PrismaService,
    private aiProcessor: AiProcessorService,
    private httpService: HttpService,
  ) {}

  /**
   * Main entrypoint for the background worker.
   * Finds all active integrations and processes them.
   */
  async runGlobalSync() {
    this.logger.log('Starting global social feed sync...');
    
    // Fetch all active integrations
    const integrations = await this.prisma.socialIntegration.findMany({
      where: { syncEnabled: true },
      include: { creator: true }
    });

    this.logger.log(`Found ${integrations.length} active integrations to sync.`);

    let totalProcessed = 0;
    let totalApproved = 0;

    for (const integration of integrations) {
      try {
        const results = await this.syncCreator(integration);
        totalProcessed += results.processed;
        totalApproved += results.approved;
      } catch (error) {
        this.logger.error(`Error syncing integration ${integration.id}:`, error);
      }
    }

    this.logger.log(`Global sync complete. Processed: ${totalProcessed}, Auto-Approved: ${totalApproved}`);
    return { totalProcessed, totalApproved };
  }

  /**
   * Sync a single creator's integration
   */
  async syncCreator(integration: any) {
    this.logger.log(`Fetching latest posts for creator: ${integration.creatorId} via ${integration.platform}`);
    
    // Fetch real posts from external APIs
    let externalPosts: any[] = [];
    try {
      if (integration.platform === 'INSTAGRAM') {
        externalPosts = await this.fetchRealInstagramData(integration);
      } else if (integration.platform === 'YOUTUBE') {
        externalPosts = await this.fetchRealYouTubeData(integration);
      }
    } catch (err: any) {
      this.logger.error(`Failed to fetch from ${integration.platform} API: ${err.message}`);
      return { processed: 0, approved: 0 };
    }

    let processedCount = 0;
    let approvedCount = 0;

    for (const post of externalPosts) {
      // 1. Check if we already aggregated this post
      const existing = await this.prisma.aggregatedContent.findUnique({
        where: {
          platform_socialId: {
            platform: integration.platform,
            socialId: post.id
          }
        }
      });

      if (existing) continue; // Skip already processed

      // 2. AI Processing
      const aiAnalysis = await this.aiProcessor.processContent(post.caption, post.tags);

      // 3. Apply Creator's filtering rules
      if (integration.syncTravelOnly && !aiAnalysis.isTravelRelated) {
        this.logger.log(`Skipping non-travel post ${post.id}`);
        // Still save it but mark rejected so we don't re-process it
        await this.prisma.aggregatedContent.create({
          data: {
            socialId: post.id,
            platform: integration.platform,
            creatorId: integration.creatorId,
            rawMetadata: JSON.stringify(post),
            mediaUrl: post.mediaUrl,
            thumbnailUrl: post.thumbnailUrl,
            caption: post.caption,
            isTravelRelated: false,
            status: 'REJECTED'
          }
        });
        continue;
      }

      // 4. Determine Approval Status
      let finalStatus = 'PENDING';
      if (integration.autoApprove && aiAnalysis.isTravelRelated) {
        finalStatus = 'APPROVED';
      }

      // 5. Save to Aggregated Content queue
      const aggregated = await this.prisma.aggregatedContent.create({
        data: {
          socialId: post.id,
          platform: integration.platform,
          creatorId: integration.creatorId,
          rawMetadata: JSON.stringify(post),
          mediaUrl: post.mediaUrl,
          thumbnailUrl: post.thumbnailUrl,
          caption: post.caption,
          
          isTravelRelated: aiAnalysis.isTravelRelated,
          detectedLocation: aiAnalysis.detectedLocation,
          detectedCategory: aiAnalysis.detectedCategory,
          suggestedTags: JSON.stringify(integration.autoGenerateTags ? aiAnalysis.suggestedTags : []),
          
          status: finalStatus
        }
      });
      processedCount++;

      // 6. Bridge to Public Feed if Auto-Approved
      if (finalStatus === 'APPROVED') {
        await this.publishToCreatorVideos(aggregated, integration);
        approvedCount++;
      }
    }

    // Update last synced time
    await this.prisma.socialIntegration.update({
      where: { id: integration.id },
      data: { lastSyncedAt: new Date() }
    });

    return { processed: processedCount, approved: approvedCount };
  }

  /**
   * Converts approved AggregatedContent into a public CreatorVideo
   */
  private async publishToCreatorVideos(aggregated: any, integration: any) {
    this.logger.log(`Publishing aggregated post ${aggregated.socialId} to live feed`);
    
    // Fallbacks if AI didn't detect them
    const location = aggregated.detectedLocation || 'Chhattisgarh';
    const category = aggregated.detectedCategory || 'Explore';
    
    const newVideo = await this.prisma.creatorVideo.create({
      data: {
        creatorId: integration.creatorId,
        title: `${location} - ${category}`, // Auto generated title
        videoUrl: aggregated.mediaUrl,
        thumbnailUrl: aggregated.thumbnailUrl,
        location: location,
        district: 'Bastar', // Mock default
        category: category,
        language: 'en'
      }
    });

    // Link back to aggregation
    await this.prisma.aggregatedContent.update({
      where: { id: aggregated.id },
      data: { publishedVideoId: newVideo.id }
    });
  }

  /**
   * Fetch real posts from Instagram Graph API
   */
  private async fetchRealInstagramData(integration: any) {
    // Requires a valid long-lived user access token
    const accessToken = integration.accessToken;
    if (!accessToken || accessToken.startsWith('mock_')) {
      throw new Error("Invalid or missing real Instagram Access Token.");
    }

    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token=${accessToken}`;
    const response = await firstValueFrom(this.httpService.get(url));
    const data = response.data.data || [];

    // Map Instagram payload to our standard schema
    return data.map((item: any) => ({
      id: item.id,
      caption: item.caption || '',
      tags: [], // Extract tags from caption using regex if needed, or rely on AI later
      mediaUrl: item.media_url,
      thumbnailUrl: item.thumbnail_url || item.media_url, // Fallback for images
      permalink: item.permalink
    }));
  }

  /**
   * Fetch real posts from YouTube Data API v3
   */
  private async fetchRealYouTubeData(integration: any) {
    // Requires a valid Google Cloud Platform API Key
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error("YOUTUBE_API_KEY environment variable is missing.");
    }

    const channelId = integration.platformUserId;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${apiKey}`;
    
    const response = await firstValueFrom(this.httpService.get(url));
    const items = response.data.items || [];

    // Map YouTube payload to our standard schema
    return items.map((item: any) => {
      const snippet = item.snippet;
      return {
        id: item.id.videoId,
        caption: `${snippet.title} - ${snippet.description}`,
        tags: [],
        mediaUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
        permalink: `https://www.youtube.com/watch?v=${item.id.videoId}`
      };
    });
  }

  /**
   * Handle Real-Time Push Payload from Webhooks
   */
  async handleRealtimePayload(platform: string, platformUserId: string, payload: any) {
    this.logger.log(`Received real-time webhook for ${platform} user ${platformUserId}`);

    // 1. Find the connected integration
    const integration = await this.prisma.socialIntegration.findFirst({
      where: { platform, platformUserId, syncEnabled: true }
    });

    if (!integration) {
      this.logger.warn(`No active integration found for ${platformUserId}`);
      return;
    }

    // 2. Extract standard fields
    let socialId = '';
    let caption = '';
    let mediaUrl = '';
    let thumbnailUrl = '';

    if (platform === 'INSTAGRAM') {
      socialId = payload.id;
      caption = payload.caption || '';
      mediaUrl = payload.media_url || '';
      thumbnailUrl = payload.thumbnail_url || mediaUrl;
    } else if (platform === 'YOUTUBE') {
      socialId = payload['yt:videoId']?.[0];
      caption = payload.title?.[0] || '';
      mediaUrl = `https://www.youtube.com/watch?v=${socialId}`;
      thumbnailUrl = `https://img.youtube.com/vi/${socialId}/hqdefault.jpg`;
    }

    if (!socialId) return;

    // 3. Skip if already exists
    const existing = await this.prisma.aggregatedContent.findUnique({
      where: { platform_socialId: { platform, socialId } }
    });
    if (existing) return;

    // 4. Run through AI Processor
    const aiAnalysis = await this.aiProcessor.processContent(caption, []);

    // 5. Save as PENDING for Admin/Moderator review
    // (Explicitly overriding autoApprove per user request for real-time posts)
    await this.prisma.aggregatedContent.create({
      data: {
        socialId,
        platform,
        creatorId: integration.creatorId,
        rawMetadata: JSON.stringify(payload),
        mediaUrl,
        thumbnailUrl,
        caption,
        isTravelRelated: aiAnalysis.isTravelRelated,
        detectedLocation: aiAnalysis.detectedLocation,
        detectedCategory: aiAnalysis.detectedCategory,
        suggestedTags: JSON.stringify(aiAnalysis.suggestedTags),
        status: 'PENDING' // Forces admin review
      }
    });

    this.logger.log(`Real-time post ${socialId} saved to PENDING queue for review.`);
  }
}
