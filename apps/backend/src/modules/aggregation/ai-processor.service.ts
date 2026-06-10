import { Injectable, Logger } from '@nestjs/common';

export interface AiProcessResult {
  isTravelRelated: boolean;
  detectedLocation: string | null;
  detectedCategory: string | null;
  suggestedTags: string[];
}

@Injectable()
export class AiProcessorService {
  private readonly logger = new Logger(AiProcessorService.name);

  /**
   * Simulates an AI call (e.g. to OpenAI/Gemini or custom Python worker)
   * that analyzes a social media caption, tags, and image/video metadata.
   */
  async processContent(caption: string, rawTags: string[]): Promise<AiProcessResult> {
    this.logger.log(`Analyzing content with AI for tourism relevance...`);
    
    // Artificial delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowercaseCaption = caption.toLowerCase();
    const joinedTags = rawTags.join(' ').toLowerCase();
    const fullText = `${lowercaseCaption} ${joinedTags}`;

    // Simple keyword-based mock for the AI layer
    const tourismKeywords = ['waterfall', 'temple', 'travel', 'trip', 'explore', 'nature', 'bastar', 'forest', 'chhattisgarh'];
    const nonTourismKeywords = ['meme', 'politics', 'joke', 'ad', 'sponsor', 'funny'];

    const hasTourism = tourismKeywords.some(kw => fullText.includes(kw));
    const hasNonTourism = nonTourismKeywords.some(kw => fullText.includes(kw));

    if (hasNonTourism || !hasTourism) {
      return {
        isTravelRelated: false,
        detectedLocation: null,
        detectedCategory: null,
        suggestedTags: [],
      };
    }

    // Mock Location Detection
    let location = 'Chhattisgarh';
    if (fullText.includes('chitrakote') || fullText.includes('niagara')) location = 'Chitrakote Falls';
    else if (fullText.includes('tirathgarh')) location = 'Tirathgarh Falls';
    else if (fullText.includes('sirpur')) location = 'Sirpur';
    else if (fullText.includes('bastar')) location = 'Bastar';

    // Mock Category Detection
    let category = 'Nature';
    if (fullText.includes('waterfall')) category = 'Waterfalls';
    else if (fullText.includes('temple') || fullText.includes('heritage')) category = 'Heritage';
    else if (fullText.includes('food')) category = 'Food Trails';

    return {
      isTravelRelated: true,
      detectedLocation: location,
      detectedCategory: category,
      suggestedTags: ['tourism', 'explore', category.toLowerCase()],
    };
  }
}
