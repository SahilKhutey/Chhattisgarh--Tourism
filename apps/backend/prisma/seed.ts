import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_DESTINATIONS = [
  {
    slug: "chitrakote-falls",
    name: "Chitrakote Waterfalls",
    categorySlug: "waterfalls",
    district: "Bastar",
    tagline: "The Majestic 'Niagara of India'",
    latitude: 19.2006,
    longitude: 81.6961,
    heroImage: "https://images.unsplash.com/photo-1432405972618-c60002a157c5?auto=format&fit=crop&w=1200&q=80",
    story: "According to ancient Bastar folk belief, the Indravati river is a mother goddess descending from the heavens. Chitrakote is where she showcases her supreme cosmic energy (Shakti). Local tribal elders narrate that during the monsoon, the heavy roar of the waterfall represents the celestial drums of Lord Shiva. The mist rising from the gorge is believed to carry the prayers of the forest spirits directly to the heavens.",
    bestTime: "July to October (Monsoon flow is jaw-dropping); November to February (Scenic emerald water)",
    safety: "Stay strictly within designated security railings. Do not attempt swimming in the base whirlpools under any conditions. Watch for wet, slippery stone structures.",
    ecoGuidance: "Chhattisgarh state environmental protection rules strictly prohibit carrying plastic water bottles or packages down to the river bank. Bring reusable flasks. Ensure zero litter is left behind to safeguard the pristine aquatic life of the Indravati.",
    audioUrl: "/audio/chitrakote_falls.mp3",
    audioNarrator: "Aarav Mandavi"
  },
  {
    slug: "sirpur-monuments",
    name: "Sirpur Heritage Complex",
    categorySlug: "temples",
    district: "Raipur",
    tagline: "Ancient Crimson Brickwork & Lost Dynasties",
    latitude: 21.3414,
    longitude: 82.1764,
    heroImage: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
    story: "Sirpur, historically known as Shripura, was the ancient capital of Panduvansh kings in the 6th century. The centerpiece, Laxman Temple, stands as one of the finest surviving brick temples in India. Constructed with intricately carved red clay bricks, it was funded by Queen Vasata in memory of her late husband. Archaeological excavations reveal that Sirpur was a major international center for Buddhist, Hindu, and Jain learning, outdating even the famous Nalanda University.",
    bestTime: "October to March (Mild weather ideal for outdoor archaeological exploration)",
    safety: "Do not touch or lean on ancient brick friezes and stone carvings. Keep voice levels low inside the hollow main sanctum to preserve its tranquil energy.",
    ecoGuidance: "Sirpur is a protected heritage zone. Do not step on ancient moss/lichen growing on brick foundations. Stay strictly on gravel walkways to prevent foundation erosion.",
    audioUrl: "/audio/sirpur_monuments.mp3",
    audioNarrator: "Devi Sahu"
  },
  {
    slug: "bhoramdeo-temple",
    name: "Bhoramdeo Temple",
    categorySlug: "temples",
    district: "Kawardha",
    tagline: "The 'Khajuraho of Chhattisgarh'",
    latitude: 22.1158,
    longitude: 81.1542,
    heroImage: "https://images.unsplash.com/photo-1582555172866-1c863b4a2e55?auto=format&fit=crop&w=1200&q=80",
    story: "Nestled in the lush Maikal Hills, Bhoramdeo was built by King Ramachandra of the Phani Nagvanshi dynasty in the 11th century. Dedicated to Lord Shiva, its design blends Nagara temple style with local tribal Gond symbolism. The temple walls are carved with incredible depictions of mythological deities, warriors, mythical beasts, and sensual carvings. It gets its name from 'Bhoramdeo', an ancient tribal deity of the Gond community who is worshipped here alongside Shiva.",
    bestTime: "November to March. The sacred Shivratri festival in March brings vibrant local fairs.",
    safety: "Monkeys inhabit the temple trees; keep foodstuffs inside zip bags. Maintain respectful attire inside the active inner sanctum.",
    ecoGuidance: "The nearby Bhoramdeo Wildlife Sanctuary is fragile. Respect quiet zones and throw all organic waste only in designated clay bins to prevent disrupting forest fauna."
  },
  {
    slug: "kanger-valley",
    name: "Kanger Valley National Park",
    categorySlug: "forests",
    district: "Bastar",
    tagline: "Pristine Sal Canopies & Subterranean Caves",
    latitude: 18.8789,
    longitude: 81.8596,
    heroImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    story: "Covering 200 sq km of dense, untouched forest, Kanger Valley is one of the most biodiverse zones in central India. It is famous for the Bastar Hill Myna (the official state bird) which can mimic human speech. The park hides ancient geological limestone formations like the Kutumsar Caves. Deep inside these damp, pitch-black chambers live unique blind and transparent fish species, adapted over millions of years of complete isolation.",
    bestTime: "November to May (Caves are accessible and wildlife spotting is highly active)",
    safety: "Never wander off marked forest trails. Kutumsar Caves have narrow crevices and low oxygen levels deep inside; visitors with breathing conditions should remain in the wider cavern halls.",
    ecoGuidance: "The caves contain delicate stalactite and stalagmite columns formed over thousands of years. Do not touch them, as oils from human skin permanently halt their crystal growth. Flashlights must be handled with care."
  },
  {
    slug: "tirathgarh-falls",
    name: "Tirathgarh Waterfalls",
    categorySlug: "waterfalls",
    district: "Bastar",
    tagline: "The Milky-White Cascade of Kanger River",
    latitude: 18.9161,
    longitude: 81.8654,
    heroImage: "https://images.unsplash.com/photo-1462206634354-94578051759d?auto=format&fit=crop&w=1200&q=80",
    story: "Tirathgarh Falls is a block-type waterfall where the Kanger River drops 300 feet in multiple layered steps. The water breaks into countless white streams, giving it a stunning milky appearance, often referred to as 'the forest queen's silk sari.' A small, ancient temple dedicated to Shiva stands on one of the rocky steps of the cascade, where hermits used to meditate amid the roaring water.",
    bestTime: "September to January (Monsoon runoff transitions to highly detailed, step-wise flows)",
    safety: "Steps leading down are extremely steep and can become slick with moss. Walk slowly and hold the handrails. Do not cross warning signs placed near deep water drop-offs.",
    ecoGuidance: "Avoid carrying disposable plastic packages. The waterfall basin is a critical habitat for unique mountain crabs and fish. Do not discard food crumbs into the water."
  },
  {
    slug: "barnawapara",
    name: "Barnawapara Wildlife Sanctuary",
    categorySlug: "forests",
    district: "Raipur",
    tagline: "Lush Teak Forests & Sanctuary of the Indian Bison",
    latitude: 21.4012,
    longitude: 82.4208,
    heroImage: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80",
    story: "Covering 244 sq km of deciduous forests, Barnawapara is named after twin forest villages: Bar and Nawa Para. Local folklore integrates this forest with the epic Ramayana; it is believed that Sage Valmiki's ashram was located here, where Luv and Kush were born. Today, it is a crucial conservation zone for the Gaur (Indian Bison), Leopards, Sloth Bears, and over 150 species of vibrant tropical birds.",
    bestTime: "November to April (Optimal foliage for mammal spotting and migratory birds)",
    safety: "Do not wear bright colors (red, white) during safaris. Remain strictly inside the safari vehicle. Never try to feed or call out to wild animals.",
    ecoGuidance: "Strict zero-noise policy inside the sanctuary boundary. Keep mobile devices on silent. Avoid flash photography as it can disorient and agitate nocturnal sloth bears."
  },
  {
    slug: "achanakmar",
    name: "Achanakmar Tiger Reserve",
    categorySlug: "forests",
    district: "Bilaspur",
    tagline: "Lost in the Sal-Teak Heartland of Central India",
    latitude: 22.5300,
    longitude: 81.8800,
    heroImage: "https://images.unsplash.com/photo-1589656966895-2f331719b5d9?auto=format&fit=crop&w=1200&q=80",
    story: "Achanakmar Tiger Reserve sprawls across the Maikal Hills, a forgotten highland corridor linking Kanha and Pench tiger reserves. Ancient tribal communities have coexisted with the forest's tigers for centuries, developing sacred groves ('Dev Vans') where no trees are ever felled. Local oral tradition holds that the spirit of the forest tiger is the guardian of the tribal boundary — its roar signals both danger and protection.",
    bestTime: "November to March (Peak wildlife activity and dry-season water pooling)",
    safety: "Stay inside safari vehicles at all times. Do not use flash photography near wildlife. Maintain strict silence near waterholes and salt licks.",
    ecoGuidance: "Achanakmar is a UNESCO-recognised biosphere reserve. Carry zero plastic. All biodegradable waste must be packed out. Leave only footprints."
  },
  {
    slug: "gangrel-dam",
    name: "Gangrel Dam & Reservoir",
    categorySlug: "waterfalls",
    district: "Dhamtari",
    tagline: "The Largest Reservoir of Chhattisgarh",
    latitude: 20.6667,
    longitude: 81.4833,
    heroImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4e0f11?auto=format&fit=crop&w=1200&q=80",
    story: "Built across the Mahanadi River, the Gangrel (Ravishankar Sagar) Dam is the largest reservoir in Chhattisgarh. It is the birthplace of the Mahanadi water story — this colossal water body feeds the plains of Odisha and sustains 40% of the state's agriculture. During the monsoon overflow discharge, the dam's spillway thunder can be heard from 5 km away, as 36 gates open simultaneously in a breathtaking water spectacle.",
    bestTime: "August to November (Monsoon overflow discharge is spectacular)",
    safety: "Do not cross safety barriers near the spillway. Strong undertow currents exist near the dam base. Children must be supervised near water edges at all times.",
    ecoGuidance: "The reservoir is a Ramsar-nominated migratory bird habitat. Do not litter or discharge cleaning agents near the water. Avoid disturbing waterfowl colonies on the southern shore islands."
  }
];

