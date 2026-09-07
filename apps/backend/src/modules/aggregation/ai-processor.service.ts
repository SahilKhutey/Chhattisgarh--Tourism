import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

export interface AiProcessResult {
  isTravelRelated: boolean;
  detectedLocation: string | null;
  detectedCategory: string | null;
  suggestedTags: string[];
}

@Injectable()
export class AiProcessorService {
  private readonly logger = new Logger(AiProcessorService.name);
  private readonly ai: GoogleGenAI | null;
  private readonly mode = process.env.CONTENT_CLASSIFIER_MODE || 'gemini';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

    if (this.mode === 'gemini' && !this.ai) {
      this.logger.warn(
        'CONTENT_CLASSIFIER_MODE=gemini but GEMINI_API_KEY is missing. Falling back to rules.',
      );
    }
  }

  async processContent(
    caption: string,
    rawTags: string[],
  ): Promise<AiProcessResult> {
    const cleanCaption = String(caption || '').trim();
    const cleanTags = Array.isArray(rawTags)
      ? rawTags.map((tag) => String(tag).trim()).filter(Boolean)
      : [];

    if (this.mode === 'gemini' && this.ai) {
      try {
        return await this.processWithGemini(cleanCaption, cleanTags);
      } catch (error: any) {
        this.logger.error(
          `Gemini classification failed: ${error?.message || error}`,
        );
        return this.processWithRules(cleanCaption, cleanTags);
      }
    }

    return this.processWithRules(cleanCaption, cleanTags);
  }

  private async processWithGemini(
    caption: string,
    tags: string[],
  ): Promise<AiProcessResult> {
    const prompt = `
You are the tourism content classification engine for CG Tourism, a tourism platform focused on Chhattisgarh, India.
Analyze the following social-media content.
Caption: ${caption}
Tags: ${JSON.stringify(tags)}

Return ONLY valid JSON:
{
  "isTravelRelated": true,
  "detectedLocation": "Chitrakote Falls",
  "detectedCategory": "Waterfalls",
  "suggestedTags": ["tourism", "waterfalls", "chhattisgarh"]
}

Rules:
1. isTravelRelated must be true only when the content is genuinely tourism, travel, destination, heritage, culture, food, nature or wildlife related.
2. detectedLocation must be null when no reliable location can be inferred.
3. detectedCategory should be one concise tourism category.
4. suggestedTags must contain only useful tourism tags.
5. Never invent an exact location without evidence.
6. Chhattisgarh locations should be preferred when the content indicates Chhattisgarh.
`;

    const response = await this.ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const cleaned = text
      .replace(/^[^{]*({[\s\S]*})[^}]*$/, '$1')
      .trim();
    const parsed = JSON.parse(cleaned);

    return {
      isTravelRelated: Boolean(parsed.isTravelRelated),
      detectedLocation:
        typeof parsed.detectedLocation === 'string'
          ? parsed.detectedLocation
          : null,
      detectedCategory:
        typeof parsed.detectedCategory === 'string'
          ? parsed.detectedCategory
          : null,
      suggestedTags: Array.isArray(parsed.suggestedTags)
        ? parsed.suggestedTags
            .filter((tag: unknown) => typeof tag === 'string')
            .slice(0, 10)
        : [],
    };
  }

  private processWithRules(caption: string, tags: string[]): AiProcessResult {
    const fullText = `${caption} ${tags.join(' ')}`.toLowerCase();

    const tourismKeywords = [
      'tourism',
      'tourist',
      'travel',
      'trip',
      'explore',
      'waterfall',
      'forest',
      'wildlife',
      'heritage',
      'temple',
      'culture',
      'festival',
      'food',
      'trek',
      'nature',
      'museum',
      'monument',
      'chhattisgarh',
      'bastar',
      'sirpur',
      'mainpat',
      'chitrakote',
      'tirathgarh',
    ];

    const nonTourismKeywords = ['politics', 'meme', 'joke', 'funny', 'sponsor'];

    const tourismScore = tourismKeywords.reduce(
      (score, keyword) => (fullText.includes(keyword) ? score + 1 : score),
      0,
    );

    const blocked = nonTourismKeywords.some((keyword) =>
      fullText.includes(keyword),
    );

    if (blocked || tourismScore === 0) {
      return {
        isTravelRelated: false,
        detectedLocation: null,
        detectedCategory: null,
        suggestedTags: [],
      };
    }

    let location: string | null = null;
    if (fullText.includes('chitrakote')) {
      location = 'Chitrakote Falls';
    } else if (fullText.includes('tirathgarh')) {
      location = 'Tirathgarh Falls';
    } else if (fullText.includes('sirpur')) {
      location = 'Sirpur';
    } else if (fullText.includes('mainpat')) {
      location = 'Mainpat';
    } else if (fullText.includes('bastar')) {
      location = 'Bastar';
    }

    let category = 'Nature';
    if (fullText.includes('waterfall') || fullText.includes('falls')) {
      category = 'Waterfalls';
    } else if (
      fullText.includes('temple') ||
      fullText.includes('heritage') ||
      fullText.includes('monument')
    ) {
      category = 'Heritage';
    } else if (fullText.includes('food')) {
      category = 'Food Trails';
    } else if (fullText.includes('wildlife')) {
      category = 'Wildlife';
    } else if (fullText.includes('festival') || fullText.includes('culture')) {
      category = 'Culture';
    }

    return {
      isTravelRelated: true,
      detectedLocation: location,
      detectedCategory: category,
      suggestedTags: [
        'tourism',
        'chhattisgarh',
        category.toLowerCase(),
        ...tags.slice(0, 5),
      ].filter((tag, index, array) => array.indexOf(tag) === index),
    };
  }
}
