import { Locale } from './types';
import { normalizeLocale } from './config';

export interface GlossaryTerm {
  hi: string;
  hne: string;
}

export const TOURISM_GLOSSARY: Record<string, GlossaryTerm> = {
  waterfall: { hi: 'जलप्रपात', hne: 'झरना' },
  waterfalls: { hi: 'जलप्रपात', hne: 'झरना मन' },
  forest: { hi: 'वन', hne: 'जंगल' },
  temple: { hi: 'मंदिर', hne: 'देवगुड़ी' },
  heritage: { hi: 'धरोहर', hne: 'पुरखा धरोहर' },
  safety: { hi: 'सुरक्षा', hne: 'बचाव' },
  eco: { hi: 'पारिस्थितिकी', hne: 'जंगल नियम' },
  tourism: { hi: 'पर्यटन', hne: 'घूमई' },
  culture: { hi: 'संस्कृति', hne: 'संस्कृति' },
  market: { hi: 'बाज़ार', hne: 'बाजार' },
  guide: { hi: 'गाइड', hne: 'रहनुमा' },
  sanctuary: { hi: 'अभयारण्य', hne: 'जंगली जीव शरण' },
  cave: { hi: 'गुफा', hne: 'खोंधरा' },
  dam: { hi: 'बांध', hne: 'बंधवा' },
  river: { hi: 'नदी', hne: 'नदिया' },
  hill: { hi: 'पहाड़', hne: 'डोंगरी' },
  welcome: { hi: 'स्वागत है', hne: 'जोहार' },
  explore: { hi: 'अन्वेषण करें', hne: 'खोजव' },
  emergency: { hi: 'आपातकालीन', hne: 'जरूरी बचाव' },
  booking: { hi: 'बुकिंग', hne: 'सवारी पंजीयन' },
  review: { hi: 'समीक्षा', hne: 'राय बात' },
  food: { hi: 'भोजन', hne: 'जेवनार' },
  crafts: { hi: 'हस्तशिल्प', hne: 'घड़वा शिल्प' },
  tribal: { hi: 'जनजातीय', hne: 'आदिवासी' },
  festival: { hi: 'त्योहार', hne: 'तिहार' },
  stories: { hi: 'लोककथाएं', hne: 'पुरखा कहानी' },
  planner: { hi: 'यात्रा योजनाकार', hne: 'घूमइ योजना' },
  search: { hi: 'खोजें', hne: 'खोजव' },
  home: { hi: 'मुखपृष्ठ', hne: 'घर' },
  destinations: { hi: 'पर्यटन स्थल', hne: 'घूमे के जगह' },
  districts: { hi: 'जिले', hne: 'जिला मन' },
};

/**
 * Look up a term in the local regional tourism glossary.
 */
export function getGlossaryTranslation(text: string, targetLocale: Locale): string | null {
  const normTarget = normalizeLocale(targetLocale);
  if (normTarget === 'en') return text;

  const key = (text || '').trim().toLowerCase();
  const entry = TOURISM_GLOSSARY[key];
  if (entry) {
    return entry[normTarget];
  }

  // Check without punctuation
  const stripped = key.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  if (TOURISM_GLOSSARY[stripped]) {
    return TOURISM_GLOSSARY[stripped][normTarget];
  }

  return null;
}