const SEED_CATEGORIES = [
  { name: "Waterfalls", slug: "waterfalls" },
  { name: "Forests & Parks", slug: "forests" },
  { name: "Historic Temples", slug: "temples" },
  { name: "Tribal Villages", slug: "villages" }
];

interface LangTranslation {
  name: string;
  description?: string;
  bestSeason?: string;
  history?: string;
  safetyInfo?: string;
  rules?: string;
}

const CATEGORY_TRANSLATIONS: Record<string, Record<string, { name: string }>> = {
  waterfalls: {
    hi: { name: "जलप्रपात" },
    cg: { name: "जलप्रपात" },
    en: { name: "Waterfalls" }
  },
  forests: {
    hi: { name: "घने जंगल" },
    cg: { name: "घने जंगल" },
    en: { name: "Forests & Parks" }
  },
  temples: {
    hi: { name: "ऐतिहासिक मंदिर" },
    cg: { name: "पुरानी मंदिर" },
    en: { name: "Historic Temples" }
  },
  villages: {
    hi: { name: "आदिवासी गाँव" },
    cg: { name: "आदिवासी गाँव" },
    en: { name: "Tribal Villages" }
  }
};

const PLACE_TRANSLATIONS: Record<string, Record<string, LangTranslation>> = {
  "chitrakote-falls": {
    hi: {
      name: "चित्रकोट जलप्रपात",
      description: "भव्य 'भारत का नियाग्रा'",
      history: "प्राचीन बस्तर लोक विश्वास के अनुसार, इंद्रावती नदी स्वर्ग से उतरने वाली एक मातृ देवी है। चित्रकोट वह जगह है जहां वह अपनी सर्वोच्च ब्रह्मांडीय ऊर्जा (शक्ति) का प्रदर्शन करती हैं। स्थानीय आदिवासी बुजुर्ग बताते हैं कि मानसून के दौरान, झरने की भारी गर्जना भगवान शिव के दिव्य डमरू का प्रतिनिधित्व करती है। कण्ठ से उठने वाला कोहरा सीधे स्वर्ग में वन आत्माओं की प्रार्थना ले जाने के लिए माना जाता है।",
      bestSeason: "जुलाई से अक्टूबर (मानसून का प्रवाह अद्भुत है); नवंबर से फरवरी (सुंदर पन्ना पानी)",
      safetyInfo: "निर्दिष्ट सुरक्षा रेलिंग के भीतर ही रहें। किसी भी परिस्थिति में बेस भंवरों में तैरने का प्रयास न करें। गीली, फिसलन वाली पत्थर की संरचनाओं से सावधान रहें।",
      rules: "छत्तीसगढ़ राज्य पर्यावरण संरक्षण नियम नदी तट पर प्लास्टिक की पानी की बोतलें या पैकेज ले जाने पर कड़ाई से प्रतिबंध लगाते हैं। पुन: प्रयोज्य फ्लास्क लाएं। इंद्रावती के प्राचीन जलीय जीवन की सुरक्षा के लिए शून्य कचरा छोड़ना सुनिश्चित करें।"
    },
    cg: {
      name: "चित्रकोट जलप्रपात",
      description: "भव्य 'भारत के नियाग्रा'",
      history: "पुराना बस्तर के पुरखा गोठ के हिसाब से, इंद्रावती नदी ह सुरग ले उतरइया एक दाई (माता) आय। चित्रकोट ओ जगह ए जिहां दाई अपन भारी शक्ति देखाथे। हमर आदिवासी सियन मन बताथें कि चौमास म, पानी गिरे के भारी आवाज ह महादेव के डमरू जइसन बाजथे। घाटी ले उठइया कोहरा ह सुरग म जंगल के देव मन तक हमर अरजी पहुंचाथे।",
      bestSeason: "जुलाई से अक्टूबर (चौमास म पानी ह भारी बहथे); नवंबर से फरवरी (हरियर गोठ जइसन पानी)",
      safetyInfo: "सुरक्षा रेलिंग के भीतर ही रहव। पानी के भंवर म झन तैरव। गीला अउ पिछलहा पथरा मन से बचके रहव।",
      rules: "छत्तीसगढ़ सरकार के पर्यावरण नियम के हिसाब से नदी तीर म प्लास्टिक के बोतल या कछरा ले जाना मना हे। अपन संग म तांबा या स्टील के बोतल लाव। नदी ला साफ रखव ताकि इंद्रावती के मछरी अउ जीव मन सुरक्षित रह सकें।"
    },
    en: {
      name: "Chitrakote Waterfalls",
      description: "The Majestic 'Niagara of India'",
      history: "According to ancient Bastar folk belief, the Indravati river is a mother goddess descending from the heavens. Chitrakote is where she showcases her supreme cosmic energy (Shakti). Local tribal elders narrate that during the monsoon, the heavy roar of the waterfall represents the celestial drums of Lord Shiva. The mist rising from the gorge is believed to carry the prayers of the forest spirits directly to the heavens.",
      bestSeason: "July to October (Monsoon flow is jaw-dropping); November to February (Scenic emerald water)",
      safetyInfo: "Stay strictly within designated security railings. Do not attempt swimming in the base whirlpools under any conditions. Watch for wet, slippery stone structures.",
      rules: "Chhattisgarh state environmental protection rules strictly prohibit carrying plastic water bottles or packages down to the river bank. Bring reusable flasks. Ensure zero litter is left behind to safeguard the pristine aquatic life of the Indravati."
    }
  },
  "sirpur-monuments": {
    hi: {
      name: "सिरपुर विरासत स्थल",
      description: "प्राचीन लाल ईंटवर्क और खोए हुए राजवंश",
      history: "सिरपुर, जिसे ऐतिहासिक रूप से श्रीपुर के नाम से जाना जाता था, छठी शताब्दी में पांडुवंशी राजाओं की प्राचीन राजधानी थी। इसका मुख्य आकर्षण लक्ष्मण मंदिर है, जो भारत में सबसे बेहतरीन बचे हुए ईंट मंदिरों में से एक है। जटिल रूप से नक्काशीदार लाल मिट्टी की ईंटों से निर्मित, इसे रानी वासटा ने अपने दिवंगत पति की स्मृति में बनवाया था। पुरातात्विक उत्खनन से पता चलता है कि सिरपुर बौद्ध, हिंदू और जैन शिक्षा का एक प्रमुख अंतरराष्ट्रीय केंद्र था, जो प्रसिद्ध नालंदा विश्वविद्यालय से भी पुराना था।",
      bestSeason: "अक्टूबर से मार्च (बाहरी पुरातात्विक अन्वेषण के लिए आदर्श मौसम)",
      safetyInfo: "प्राचीन ईंटों की नक्काशी और पत्थर की नक्काशियों को न छूएं और न ही उन पर झुकें। शांत ऊर्जा को बनाए रखने के लिए गर्भगृह के भीतर आवाज धीमी रखें।",
      rules: "सिरपुर एक संरक्षित विरासत क्षेत्र है। ईंटों की नींव पर उगने वाली प्राचीन काई को नुकसान न पहुंचाएं। नींव के क्षरण को रोकने के लिए निर्धारित पैदल मार्गों पर ही चलें।"
    },
    cg: {
      name: "सिरपुर पुरखा धरोहर",
      description: "पुराना लाल ईंट कला अउ हराय राजवंश",
      history: "सिरपुर, जेला पुराना समय म श्रीपुर कहे जाय, ६वीं सदी म पांडुवंशी राजा मन के राजधानी रहीस। सबले सुंदर मंदिर लक्ष्मण मंदिर ए, जउन ह ईंट ले बने मंदिर मन म सबले पुराना अउ जीवित हे। लाल मटी के ईंट ले सुंदर नक्काशी करके रानी वासटा ह अपन पति के सुरता म बनवाए रहीस। खुदाई म पता चले हे कि सिरपुर ह बौद्ध, हिंदू अउ जैन धरम के बड़े पढ़ाई के जगह रहीस, जउन ह नालंदा ले घलो पुराना रहीस।",
      bestSeason: "अक्टूबर से मार्च (घूमे अउ इतिहास जाने बर बढ़िया मौसम)",
      safetyInfo: "पुरानी ईंट अउ मूर्ति मन ला झन छुव अउ ओमा झन झुकव। गर्भगृह के भीतर शांत रहव अउ आवाज धीमी रखव।",
      rules: "सिरपुर ह एक सुरक्षित जगह ए। ईंट मन म उगे काई ला झन छुव। रद्दा म ही चलव ताकि पुरानी नींव ला नुकसान झन पहुंचे।"
    },
    en: {
      name: "Sirpur Heritage Complex",
      description: "Ancient Crimson Brickwork & Lost Dynasties",
      history: "Sirpur, historically known as Shripura, was the ancient capital of Panduvansh kings in the 6th century. The centerpiece, Laxman Temple, stands as one of the finest surviving brick temples in India. Constructed with intricately carved red clay bricks, it was funded by Queen Vasata in memory of her late husband. Archaeological excavations reveal that Sirpur was a major international center for Buddhist, Hindu, and Jain learning, outdating even the famous Nalanda University.",
      bestSeason: "October to March (Mild weather ideal for outdoor archaeological exploration)",
      safetyInfo: "Do not touch or lean on ancient brick friezes and stone carvings. Keep voice levels low inside the hollow main sanctum to preserve its tranquil energy.",
      rules: "Sirpur is a protected heritage zone. Do not step on ancient moss/lichen growing on brick foundations. Stay strictly on gravel walkways to prevent foundation erosion."
    }
  },
  "bhoramdeo-temple": {
    hi: {
      name: "भोरमदेव मंदिर",
      description: "छत्तीसगढ़ का 'खजुराहो'",
      history: "मैकल पहाड़ियों में बसा भोरमदेव मंदिर 11वीं शताब्दी में फणि नागवंशी राजवंश के राजा रामचंद्र द्वारा बनवाया गया था। भगवान शिव को समर्पित यह मंदिर नागर शैली और स्थानीय गोंड आदिवासी प्रतीकों का मिश्रण है। दीवारों पर देवताओं, योद्धाओं और कामुक मूर्तियां उकेरी गई हैं। इसका नाम गोंड समुदाय के प्राचीन देवता 'भोरमदेव' के नाम पर पड़ा है।",
      bestSeason: "नवंबर से मार्च। मार्च में महाशिवरात्रि पर जीवंत स्थानीय मेला लगता है।",
      safetyInfo: "बंदरों से सावधान रहें, खाद्य सामग्री बैग में रखें। गर्भगृह में मर्यादित वस्त्र पहनें।",
      rules: "भोरमदेव वन्यजीव अभयारण्य संवेदनशील क्षेत्र है। वन्यजीवों को परेशान न करें, जैविक कचरा मिट्टी के बर्तनों में ही डालें।"
    },
    cg: {
      name: "भोरमदेव मंदिर",
      description: "छत्तीसगढ़ के 'खजुराहो'",
      history: "मैकल पहाड़ म बसे भोरमदेव मंदिर ला ११वीं सदी म फणि नागवंशी राजा रामचंद्र ह बनवाए रहीस। महादेव ला समर्पित ये मंदिर नागर कला अउ गोंड आदिवासी चिन्ह मन के सुंदर मेल ए। मंदिर के दीवार म भगवान, वीर अउ सुंदर मूर्ति बने हे। गोंड समाज के पुरखा देव 'भोरमदेव' के नाम म ये मंदिर के नाम रखे गे हे।",
      bestSeason: "नवंबर से मार्च। मार्च म महाशिवरात्रि म भारी मेला भराथे।",
      safetyInfo: "बंदर मन ले बचके रहव, खइया सामान ला बैग म रखव। मंदिर म ढंग के कपड़ा पहिर के जाव।",
      rules: "भोरमदेव जंगल ह बहुत संवेदनशील ए। हल्ला झन करव, कचरा ला माटी के डब्बा म ही डांड़व।"
    },
    en: {
      name: "Bhoramdeo Temple",
      description: "The 'Khajuraho of Chhattisgarh'",
      history: "Nestled in the lush Maikal Hills, Bhoramdeo was built by King Ramachandra of the Phani Nagvanshi dynasty in the 11th century. Dedicated to Lord Shiva, its design blends Nagara temple style with local tribal Gond symbolism. The temple walls are carved with incredible depictions of mythological deities, warriors, mythical beasts, and sensual carvings. It gets its name from 'Bhoramdeo', an ancient tribal deity of the Gond community who is worshipped here alongside Shiva.",
      bestSeason: "November to March. The sacred Shivratri festival in March brings vibrant local fairs.",
      safetyInfo: "Monkeys inhabit the temple trees; keep foodstuffs inside zip bags. Maintain respectful attire inside the active inner sanctum.",
      rules: "The nearby Bhoramdeo Wildlife Sanctuary is fragile. Respect quiet zones and throw all organic waste only in designated clay bins to prevent disrupting forest fauna."
    }
  },
  "kanger-valley": {
    hi: {
      name: "कांगेर घाटी राष्ट्रीय उद्यान",
      description: "साल वन और भूमिगत गुफाएं",
      history: "200 वर्ग किमी में फैला कांगेर घाटी मध्य भारत के सबसे जैव-विविधता वाले क्षेत्रों में से एक है। यह बस्तर पहाड़ी मैना (राजकीय पक्षी) के लिए प्रसिद्ध है जो इंसानों की नकल कर सकती है। यहाँ कुटुमसर जैसी चूना पत्थर की गुफाएं हैं जहाँ बिना आंखों वाली अनोखी मछलियां पाई जाती हैं।",
      bestSeason: "नवंबर से मई (गुफाएं खुली रहती हैं और वन्यजीव सक्रिय रहते हैं)",
      safetyInfo: "चिह्नित रास्तों से अलग न जाएं। कुटुमसर गुफाओं में ऑक्सीजन की कमी हो सकती है; सांस के रोगी प्रवेश न करें।",
      rules: "गुफा की आकृतियां (स्टैलेक्टाइट) छूने से उनकी वृद्धि रुक जाती है। उन्हें न छूएं। टॉर्च सावधानी से जलाएं।"
    },
    cg: {
      name: "कांगेर घाटी राष्ट्रीय उद्यान",
      description: "साल जंगल अउ भीतर के गुफा मन",
      history: "२०० वर्ग किमी म फैले कांगेर घाटी ह मध्य भारत के सबले सुंदर जंगल ए। ये हमर राजकीय चिरई 'बस्तर पहाड़ी मैना' बर प्रसिद्ध हे जउन ह मनुख जइसन बोलथे। इहाँ कुटुमसर जइसन चूना पत्थर के गुफा हे जिहां बिना आंखी के अनोखी मछरी मन रहथें।",
      bestSeason: "नवंबर से मई (गुफा मन खुले रहथें अउ जंगली जीव देखथें)",
      safetyInfo: "जंगल के मुख्य रद्दा ले अलग झन जाव। कुटुमसर गुफा के भीतर ऑक्सीजन कम हो सकथे, दमा के मरीज भीतर झन जाव।",
      rules: "गुफा के भीतर बने चूना पत्थर के खंभा मन ला झन छुव, हाथ लगाए से ओ मन बढ़ना बंद हो जाथें। टॉर्च ला संभाल के जलाओ।"
    },
    en: {
      name: "Kanger Valley National Park",
      description: "Pristine Sal Canopies & Subterranean Caves",
      history: "Covering 200 sq km of dense, untouched forest, Kanger Valley is one of the most biodiverse zones in central India. It is famous for the Bastar Hill Myna (the official state bird) which can mimic human speech. The park hides ancient geological limestone formations like the Kutumsar Caves. Deep inside these damp, pitch-black chambers live unique blind and transparent fish species, adapted over millions of years of complete isolation.",
      bestSeason: "November to May (Caves are accessible and wildlife spotting is highly active)",
      safetyInfo: "Never wander off marked forest trails. Kutumsar Caves have narrow crevices and low oxygen levels deep inside; visitors with breathing conditions should remain in the wider cavern halls.",
      rules: "The caves contain delicate stalactite and stalagmite columns formed over thousands of years. Do not touch them, as oils from human skin permanently halt their crystal growth. Flashlights must be handled with care."
    }
  },
  "tirathgarh-falls": {
    hi: {
      name: "तीरथगढ़ जलप्रपात",
      description: "कांगेर नदी की दूधिया जलधारा",
      history: "तीरथगढ़ जलप्रपात में कांगेर नदी 300 फीट की ऊंचाई से कई सीढ़ियों में गिरती है। पानी दूधिया सफेद दिखाई देता है, जिसे 'वन रानी की रेशमी साड़ी' कहा जाता है। चट्टानों पर भगवान शिव का एक प्राचीन मंदिर है जहाँ साधु तपस्या करते थे।",
      bestSeason: "सितंबर से जनवरी (सीढ़ीदार झरने का सुंदर प्रवाह)",
      safetyInfo: "नीचे जाने वाली सीढ़ियां बेहद खड़ी और फिसलन भरी हैं। धीरे चलें और रेलिंग पकड़ें। खतरे के संकेतों को पार न करें।",
      rules: "कांगेर घाटी राष्ट्रीय उद्यान में प्लास्टिक ले जाना वर्जित है। झरना क्षेत्र केकड़ों और मछलियों का आवास है। पानी में भोजन के टुकड़े न फेंकें।"
    },
    cg: {
      name: "तीरथगढ़ जलप्रपात",
      description: "कांगेर नदी के दूध जइसन पानी",
      history: "तीरथगढ़ झरना म कांगेर नदी ह ३०० फीट ऊपर ले सीढ़ी जइसन गिरथे। पानी ह दूध जइसन सफेद दिखथे, जेला 'जंगल के रानी के रेशमी साड़ी' घलो कहे जाथे। चट्टान म महादेव के एक पुराना मंदिर हे जिहां साधु मन तपस्या करत रहीन।",
      bestSeason: "सितंबर से जनवरी (सीढ़ी जइसन गिरत पानी ह बहुत सुंदर दिखथे)",
      safetyInfo: "नीचे जाय के सीढ़ी मन बहुत खड़ी अउ पिछलहा हे। धीरे-धीरे जाव अउ रेलिंग ला धरव। चेतावनी बोर्ड ला पार झन करव।",
      rules: "प्लास्टिक ले जाना मना हे। झरना तीर म केकड़ा अउ मछरी मन रहथें, पानी म खइया सामान झन फेंकव।"
    },
    en: {
      name: "Tirathgarh Waterfalls",
      description: "The Milky-White Cascade of Kanger River",
      history: "Tirathgarh Falls is a block-type waterfall where the Kanger River drops 300 feet in multiple layered steps. The water breaks into countless white streams, giving it a stunning milky appearance, often referred to as 'the forest queen's silk sari.' A small, ancient temple dedicated to Shiva stands on one of the rocky steps of the cascade, where hermits used to meditate amid the roaring water.",
      bestSeason: "September to January (Monsoon runoff transitions to highly detailed, step-wise flows)",
      safetyInfo: "Steps leading down are extremely steep and can become slick with moss. Walk slowly and hold the handrails. Do not cross warning signs placed near deep water drop-offs.",
      rules: "Avoid carrying disposable plastic packages. The waterfall basin is a critical habitat for unique mountain crabs and fish. Do not discard food crumbs into the water."
    }
  },
  "barnawapara": {
    hi: {
      name: "बारनवापारा वन्यजीव अभयारण्य",
      description: "सागौन वन और गौर (भारतीय बायसन) का निवास",
      history: "244 वर्ग किमी में फैला बारनवापारा सागौन वनों के लिए प्रसिद्ध है। लोककथाओं के अनुसार यहाँ महर्षि वाल्मीकि का आश्रम था जहाँ लव और कुश का जन्म हुआ था। आज यह गौर, तेंदुए और भालू का प्रमुख संरक्षण क्षेत्र है।",
      bestSeason: "नवंबर से अप्रैल (वन्यजीवों को देखने के लिए सर्वोत्तम)",
      safetyInfo: "सफारी के दौरान चमकीले कपड़े न पहनें। वाहन के भीतर ही रहें। वन्यजीवों को खाना खिलाने का प्रयास न करें।",
      rules: "अभयारण्य में शांत रहें। मोबाइल साइलेंट रखें। भालूओं को परेशान होने से बचाने के लिए फ्लैश फोटोग्राफी से बचें।"
    },
    cg: {
      name: "बारनवापारा वन्यजीव अभयारण्य",
      description: "सागौन जंगल अउ गौर (बनभैंसा) के घर",
      history: "२४४ वर्ग किमी म फैले बारनवापारा सागौन जंगल बर प्रसिद्ध हे। पुरखा गोठ के हिसाब से इहाँ महर्षि वाल्मीकि के आश्रम रहीस जिहां लव अउ कुश जनम धरे रहीन। आज इहाँ गौर, चीता अउ भालू मन सुरक्षित रहथें।",
      bestSeason: "नवंबर से अप्रैल (जंगली जानवर देखे बर बढ़िया मौसम)",
      safetyInfo: "सफारी के समय भड़कीला कपड़ा झन पहिरव। गाड़ी के भीतर ही रहव। जानवर मन ला खइया झन देव।",
      rules: "जंगल म शांत रहव। मोबाइल ला साइलेंट रखव। भालू मन डर जाथें, ओकर तीर म फ्लैश लाइट झन मारव।"
    },
    en: {
      name: "Barnawapara Wildlife Sanctuary",
      description: "Lush Teak Forests & Sanctuary of the Indian Bison",
      history: "Covering 244 sq km of deciduous forests, Barnawapara is named after twin forest villages: Bar and Nawa Para. Local folklore integrates this forest with the epic Ramayana; it is believed that Sage Valmiki's ashram was located here, where Luv and Kush were born. Today, it is a crucial conservation zone for the Gaur (Indian Bison), Leopards, Sloth Bears, and over 150 species of vibrant tropical birds.",
      bestSeason: "November to April (Optimal foliage for mammal spotting and migratory birds)",
      safetyInfo: "Do not wear bright colors (red, white) during safaris. Remain strictly inside the safari vehicle. Never try to feed or call out to wild animals.",
      rules: "Strict zero-noise policy inside the sanctuary boundary. Keep mobile devices on silent. Avoid flash photography as it can disorient and agitate nocturnal sloth bears."
    }
  },
  "achanakmar": {
    hi: {
      name: "अचानकमार टाइगर रिजर्व",
      description: "साल-सागौन के जंगलों का दिल",
      history: "अचानकमार टाइगर रिजर्व मैकल पहाड़ियों में फैला है। आदिवासियों ने 'देव वन' (पवित्र उपवन) विकसित किए हैं जहाँ पेड़ काटना वर्जित है। शेर के दहाड़ की आवाज को जंगल के संरक्षक के रूप में माना जाता है।",
      bestSeason: "नवंबर से मार्च (सूखे मौसम में वन्यजीवों की सक्रियता)",
      safetyInfo: "सफारी वाहनों के अंदर ही रहें। वन्यजीवों के पास फ्लैश फोटोग्राफी का उपयोग न करें। जलस्रोतों के पास पूर्ण शांति बनाए रखें।",
      rules: "अचानकमार एक यूनेस्को मान्यता प्राप्त बायोस्फीयर रिजर्व है। प्लास्टिक बिल्कुल न ले जाएं। अपना कचरा वापस लाएं।"
    },
    cg: {
      name: "अचानकमार टाइगर रिजर्व",
      description: "साल-सागौन जंगल के दिल",
      history: "अचानकमार टाइगर रिजर्व ह मैकल पहाड़ म फैले हे। इहाँ के आदिवासी मन सदियों से शेर मन के संग रहत आए हे अउ 'देव वन' बनाए हे जिहां पेड़ काटना पाप माने जाथे।",
      bestSeason: "नवंबर से मार्च (पानी तीर म जानवर मन देखथें)",
      safetyInfo: "सफारी गाड़ी के भीतर ही रहव। शेर मन के तीर म फ्लैश झन मारव। पानी घाट तीर म एकदम शांत रहव।",
      rules: "अचानकमार ह यूनेस्को द्वारा मान्यता प्राप्त जंगल ए। प्लास्टिक झन ले जाव। अपन कचरा ला वापस धरके लाव।"
    },
    en: {
      name: "Achanakmar Tiger Reserve",
      description: "Lost in the Sal-Teak Heartland of Central India",
      history: "Achanakmar Tiger Reserve sprawls across the Maikal Hills, a forgotten highland corridor linking Kanha and Pench tiger reserves. Ancient tribal communities have coexisted with the forest's tigers for centuries, developing sacred groves ('Dev Vans') where no trees are ever felled. Local oral tradition holds that the spirit of the forest tiger is the guardian of the tribal boundary — its roar signals both danger and protection.",
      bestSeason: "November to March (Peak wildlife activity and dry-season water pooling)",
      safetyInfo: "Stay inside safari vehicles at all times. Do not use flash photography near wildlife. Maintain strict silence near waterholes and salt licks.",
      rules: "Achanakmar is a UNESCO-recognised biosphere reserve. Carry zero plastic. All biodegradable waste must be packed out. Leave only footprints."
    }
  },
  "gangrel-dam": {
    hi: {
      name: "गंगरेल बांध और जलाशय",
      description: "छत्तीसगढ़ का सबसे बड़ा जलाशय",
      history: "महानदी नदी पर बना गंगरेल बांध छत्तीसगढ़ का सबसे बड़ा बांध है। यह जलाशय राज्य के कृषि क्षेत्र को सिंचित करता है। मानसून के दौरान इसके 36 गेट एक साथ खोले जाने पर भारी गर्जना सुनाई देती है।",
      bestSeason: "अगस्त से नवंबर (मानसून के समय पानी का बहाव शानदार होता है)",
      safetyInfo: "स्पिलवे के पास सुरक्षा घेरे को पार न करें। पानी के पास बच्चों की कड़ी निगरानी रखें।",
      rules: "जलाशय प्रवासी पक्षियों का निवास स्थान है। पानी के पास कचरा न फेंकें। दक्षिणी द्वीपों पर पक्षियों को परेशान न करें।"
    },
    cg: {
      name: "गंगरेल बांध अउ जलाशय",
      description: "छत्तीसगढ़ के सबले बड़े बांध",
      history: "महानदी म बने गंगरेल बांध ह छत्तीसगढ़ के सबले बड़े बांध ए। ये बांध के पानी ह हमर खेती-खार बर बहुत जरूरी ए। चौमास म जब ३६ फाटक एक साथ खुलथें, तो ५ किमी दूर तक गर्जना सुनाई देथे।",
      bestSeason: "अगस्त से नवंबर (फाटक खुले के समय पानी देखना बहुत सुंदर दिखथे)",
      safetyInfo: "फाटक तीर म सुरक्षा घेरा ला पार झन करव। पानी तीर म लइका मन के ध्यान रखव।",
      rules: "ये बांध म दूर-दूर से चिरई मन आथें। पानी तीर म कचरा झन फेंकव। चिरई मन ला परेशान झन करव।"
    },
    en: {
      name: "Gangrel Dam & Reservoir",
      description: "The Largest Reservoir of Chhattisgarh",
      history: "Built across the Mahanadi River, the Gangrel (Ravishankar Sagar) Dam is the largest reservoir in Chhattisgarh. It is the birthplace of the Mahanadi water story — this colossal water body feeds the plains of Odisha and sustains 40% of the state's agriculture. During the monsoon overflow discharge, the dam's spillway thunder can be heard from 5 km away, as 36 gates open simultaneously in a breathtaking water spectacle.",
      bestSeason: "August to November (Monsoon overflow discharge is spectacular)",
      safetyInfo: "Do not cross safety barriers near the spillway. Strong undertow currents exist near the dam base. Children must be supervised near water edges at all times.",
      rules: "The reservoir is a Ramsar-nominated migratory bird habitat. Do not litter or discharge cleaning agents near the water. Avoid disturbing waterfowl colonies on the southern shore islands."
    }
  }
};

