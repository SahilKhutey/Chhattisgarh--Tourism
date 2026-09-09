import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma.service';

export interface DriftReport {
  templateId: string;
  templateName: string;
  templateVersion: number;
  entryCount: number;
  driftCount: number;
  manualReviewCount: number;
  timestamp: string;
}

@Injectable()
export class TemplateDriftScheduler {
  private readonly logger = new Logger(TemplateDriftScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleScheduledDriftCheck() {
    this.logger.log('Starting scheduled template drift monitoring scan...');
    const reports = await this.computeDriftReport();

    const drifting = reports.filter((r) => r.driftCount > 0);
    if (drifting.length > 0) {
      this.logger.warn(`Detected schema drift across ${drifting.length} templates!`);
      this.eventEmitter.emit('template.drift.detected', {
        driftingTemplates: drifting,
        scannedAt: new Date().toISOString(),
      });
    } else {
      this.logger.log('No schema drift detected across any templates.');
    }

    return reports;
  }

  async computeDriftReport(): Promise<DriftReport[]> {
    const templates = await this.prisma.contentTemplate.findMany({
      include: {
        fields: true,
      },
    });

    const reports: DriftReport[] = [];

    for (const template of templates) {
      const entries = await this.prisma.contentEntry.findMany({
        where: { templateId: template.id },
        select: { id: true, templateVersion: true, data: true, status: true },
      });

      let driftCount = 0;
      let manualReviewCount = 0;

      for (const entry of entries) {
        // An entry drifts if its stored templateVersion is older than the published template version
        if (entry.templateVersion < template.version) {
          driftCount++;
        }

        // Check if any required field in current template is missing from entry data
        const data =
          typeof entry.data === 'string'
            ? JSON.parse(entry.data)
            : (entry.data as Record<string, unknown>) || {};

        const missingRequired = template.fields.some(
          (f) => f.required && (data[f.key] === undefined || data[f.key] === null || data[f.key] === ''),
        );

        if (missingRequired) {
          manualReviewCount++;
        }
      }

      reports.push({
        templateId: template.id,
        templateName: template.name,
        templateVersion: template.version,
        entryCount: entries.length,
        driftCount,
        manualReviewCount,
        timestamp: new Date().toISOString(),
      });
    }

    return reports;
  }
}
