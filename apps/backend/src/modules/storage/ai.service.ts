import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AIService {
  private ai: GoogleGenAI | null = null;
  private readonly logger = new Logger(AIService.name);

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      this.logger.warn('GEMINI_API_KEY not found. AI Vision features will be mocked.');
    }
  }

  /**
   * Processes an image and extracts metadata such as tags, dominant colors, and season.
   */
  async extractImageMetadata(mimeType: string, imageBuffer: Buffer): Promise<{
    tags: string[];
    dominantColors: string[];
    aiLabels: string[];
    season?: string;
  }> {
    if (!this.ai) {
      // Mock implementation if no API key is provided
      return {
        tags: ['travel', 'nature'],
        dominantColors: ['#4CAF50', '#2196F3'],
        aiLabels: ['outdoors', 'scenery'],
        season: 'Monsoon',
      };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: imageBuffer.toString('base64'),
                  mimeType,
                },
              },
              {
                text: `Analyze this image for a tourism platform. Return a JSON object EXACTLY like this (no markdown or code blocks):
{
  "tags": ["tag1", "tag2"],
  "dominantColors": ["colorName1", "colorName2"],
  "aiLabels": ["label1", "label2"],
  "season": "Summer"
}
Ensure the output is valid JSON. Extract elements relevant to tourism (waterfalls, forests, heritage, food).`
              }
            ]
          }
        ]
      });

      const text = response.text || '{}';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        dominantColors: Array.isArray(parsed.dominantColors) ? parsed.dominantColors : [],
        aiLabels: Array.isArray(parsed.aiLabels) ? parsed.aiLabels : [],
        season: parsed.season || undefined,
      };
    } catch (error) {
      this.logger.error('Failed to extract image metadata from Gemini', error);
      // Fallback
      return {
        tags: [],
        dominantColors: [],
        aiLabels: [],
      };
    }
  }
}