async function main() {
  console.log('Starting seed operations for CG Tourism database...');

  // 1. Clear existing records to ensure clean slate transitions
  await prisma.bookmark.deleteMany();
  await prisma.review.deleteMany();
  await prisma.media.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.place.deleteMany();
  await prisma.category.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned database tables successfully.');

  // 2. Create User Accounts
  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('SuperSecureAdminPassword2026!', saltRounds);
  const creatorPasswordHash = await bcrypt.hash('SuperSecureCreatorPassword2026!', saltRounds);

  const adminUser = await prisma.user.create({
    data: {
      fullName: 'Chhattisgarh Tourism Administrator',
      email: 'admin@cgtourism.gov.in',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const creatorUser = await prisma.user.create({
    data: {
      fullName: 'Aarav Mandavi',
      email: 'aarav.creator@cgtourism.org',
      password: creatorPasswordHash,
      role: 'CREATOR',
    },
  });

  // 3. Create Creator Profile
  await prisma.creatorProfile.create({
    data: {
      userId: creatorUser.id,
      verified: true,
      bio: 'Bastar-based explorer and folklore preservation volunteer.',
      instagram: 'aarav_bastar_explore',
      youtube: 'BastarWanderer',
    },
  });

  console.log('Created basic User and Creator profiles.');

  // 4. Create Travel Categories and build mapping cache
  const categoryCache: { [slug: string]: string } = {};
  for (const cat of SEED_CATEGORIES) {
    const createdCat = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug }
    });
    categoryCache[cat.slug] = createdCat.id;

    // Seed translations for categories
    const catTranslations = CATEGORY_TRANSLATIONS[cat.slug];
    if (catTranslations) {
      for (const lang of ['en', 'hi', 'cg']) {
        const trans = catTranslations[lang];
        if (trans) {
          await prisma.translation.create({
            data: {
              lang,
              entityType: 'Category',
              entityId: createdCat.id,
              field: 'name',
              value: trans.name
            }
          });
        }
      }
    }
  }
  console.log('Populated travel categories and their translations successfully.');

  // 5. Populate Landmark Destinations
  for (const destination of SEED_DESTINATIONS) {
    const categoryId = categoryCache[destination.categorySlug];
    if (!categoryId) {
      console.warn(`Category mapping failed for category slug: ${destination.categorySlug}`);
      continue;
    }

    const createdPlace = await prisma.place.create({
      data: {
        slug: destination.slug,
        name: destination.name,
        description: destination.tagline,
        district: destination.district,
        categoryId: categoryId,
        latitude: destination.latitude,
        longitude: destination.longitude,
        heroImage: destination.heroImage,
        bestSeason: destination.bestTime,
        history: destination.story,
        safetyInfo: destination.safety,
        rules: destination.ecoGuidance,
        audioUrl: (destination as any).audioUrl || null,
        audioNarrator: (destination as any).audioNarrator || null,
        verified: true,
      }
    });

    // Seed translations for places
    const placeTrans = PLACE_TRANSLATIONS[destination.slug];
    if (placeTrans) {
      for (const lang of ['en', 'hi', 'cg']) {
        const trans = placeTrans[lang];
        if (trans) {
          const fields: Array<keyof LangTranslation> = [
            'name',
            'description',
            'bestSeason',
            'history',
            'safetyInfo',
            'rules'
          ];
          for (const field of fields) {
            const val = trans[field];
            if (val !== undefined) {
              await prisma.translation.create({
                data: {
                  lang,
                  entityType: 'Place',
                  entityId: createdPlace.id,
                  field,
                  value: val
                }
              });
            }
          }
        }
      }
    }

    // Seed initial media mapping
    await prisma.media.create({
      data: {
        url: destination.heroImage,
        type: 'IMAGE',
        placeId: createdPlace.id,
      }
    });

    // Seed mock reviews for first few items
    if (destination.slug === 'chitrakote-falls') {
      await prisma.review.create({
        data: {
          rating: 5,
          comment: 'Absolutely breathtaking! The roar of Chitrakote during late August is a spiritual experience.',
          userId: creatorUser.id,
          placeId: createdPlace.id,
        }
      });
    }
  }

  console.log('Seeded all 8 landmark destinations and translations successfully.');
  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error occurred during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
