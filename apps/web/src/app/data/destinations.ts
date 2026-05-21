export interface Destination {
  id: string;
  name: string;
  category: 'waterfalls' | 'forests' | 'temples' | 'villages';
  district?: string;
  tagline: string;
  coordinates: { lat: number; lng: number; mapX: number; mapY: number }; // mapX/Y relative percentage coordinates for a beautiful offline SVG vector map!
  heroImage: string;
  storyTitle: string;
  story: string;
  timings: string;
  routes: string;
  bestTime: string;
  seasonalAdvice: string;
  safety: string;
  nearby: string[];
  localInsights: string;
  ecoGuidance: string;
  biodiversityScore: number;
  crowdCapacity: number;
  rating: number;
  localFood: string;
  photographySpots: string;

  // Localized Properties
  name_hi?: string;
  name_cg?: string;
  tagline_hi?: string;
  tagline_cg?: string;
  storyTitle_hi?: string;
  storyTitle_cg?: string;
  story_hi?: string;
  story_cg?: string;
  timings_hi?: string;
  timings_cg?: string;
  routes_hi?: string;
  routes_cg?: string;
  bestTime_hi?: string;
  bestTime_cg?: string;
  seasonalAdvice_hi?: string;
  seasonalAdvice_cg?: string;
  safety_hi?: string;
  safety_cg?: string;
  localInsights_hi?: string;
  localInsights_cg?: string;
  ecoGuidance_hi?: string;
  ecoGuidance_cg?: string;
  localFood_hi?: string;
  localFood_cg?: string;
  photographySpots_hi?: string;
  photographySpots_cg?: string;
}

export const DESTINATIONS: Destination[] = [
  {
    id: "chitrakote-falls",
    name: "Chitrakote Waterfalls",
    category: "waterfalls",
    district: "Bastar",
    tagline: "The Majestic 'Niagara of India'",
    coordinates: { lat: 19.2006, lng: 81.6961, mapX: 42, mapY: 78 },
    heroImage: "https://images.unsplash.com/photo-1432405972618-c60002a157c5?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Legend of the Indravati Descent",
    story: "According to ancient Bastar folk belief, the Indravati river is a mother goddess descending from the heavens. Chitrakote is where she showcases her supreme cosmic energy (Shakti). Local tribal elders narrate that during the monsoon, the heavy roar of the waterfall represents the celestial drums of Lord Shiva. The mist rising from the gorge is believed to carry the prayers of the forest spirits directly to the heavens.",
    timings: "08:00 AM - 06:00 PM (Everyday)",
    routes: "Located 38 km west of Jagdalpur town. Connect via NH-30 from Raipur. Taxis and regular state transit buses operate daily.",
    bestTime: "July to October (Monsoon flow is jaw-dropping); November to February (Scenic emerald water)",
    seasonalAdvice: "Monsoon offers unparalleled wild grandeur but limits boating in the pool below. Winter offers calm, crystal waters perfect for canyon photography.",
    safety: "Stay strictly within designated security railings. Do not attempt swimming in the base whirlpools under any conditions. Watch for wet, slippery stone structures.",
    nearby: ["Tirathgarh Falls", "Kutumsar Caves", "Bastar Tribal Villages"],
    localInsights: "Visit the local boatmen who belong to the fishing community; they tell secret tales of hidden caves behind the roaring wall of water. Be sure to witness the sunset over the horseshoe gorge from the southern viewpoints.",
    ecoGuidance: "Chhattisgarh state environmental protection rules strictly prohibit carrying plastic water bottles or packages down to the river bank. Bring reusable flasks. Ensure zero litter is left behind to safeguard the pristine aquatic life of the Indravati.",
    biodiversityScore: 92,
    crowdCapacity: 1200,
    rating: 4.9,
    localFood: "Chapotda (Bastar Red Ant Chutney, renowned for its organic tang), Roasted Mahua flowers, and freshly brewed local Salphi nectar.",
    photographySpots: "The Southern Horseshoe Outlook at 5:30 PM (captures golden hour rays piercing the water curtain), and the base boat terminal for high-angle shots.",
    
    // Hindi Localized properties
    name_hi: "चित्रकोट जलप्रपात",
    tagline_hi: "भव्य 'भारत का नियाग्रा'",
    storyTitle_hi: "इन्द्रावती के अवतरण की लोककथा",
    story_hi: "बस्तर की प्राचीन लोक मान्यता के अनुसार, इन्द्रावती नदी एक देवी माँ हैं जो स्वर्ग से अवतरित हुई हैं। चित्रकोट वह स्थान है जहाँ वह अपनी सर्वोच्च ब्रह्मांडीय ऊर्जा (शक्ति) का प्रदर्शन करती हैं। स्थानीय आदिवासी बुजुर्ग बताते हैं कि मानसून के दौरान, जलप्रपात की गर्जना भगवान शिव के डमरू की ध्वनि को दर्शाती है। घाटी से उठने वाला कोहरा सीधे स्वर्ग तक वन आत्माओं की प्रार्थनाओं को ले जाता है।",
    timings_hi: "सुबह 08:00 - शाम 06:00 (प्रतिदिन)",
    routes_hi: "जगदलपुर शहर से 38 किमी पश्चिम में स्थित। रायपुर से NH-30 द्वारा जुड़ें। टैक्सी और नियमित राज्य परिवहन बसें प्रतिदिन चलती हैं।",
    bestTime_hi: "जुलाई से अक्टूबर (मानसून के समय बहाव अद्भुत होता है); नवंबर से फरवरी (सुंदर पन्ना जैसा पानी)",
    seasonalAdvice_hi: "मानसून बेजोड़ भव्यता प्रदान करता है लेकिन नीचे नाव चलाना प्रतिबंधित रहता है। शीतकाल शांत, साफ पानी प्रदान करता है जो फोटोग्राफी के लिए एकदम सही है।",
    safety_hi: "निर्धारित सुरक्षा रेलिंग के भीतर रहें। किसी भी परिस्थिति में नीचे भंवर में तैरने का प्रयास न करें। गीली, फिसलन भरी पत्थरों पर सावधानी बरतें।",
    localInsights_hi: "स्थानीय नाविकों से मिलें जो मछुआरा समुदाय से हैं; वे गर्जना करते पानी के पीछे छिपी गुफाओं की गुप्त कहानियाँ सुनाते हैं। दक्षिणी दृष्टिकोण से सूर्यास्त देखना न भूलें।",
    ecoGuidance_hi: "पर्यावरण नियमों के तहत नीचे नदी तट पर प्लास्टिक की बोतलें या पैकेट ले जाना सख्त प्रतिबंधित है। पुन: प्रयोज्य बोतलों का उपयोग करें। इन्द्रावती के जलीय जीवन की रक्षा के लिए शून्य कचरा सुनिश्चित करें।",
    localFood_hi: "चापड़ा (बस्तर की लाल चींटी की चटनी, अपने खट्टे स्वाद के लिए प्रसिद्ध), भुने हुए महुआ के फूल और ताज़ा स्थानीय सल्फी रस।",
    photographySpots_hi: "शाम 5:30 बजे दक्षिणी व्यूपॉइंट (पानी के पर्दे को चीरती हुई सुनहरी किरणें कैद होती हैं), और नाव घाट।",

    // Chhattisgarhi Localized properties
    name_cg: "चित्रकोट जलप्रपात",
    tagline_cg: "भव्य 'भारत के नियाग्रा' झरना",
    storyTitle_cg: "इन्द्रावती मइया के पुरखा गोठ",
    story_cg: "बस्तर के पुरखा लोककथा के अनुसार, इन्द्रावती नदी ह स्वर्ग ले उतरत मइया दाई ए। चित्रकोट ओ जगह ए जहाँ ओ अपन मयारू अउ सबले बड़े शक्ति ला देखाथे। हमर आदिवासी सियन मन बताथें कि चौमास म जब पानी ह गरजय, त ओला भगवान शिव जी के डमरू बाजत हे कहे जाथे। घाटी से उठत कोहरा ह जंगल के देवी-देवता मन के संदेसा ला सीधे भगवान तक पहुंचाथे।",
    timings_cg: "बिहनिया 08:00 - संझा 06:00 (रोज)",
    routes_cg: "जगदलपुर शहर से 38 किमी पश्चिम म हे। रायपुर से NH-30 के रद्दा ले आ जाही। टैक्सी अउ सरकारी बस रोज चलथे।",
    bestTime_cg: "जुलाई से अक्टूबर (चौमास के पानी ह देखइ लायक रहिथे); नवंबर से फरवरी (मयारू सुंदर पानी)",
    seasonalAdvice_cg: "चौमास म पानी ह सबले सुंदर दिखथे पर डोंगा (नाव) चलाना बंद रहिथे। ठंड के दिन म शांत अउ साफ पानी रहिथे, फोटो खींचे बर बढ़िया दिन ए।",
    safety_cg: "सुरक्षा रेलिंग के भीतर रहव। पानी म तैरे के कोसिस झन करव, पानी ह बहुत गहरा हे। गीला पत्थर म सावधानी से चलव।",
    localInsights_cg: "तीर के केवट भाई मन से गोठ-बात करव; मन पानी के पीछे लुकाय गुफा मन के कहानी बताथें। संझा के समय सुरुज डूबत देखना झन भूलव।",
    ecoGuidance_cg: "पर्यावरण नियम के हिसाब से नदी तीर म प्लास्टिक के बोतल या पैकेट ले जाना मना हे। अपन संग पानी बोतल लाव। नदी ला साफ रखव ताकि मछली अउ जलीय जीव सुरक्षित रह सकें।",
    localFood_cg: "चापड़ा चटनी (बस्तर के लाल चिटी के चटनी, खट्टा स्वाद बर प्रसिद्ध हे), भुने महुआ फूल अउ ताजा सल्फी रस।",
    photographySpots_cg: "संझा 5:30 बजे दक्षिणी व्यूपॉइंट (जब सुरुज के किरण ह पानी ला चीरके निकलथे) अउ डोंगा घाट।"
  },
  {
    id: "sirpur-monuments",
    name: "Sirpur Heritage Complex",
    category: "temples",
    district: "Raipur",
    tagline: "Ancient Crimson Brickwork & Lost Dynasties",
    coordinates: { lat: 21.3414, lng: 82.1764, mapX: 62, mapY: 42 },
    heroImage: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Sacred Red Clay Architecture",
    story: "Sirpur, historically known as Shripura, was the ancient capital of Panduvansh kings in the 6th century. The centerpiece, Laxman Temple, stands as one of the finest surviving brick temples in India. Constructed with intricately carved red clay bricks, it was funded by Queen Vasata in memory of her late husband. Archaeological excavations reveal that Sirpur was a major international center for Buddhist, Hindu, and Jain learning, outdating even the famous Nalanda University.",
    timings: "07:00 AM - 06:00 PM (Everyday)",
    routes: "Located 80 km east of Raipur capital. Easily accessible via a well-paved 2-hour drive on National Highway 53.",
    bestTime: "October to March (Mild weather ideal for outdoor archaeological exploration)",
    seasonalAdvice: "Summers in the plains can reach high temperatures; carry wide-brimmed hats and stay hydrated. Winter brings the Sirpur National Dance Festival.",
    safety: "Do not touch or lean on ancient brick friezes and stone carvings. Keep voice levels low inside the hollow main sanctum to preserve its tranquil energy.",
    nearby: ["Barnawapara Sanctuary", "Raipur Museum", "Bhoramdeo Temple"],
    localInsights: "Walk slightly past the main temples to discover the partially excavated underground market complex and assembly halls. The symmetry of these 1400-year-old structures is a marvelous feat of ancient systems design.",
    ecoGuidance: "Sirpur is a protected heritage zone. Do not step on ancient moss/lichen growing on brick foundations. Stay strictly on gravel walkways to prevent foundation erosion.",
    biodiversityScore: 78,
    crowdCapacity: 600,
    rating: 4.8,
    localFood: "Traditional Chila (rice flour crepes) served with sweet tomato-chili chutney, and local green leafy stews (Bhaji).",
    photographySpots: "The front courtyard of Laxman Temple at 07:30 AM (when morning light accentuates the crimson brick carvings perfectly), and the Buddhist Vihara ruins.",

    // Hindi Localized properties
    name_hi: "सिरपुर विरासत समूह",
    tagline_hi: "प्राचीन लाल ईंट वास्तुकला और खोए हुए राजवंश",
    storyTitle_hi: "पवित्र लाल मिट्टी की वास्तुकला",
    story_hi: "सिरपुर, जिसे ऐतिहासिक रूप से श्रीपुर के नाम से जाना जाता था, छठी शताब्दी में पांडुवंशी राजाओं की प्राचीन राजधानी थी। इसका मुख्य आकर्षण, लक्ष्मण मंदिर, भारत में जीवित बचे बेहतरीन ईंट मंदिरों में से एक है। जटिल रूप से नक्काशीदार लाल मिट्टी की ईंटों से निर्मित, इसे रानी वसाटा ने अपने दिवंगत पति की स्मृति में बनवाया था। पुरातात्विक खुदाई से पता चलता है कि सिरपुर बौद्ध, हिंदू और जैन शिक्षा का एक प्रमुख अंतरराष्ट्रीय केंद्र था, जो प्रसिद्ध नालंदा विश्वविद्यालय से भी पुराना है।",
    timings_hi: "सुबह 07:00 - शाम 06:00 (प्रतिदिन)",
    routes_hi: "रायपुर राजधानी से 80 किमी पूर्व में स्थित। राष्ट्रीय राजमार्ग 53 पर 2 घंटे की अच्छी सड़क यात्रा द्वारा आसानी से पहुंचा जा सकता है।",
    bestTime_hi: "अक्टूबर से मार्च (बाहरी पुरातात्विक अन्वेषण के लिए आदर्श मौसम)",
    seasonalAdvice_hi: "मैदानी इलाकों में गर्मियों में तापमान काफी बढ़ सकता है; चौड़े किनारे वाली टोपी साथ रखें और पानी पीते रहें। सर्दियों में सिरपुर राष्ट्रीय नृत्य महोत्सव का आयोजन होता है।",
    safety_hi: "प्राचीन ईंटों और पत्थरों की नक्काशी को न छुएं और न ही उन पर सहारा लें। शांत वातावरण बनाए रखने के लिए मुख्य गर्भगृह के भीतर आवाज नीची रखें।",
    localInsights_hi: "आंशिक रूप से खुदाई किए गए भूमिगत बाजार परिसर और विधानसभा हॉलों की खोज के लिए मुख्य मंदिरों से थोड़ा आगे चलें। इन 1400 साल पुरानी संरचनाओं की समरूपता प्राचीन इंजीनियरिंग का एक अद्भुत नमूना है।",
    ecoGuidance_hi: "सिरपुर एक संरक्षित विरासत क्षेत्र है। ईंटों की नींव पर उगने वाले काई/लाइकेन पर कदम न रखें। नींव के क्षरण को रोकने के लिए केवल बजरी वाले रास्तों पर चलें।",
    localFood_hi: "पारंपरिक चीला (चावल के आटे के क्रेप्स) जिसे मीठी टमाटर-मिर्च की चटनी और स्थानीय हरी पत्तेदार भाजी के साथ परोसा जाता है।",
    photographySpots_hi: "सुबह 07:30 बजे लक्ष्मण मंदिर का सामने का प्रांगण (जब सुबह की रोशनी लाल ईंटों की नक्काशी को निखारती है) और बौद्ध विहार के अवशेष।",

    // Chhattisgarhi Localized properties
    name_cg: "सिरपुर धरोहर क्षेत्र",
    tagline_cg: "पुराना लाल ईंट के मंदिर अउ खोय राजवंश",
    storyTitle_cg: "मयारू लाल माटी के वास्तुकला",
    story_cg: "सिरपुर, जेला पुराना समय म श्रीपुर कहे जाय, छठी शताब्दी म पांडुवंशी राजा मन के राजधानी रहीस। लक्ष्मण मंदिर ह ईंट ले बने सबले सुंदर मंदिर म से एक ए। एकर निर्माण रानी वसाटा ह अपन दिवंगत पति के याद म कराय रहीस। खुदाई ले पता चलिथे कि सिरपुर ह बौद्ध, हिंदू अउ जैन धरम के पढ़ाई के बहुत बड़े केंद्र रहीस, जो नालंदा विश्वविद्यालय से भी पुराना ए।",
    timings_cg: "बिहनिया 07:00 - संझा 06:00 (रोज)",
    routes_cg: "रायपुर से 80 किमी दूर हे। राष्ट्रीय राजमार्ग 53 के रद्दा ले 2 घंटा म आ जाही।",
    bestTime_cg: "अक्टूबर से मार्च (घूमे बर बढ़िया सुहावना मौसम रहिथे)",
    seasonalAdvice_cg: "गर्मी के दिन म रायपुर के मैदान म बहुत घाम रहिथे, पानी बोतल संग रखव। ठंड म सिरपुर राष्ट्रीय नृत्य महोत्सव होथे।",
    safety_cg: "पुराना ईंट अउ मूर्ति मन ला झन छुअ। गर्भगृह के भीतर हल्ला झन करव, शांति बनाए रखव।",
    localInsights_cg: "मंदिर के थोड़ा आगे जाके जमीन के भीतर खने बाजार अउ सभा हाल ला देखव। 1400 साल पुराना मंदिर के बनावट गजब सुंदर हे।",
    ecoGuidance_cg: "सिरपुर ह सुरक्षित धरोहर क्षेत्र ए। पुराना ईंट म जमे काई म पैर झन रखव। बनाए रद्दा म ही चलव।",
    localFood_cg: "चावल आटा के चीला अउ टमाटर के चटनी, अउ भाजी।",
    photographySpots_cg: "बिहनिया 07:30 बजे लक्ष्मण मंदिर के आगू (जब पहिली धूप ह लाल ईंट म पड़थे) अउ बौद्ध विहार।"
  },
  {
    id: "bhoramdeo-temple",
    name: "Bhoramdeo Temple",
    category: "temples",
    district: "Kawardha",
    tagline: "The 'Khajuraho of Chhattisgarh'",
    coordinates: { lat: 22.1158, lng: 81.1542, mapX: 30, mapY: 30 },
    heroImage: "https://images.unsplash.com/photo-1582555172866-1c863b4a2e55?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Monolith of the Gond Dynasties",
    story: "Nestled in the lush Maikal Hills, Bhoramdeo was built by King Ramachandra of the Phani Nagvanshi dynasty in the 11th century. Dedicated to Lord Shiva, its design blends Nagara temple style with local tribal Gond symbolism. The temple walls are carved with incredible depictions of mythological deities, warriors, mythical beasts, and sensual carvings. It gets its name from 'Bhoramdeo', an ancient tribal deity of the Gond community who is worshipped here alongside Shiva.",
    timings: "06:00 AM - 08:00 PM",
    routes: "Located 18 km from Kawardha city, and 125 km from Raipur Airport. Connects via highly scenic country lanes.",
    bestTime: "November to March. The sacred Shivratri festival in March brings vibrant local fairs.",
    seasonalAdvice: "Monsoon seasons bring misty rain over the surrounding Maikal hills, creating an incredibly atmospheric, green backdrop around the temple lake.",
    safety: "Monkeys inhabit the temple trees; keep foodstuffs inside zip bags. Maintain respectful attire inside the active inner sanctum.",
    nearby: ["Saroda Reservoir", "Maikal Hills Hiking Trails", "Raipur City"],
    localInsights: "Look for the small statue of the bearded Nagvanshi king carved near the temple's base. It is a rare royal self-portrait preserved in stone.",
    ecoGuidance: "The nearby Bhoramdeo Wildlife Sanctuary is fragile. Respect quiet zones and throw all organic waste only in designated clay bins to prevent disrupting forest fauna.",
    biodiversityScore: 88,
    crowdCapacity: 400,
    rating: 4.7,
    localFood: "Wheat-based Angakar Roti baked slowly between flame-toasted dried cow-dung patties for a deep smoky flavor.",
    photographySpots: "The reflection of the main shikhara (spire) in the tranquil lake waters during early sunrise.",

    // Hindi Localized properties
    name_hi: "भोरमदेव मंदिर",
    tagline_hi: "छत्तीसगढ़ का 'खजुराहो'",
    storyTitle_hi: "गोंड राजवंशों का पाषाण स्मारक",
    story_hi: "हरे-भरे मैकल पर्वत में बसा भोरमदेव मंदिर 11वीं शताब्दी में फणि नागवंशी राजवंश के राजा रामचंद्र द्वारा बनवाया गया था। भगवान शिव को समर्पित इस मंदिर की बनावट नागर वास्तुकला को गोंड आदिवासी प्रतीकों के साथ जोड़ती है। दीवारों पर विभिन्न पौराणिक देवी-देवताओं, योद्धाओं और कामुक मूर्तियां उकेरी गई हैं। इसका नाम गोंड समुदाय के प्राचीन देवता 'भोरमदेव' के नाम पर पड़ा है, जिनकी पूजा शिव के साथ की जाती है।",
    timings_hi: "सुबह 06:00 - रात 08:00",
    routes_hi: "कवर्धा शहर से 18 किमी और रायपुर हवाई अड्डे से 125 किमी दूर। सुंदर ग्रामीण रास्तों से जुड़ा है।",
    bestTime_hi: "नवंबर से मार्च। मार्च में पवित्र शिवरात्रि उत्सव पर रंगीन स्थानीय मेले लगते हैं।",
    seasonalAdvice_hi: "मानसून के दौरान मैकल पहाड़ियों पर धुंध छाई रहती है, जिससे मंदिर की झील के चारों ओर एक सुंदर हरा माहौल बन जाता है।",
    safety_hi: "पेड़ों पर बंदर रहते हैं; खाने-पीने का सामान बंद बैग में रखें। गर्भगृह के भीतर शालीन वस्त्र पहनें।",
    localInsights_hi: "मंदिर के आधार के पास दाढ़ी वाले नागवंशी राजा की छोटी मूर्ति देखें। यह पत्थर में सुरक्षित एक दुर्लभ शाही स्व-चित्र है।",
    ecoGuidance_hi: "पास का भोरमदेव वन्यजीव अभयारण्य संवेदनशील क्षेत्र है। शांत क्षेत्रों का सम्मान करें और वन जीवों को परेशान करने से रोकने के लिए कूड़ा केवल मिट्टी के डस्टबिन में डालें।",
    localFood_hi: "अंगकार रोटी (गेहूं से बनी रोटी, जिसे कंडे की धीमी आंच में सेंका जाता है जिससे गहरा धुंआदार स्वाद मिलता है)।",
    photographySpots_hi: "सुबह सूर्योदय के समय शांत झील के पानी में मुख्य शिखर का प्रतिबिंब।",

    // Chhattisgarhi Localized properties
    name_cg: "भोरमदेव मंदिर",
    tagline_cg: "छत्तीसगढ़ के 'खजुराहो'",
    storyTitle_cg: "गोंड राजा मन के बनाय पाषाण मंदिर",
    story_cg: "मैकल पहाड़ी म बने भोरमदेव मंदिर ला 11वीं शताब्दी म फणि नागवंशी राजा रामचंद्र ह बनाय रहीस। महादेव ला समर्पित ये मंदिर नागर शैली अउ गोंड आदिवासी प्रतीक मन के सुंदर मिलावट ए। मंदिर के दीवार म देवी-देवता अउ लड़ाई के मूर्ति मन उकेरे गे हे। एकर नाम गोंड समाज के पुराना देवता 'भोरमदेव' के नाम म हे, जेकर पूजा महादेव संग होथे।",
    timings_cg: "बिहनिया 06:00 - रात 08:00",
    routes_cg: "कवर्धा शहर से 18 किमी अउ रायपुर ले 125 किमी दूर हे। देश के मयारू रद्दा मन ले जुड़े हे।",
    bestTime_cg: "नवंबर से मार्च। मार्च म महाशिवरात्रि म बहुत बड़े मेला भराथे।",
    seasonalAdvice_cg: "चौमास म पहाड़ म कोहरा छाए रहिथे, तालाब तीर के नजारा गजब सुंदर दिखथे।",
    safety_cg: "पेड़ म बंदर मन रहिथें; खाय के सामान ला झोला म ढांक के रखव। मंदिर भीतर साफ-सुथरा कपड़ा पहिर के जाव।",
    localInsights_cg: "मंदिर के नीचे दाढ़ी वाले नागवंशी राजा के छोटे मूर्ति ला खोजव। ये राजा के खुद के बनवाय मूर्ति ए।",
    ecoGuidance_cg: "तीर के भोरमदेव अभयारण्य म शांति रखव अउ कचरा ला माटी के डस्टबिन म ही डालव।",
    localFood_cg: "कंडा म सेंके अंगकार रोटी अउ टमाटर चटनी।",
    photographySpots_cg: "बिहनिया सुरुज उगत समय तालाब म मंदिर के परछाई (शिखर के प्रतिबिंब)।"
  },
  {
    id: "kanger-valley",
    name: "Kanger Valley National Park",
    category: "forests",
    district: "Bastar",
    tagline: "Pristine Sal Canopies & Subterranean Caves",
    coordinates: { lat: 18.8789, lng: 81.8596, mapX: 48, mapY: 90 },
    heroImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Sacred Groves of Bastar",
    story: "Covering 200 sq km of dense, untouched forest, Kanger Valley is one of the most biodiverse zones in central India. It is famous for the Bastar Hill Myna (the official state bird) which can mimic human speech. The park hides ancient geological limestone formations like the Kutumsar Caves. Deep inside these damp, pitch-black chambers live unique blind and transparent fish species, adapted over millions of years of complete isolation.",
    timings: "09:00 AM - 04:00 PM (Closed during monsoons, mid-June to October)",
    routes: "Located 30 km southeast of Jagdalpur. Visitors must register at the park entrance gate and hire an authorized local tribal driver.",
    bestTime: "November to May (Caves are accessible and wildlife spotting is highly active)",
    seasonalAdvice: "Limestone caves fill with subterranean water during the monsoons and are strictly inaccessible. Do not enter without a registered local guide.",
    safety: "Never wander off marked forest trails. Kutumsar Caves have narrow crevices and low oxygen levels deep inside; visitors with breathing conditions should remain in the wider cavern halls.",
    nearby: ["Tirathgarh Waterfalls", "Chitrakote Falls", "Jagdalpur Museum"],
    localInsights: "Listen quietly under the bamboo groves; the local forest rangers can distinguish the calls of rare flying squirrels and Bastar mynas. Hiring a local guide supports the forest economy directly.",
    ecoGuidance: "The caves contain delicate stalactite and stalagmite columns formed over thousands of years. Do not touch them, as oils from human skin permanently halt their crystal growth. Flashlights must be handled with care.",
    biodiversityScore: 97,
    crowdCapacity: 300,
    rating: 4.9,
    localFood: "Bastar Mahua Ladoos, organic honey collected by local tribal cooperative gatherers, and rice-based Pej gruel.",
    photographySpots: "The roots of the giant Sal trees wrapped around rock boulders, and the subterranean limestone amphitheater inside Kutumsar.",

    // Hindi Localized properties
    name_hi: "कांगेर घाटी राष्ट्रीय उद्यान",
    tagline_hi: "प्राकृतिक साल वन और भूमिगत गुफाएं",
    storyTitle_hi: "बस्तर के पवित्र वन क्षेत्र",
    story_hi: "200 वर्ग किमी में फैले घने, अछूते वन के साथ कांगेर घाटी मध्य भारत के सबसे समृद्ध जैव विविधता वाले क्षेत्रों में से एक है। यह पहाड़ी मैना (आधिकारिक राज्य पक्षी) के लिए प्रसिद्ध है जो इंसानों की आवाज की नकल कर सकती है। पार्क में कुटुमसर गुफाओं जैसी प्राचीन भूवैज्ञानिक चूना पत्थर संरचनाएं छिपी हैं। इन नम, बिल्कुल अंधेरे कक्षों के भीतर अद्वितीय अंधी और पारदर्शी मछली प्रजातियां रहती हैं, जो लाखों वर्षों के पूर्ण अलगाव में अनुकूलित हुई हैं।",
    timings_hi: "सुबह 09:00 - शाम 04:00 (मानसून के दौरान बंद, मध्य जून से अक्टूबर)",
    routes_hi: "जगदलपुर से 30 किमी दक्षिण-पूर्व में स्थित। आगंतुकों को पार्क प्रवेश द्वार पर पंजीकरण करना होगा और एक अधिकृत स्थानीय आदिवासी चालक को काम पर रखना होगा।",
    bestTime_hi: "नवंबर से मई (गुफाएं सुलभ होती हैं और वन्यजीव दर्शन सक्रिय होते हैं)",
    seasonalAdvice_hi: "मानसून के दौरान चूना पत्थर की गुफाएं भूमिगत पानी से भर जाती हैं और पहुंच से पूरी तरह बाहर रहती हैं। बिना पंजीकृत स्थानीय गाइड के प्रवेश न करें।",
    safety_hi: "चिह्नित वन मार्गों से कभी न भटकें। कुटुमसर गुफाओं के भीतर संकीर्ण दरारें और ऑक्सीजन का स्तर कम है; सांस की बीमारी वाले आगंतुकों को केवल बड़े कक्षों में ही रहना चाहिए।",
    localInsights_hi: "बांस के झुरमुटों के नीचे शांति से सुनें; स्थानीय वन रेंजर उड़ने वाली गिलहरियों और पहाड़ी मैना की आवाजों में अंतर पहचान सकते हैं। स्थानीय गाइड की मदद लेने से वन अर्थव्यवस्था को सहारा मिलता है।",
    ecoGuidance_hi: "गुफाओं में हजारों वर्षों में बनी नाजुक संरचनाएं (स्टैलेक्टाइट और स्टैलेग्माइट) हैं। उन्हें न छुएं, क्योंकि मानव त्वचा का तेल उनके विकास को रोक देता है।",
    localFood_hi: "बस्तर महुआ लड्डू, स्थानीय आदिवासी सहकारी समितियों द्वारा एकत्र जंगली शहद, और चावल का पेय पेज़।",
    photographySpots_hi: "चट्टानों पर लिपटी विशाल साल के पेड़ों की जड़ें, और कुटुमसर के भीतर चूना पत्थर का भूमिगत प्रेक्षागृह।",

    // Chhattisgarhi Localized properties
    name_cg: "कांगेर घाटी राष्ट्रीय उद्यान",
    tagline_cg: "साल जंगल अउ जमीन के भीतर के गुफा मन",
    storyTitle_cg: "बस्तर के पवित्र जंगल देव स्थल",
    story_cg: "200 वर्ग किमी म फैले कांगेर घाटी ह मध्य भारत के सबले बड़े जंगल म से एक ए। ये जगह पहाड़ी मैना (राज्य पक्षी) बर प्रसिद्ध हे जो मनुख मन के बोली बोल सकथे। जंगल म कुटुमसर गुफा जइसन चूना पत्थर के गुफा हे। ये अंधेरी गुफा मन के भीतर बिना आंख के अउ पारदर्शी मछली मन रहिथें, जो लाखों साल ले इहां रहत हंव।",
    timings_cg: "बिहनिया 09:00 - संझा 04:00 (चौमास म बंद रहिथे, जून ले अक्टूबर)",
    routes_cg: "जगदलपुर से 30 किमी दूर हे। पार्क दुआर म नाम दर्ज कराना होथे अउ आदिवासी संगी मन के गाड़ी म जाना होथे।",
    bestTime_cg: "नवंबर से मई (ये समय गुफा म पानी नइ रहिथे अउ जानवर मन आसानी से दिखथें)",
    seasonalAdvice_cg: "चौमास म गुफा म पानी भर जाथे अउ भीतर जाना सख्त मना हे। बिना गाइड के भीतर झन जाव।",
    safety_cg: "जंगल के रद्दा छोड़ के भटके के कोसिस झन करव। कुटुमसर गुफा म ऑक्सीजन कम रहिथे, दमा के मरीज मन संभल के जाव।",
    localInsights_cg: "बांस झुरमुट म शांत रहिके सुनव, इहां उड़ने वाली गिलहरी अउ मैना के आवाज गजब सुंदर लगथे। लोकल गाइड भाई मन के मदद करव।",
    ecoGuidance_cg: "गुफा के भीतर के पुराना पत्थर मन ला झन छुअ, हाथ लगाए से पत्थर बढ़ना बंद हो जाथे।",
    localFood_cg: "महुआ के लड्डू, जंगली शहद अउ पेज।",
    photographySpots_cg: "साल पेड़ के बड़े जड़ मन अउ कुटुमसर गुफा के भीतर के नजारा।"
  },
  {
    id: "tirathgarh-falls",
    name: "Tirathgarh Waterfalls",
    category: "waterfalls",
    district: "Bastar",
    tagline: "The Milky-White Cascade of Kanger River",
    coordinates: { lat: 18.9161, lng: 81.8654, mapX: 45, mapY: 86 },
    heroImage: "https://images.unsplash.com/photo-1462206634354-94578051759d?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The White Steps of the Forest Queen",
    story: "Tirathgarh Falls is a block-type waterfall where the Kanger River drops 300 feet in multiple layered steps. The water breaks into countless white streams, giving it a stunning milky appearance, often referred to as 'the forest queen's silk sari.' A small, ancient temple dedicated to Shiva stands on one of the rocky steps of the cascade, where hermits used to meditate amid the roaring water.",
    timings: "08:00 AM - 05:00 PM",
    routes: "35 km from Jagdalpur, situated inside Kanger Valley National Park. Well-maintained forest roads connect to the fall base parking area.",
    bestTime: "September to January (Monsoon runoff transitions to highly detailed, step-wise flows)",
    seasonalAdvice: "In dry summer months, the water decreases significantly. Late monsoon provides the most dramatic, white cascading steps.",
    safety: "Steps leading down are extremely steep and can become slick with moss. Walk slowly and hold the handrails. Do not cross warning signs placed near deep water drop-offs.",
    nearby: ["Kanger Valley Caves", "Danteshwari Temple", "Chitrakote Falls"],
    localInsights: "Descend all the way to the lowest step for a spectacular three-sided panoramic view of the cascading sheets of water. There is a small cave near the base that stays incredibly cool even in hot weather.",
    ecoGuidance: "Avoid carrying disposable plastic packages. The waterfall basin is a critical habitat for unique mountain crabs and fish. Do not discard food crumbs into the water.",
    biodiversityScore: 90,
    crowdCapacity: 800,
    rating: 4.8,
    localFood: "Toasted sweet corn cobs rubbed with local forest limes, and wild berry mixes sold by local tribal women.",
    photographySpots: "The middle staircase viewing deck (captures the tiered steps dropping in a perfect diagonal frame), and the moss-wrapped ancient shrine at the base.",

    // Hindi Localized properties
    name_hi: "तीरथगढ़ जलप्रपात",
    tagline_hi: "कांगेर नदी का दूधिया-सफेद झरना",
    storyTitle_hi: "वन रानी की सफेद सीढ़ियां",
    story_hi: "तीरथगढ़ जलप्रपात एक ब्लॉक-प्रकार का जलप्रपात है जहाँ कांगेर नदी कई स्तरों में 300 फीट नीचे गिरती है। पानी अनगिनत सफेद धाराओं में टूट जाता है, जिससे यह एक आश्चर्यजनक दूधिया रूप देता है, जिसे अक्सर 'वन रानी की रेशमी साड़ी' कहा जाता है। झरने के चट्टानी स्तरों में से एक पर शिव को समर्पित एक छोटा, प्राचीन मंदिर है, जहाँ साधु गर्जना करते पानी के बीच ध्यान लगाते थे।",
    timings_hi: "सुबह 08:00 - शाम 05:00",
    routes_hi: "जगदलपुर से 35 किमी, कांगेर घाटी राष्ट्रीय उद्यान के भीतर स्थित। अच्छी तरह से बनाए रखी गई वन सड़कें झरने के आधार पार्किंग क्षेत्र से जोड़ती हैं।",
    bestTime_hi: "सितंबर से जनवरी (मानसून के बाद का प्रवाह बहुत सुंदर होता है)",
    seasonalAdvice_hi: "शुष्क गर्मी के महीनों में, पानी काफी कम हो जाता है। देर से आने वाला मानसून सबसे सुंदर दूधिया बहाव प्रदान करता है।",
    safety_hi: "नीचे जाने वाली सीढ़ियाँ बेहद खड़ी हैं और काई से फिसलन भरी हो सकती हैं। धीरे-धीरे चलें और रेलिंग पकड़ें। गहरे पानी के पास लगाए गए चेतावनी संकेतों को पार न करें।",
    localInsights_hi: "बहते हुए पानी के शानदार दृश्यों के लिए सबसे नीचे की सीढ़ी तक जाएं। आधार के पास एक छोटी गुफा है जो गर्म मौसम में भी अविश्वसनीय रूप से ठंडी रहती है।",
    ecoGuidance_hi: "डिस्पोजेबल प्लास्टिक ले जाने से बचें। यह जलप्रपात अनोखे पहाड़ी केकड़ों और मछलियों का एक महत्वपूर्ण आवास है। पानी में खाने का सामान न फेंकें।",
    localFood_hi: "स्थानीय नींबू और नमक लगे भुने हुए भुट्टे, और आदिवासी महिलाओं द्वारा बेचे जाने वाले जंगली जामुन।",
    photographySpots_hi: "सीढ़ियों के बीच का व्यूपॉइंट (जहाँ से पूरी सीढ़ीदार झरना तिरछे फ्रेम में दिखता है), और आधार पर स्थित पुराना मंदिर।",

    // Chhattisgarhi Localized properties
    name_cg: "तीरथगढ़ जलप्रपात",
    tagline_cg: "कांगेर नदी के सफेद दूध जइसन झरना",
    storyTitle_cg: "जंगल के रानी के सफेद सीढ़ी",
    story_cg: "तीरथगढ़ झरना म कांगेर नदी ह लगभग 300 फीट ऊपर ले सीढ़ी जइसन नीचे गिरथे। पानी ह हरियर चट्टान म गिरके दूध जइसन सफेद दिखथे, जेला सियन मन 'जंगल के रानी के रेशम साड़ी' कहिथें। इहां एक पुराना महादेव मंदिर हे, जिहां पुराना समय म साधु मन पानी के गर्जना के बीच म बैठके तपस्या करत रहीन।",
    timings_cg: "बिहनिया 08:00 - संझा 05:00",
    routes_cg: "जगदलपुर से 35 किमी दूर, कांगेर घाटी राष्ट्रीय उद्यान के भीतर हे। जंगल के रद्दा ले आसानी से गाड़ी म आ जाही।",
    bestTime_cg: "सितंबर से जनवरी (चौमास के पानी ह सीढ़ी म बहुत सुंदर बहथे)",
    seasonalAdvice_cg: "गर्मी म पानी बहुत कम हो जाथे। चौमास के आखरी म झरना सबले सुंदर दिखथे।",
    safety_cg: "नीचे जाय के सीढ़ी बहुत खड़ी अउ फिसलन वाली हे। धीरे-धीरे रेलिंग पकड़ के उतरव। चेतावनी बोर्ड के आगे झन जाव।",
    localInsights_cg: "सबले नीचे वाले सीढ़ी म जाके देखव, तीनो तरफ ले पानी गिरत दिखथे। तीर म एक छोटी ठंडी गुफा हे।",
    ecoGuidance_cg: "प्लास्टिक के सामान लैजाना मना हे। ये झरना म पहाड़ी केकड़ा अउ मछली मन रहिथें, ओ मन ला सुरक्षित रखव।",
    localFood_cg: "नींबू-नमक लगे भुने भुट्टा अउ जंगली चिरौंजी अउ जामुन।",
    photographySpots_cg: "सीढ़ियों के बीच के चबूतरा (जिहां ले पूरा झरना एक फ्रेम म आथे) अउ नीचे बने मंदिर।"
  },
  {
    id: "barnawapara",
    name: "Barnawapara Wildlife Sanctuary",
    category: "forests",
    district: "Raipur",
    tagline: "Lush Teak Forests & Sanctuary of the Indian Bison",
    coordinates: { lat: 21.4012, lng: 82.4208, mapX: 68, mapY: 48 },
    heroImage: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Refuge of Valmiki and Forest Gods",
    story: "Covering 244 sq km of deciduous forests, Barnawapara is named after twin forest villages: Bar and Nawa Para. Local folklore integrates this forest with the epic Ramayana; it is believed that Sage Valmiki's ashram was located here, where Luv and Kush were born. Today, it is a crucial conservation zone for the Gaur (Indian Bison), Leopards, Sloth Bears, and over 150 species of vibrant tropical birds.",
    timings: "06:00 AM - 10:30 AM & 03:00 PM - 06:00 PM (Closed from 1st July to 31st October)",
    routes: "100 km from Raipur city. Take national highway 53 to Pithora, then connect to the sanctuary entry gate via forest lanes.",
    bestTime: "November to April (Optimal foliage for mammal spotting and migratory birds)",
    seasonalAdvice: "Open gypsy safaris operate during dry months. Wear neutral, earthy colors (khaki, olive, tan) to blend into the dry deciduous teak landscape.",
    safety: "Do not wear bright colors (red, white) during safaris. Remain strictly inside the safari vehicle. Never try to feed or call out to wild animals.",
    nearby: ["Sirpur Monuments", "Raipur City", "Saroda Reservoir"],
    localInsights: "Request your local jeep driver to halt near the Devdhara waterfall basin inside the park. It is a tranquil forest pool where wildlife regularly gathers for water during early afternoon heat.",
    ecoGuidance: "Strict zero-noise policy inside the sanctuary boundary. Keep mobile devices on silent. Avoid flash photography as it can disorient and agitate nocturnal sloth bears.",
    biodiversityScore: 94,
    crowdCapacity: 400,
    rating: 4.6,
    localFood: "Forest-gathered gooseberry (Amla) preserves, local hand-pounded red rice flakes (Poha), and organic herbal forest tea.",
    photographySpots: "The watchtower overlooking the main salt lick watering hole at 06:30 AM (often catches groups of wild bisons emerging from the forest mist).",

    // Hindi Localized properties
    name_hi: "बारनवापारा वन्यजीव अभयारण्य",
    tagline_hi: "हरे-भरे साल-सागौन वन और भारतीय गौर का घर",
    storyTitle_hi: "वाल्मीकि और वन देवताओं की शरणस्थली",
    story_hi: "244 वर्ग किमी में फैले पर्णपाती वनों वाले बारनवापारा का नाम दो जुड़वां वन गांवों: बार और नयापारा के नाम पर रखा गया है। स्थानीय लोककथाएं इस जंगल को महाकाव्य रामायण से जोड़ती हैं; माना जाता है कि महर्षि वाल्मीकि का आश्रम यहीं स्थित था, जहाँ लव और कुश का जन्म हुआ था। आज, यह गौर (भारतीय बाइसन), तेंदुए, भालू और 150 से अधिक प्रजातियों के रंग-बिरंगे उष्णकटिबंधीय पक्षियों के लिए एक महत्वपूर्ण संरक्षण क्षेत्र है।",
    timings_hi: "सुबह 06:00 - 10:30 और दोपहर 03:00 - शाम 06:00 (1 जुलाई से 31 अक्टूबर तक बंद)",
    routes_hi: "रायपुर शहर से 100 किमी दूर। राष्ट्रीय राजमार्ग 53 से पिथौरा जाएं, फिर वन मार्गों से अभयारण्य प्रवेश द्वार से जुड़ें।",
    bestTime_hi: "नवंबर से अप्रैल (स्तनधारियों और प्रवासी पक्षियों को देखने के लिए अनुकूल समय)",
    seasonalAdvice_hi: "शुष्क महीनों के दौरान खुली जिप्सी सफारी चलती है। सागौन वन परिदृश्य में घुलने-मिलने के लिए हल्के, मिट्टी जैसे रंग (खाकी, जैतून, भूरा) के कपड़े पहनें।",
    safety_hi: "सफारी के दौरान चमकीले रंग (लाल, सफेद) न पहनें। सफारी वाहन के भीतर ही रहें। जंगली जानवरों को खाना खिलाने या आवाज लगाने की कोशिश कभी न करें।",
    localInsights_hi: "पार्क के भीतर देवधारा जलप्रपात के पास रुकने का अनुरोध करें। यह एक शांत वन कुंड है जहाँ वन्यजीव अक्सर दोपहर की गर्मी में पानी पीने आते हैं।",
    ecoGuidance_hi: "अभयारण्य सीमा के भीतर सख्त मौन नीति। मोबाइल उपकरणों को साइलेंट पर रखें। फ्लैश फोटोग्राफी से बचें क्योंकि इससे भालू विचलित हो सकते हैं।",
    localFood_hi: "जंगल से एकत्र आंवले का मुरब्बा, स्थानीय हाथ से कुटा हुआ लाल पोहा और जैविक वन हर्बल चाय।",
    photographySpots_hi: "सुबह 06:30 बजे मुख्य जलस्रोत के पास स्थित मचान (जहाँ से कोहरे से निकलते जंगली गौर दिखाई देते हैं)।",

    // Chhattisgarhi Localized properties
    name_cg: "बारनवापारा अभयारण्य",
    tagline_cg: "सागौन जंगल अउ बनभैंसा (गौर) के घर",
    storyTitle_cg: "बाल्मीकि ऋषि अउ जंगल देव के थान",
    story_cg: "244 वर्ग किमी म फैले बारनवापारा के नाम ह इहां के दो गांव बार अउ नयापारा के नाम म हे। पुरखा गोठ के हिसाब से इहां बाल्मीकि ऋषि के आश्रम रहीस, जिहां लव अउ कुश के जनम होय रहीस। आज ये जगह म बनभैंसा (गौर), तेंदुआ, भालू अउ 150 ले ज्यादा चिरई मन सुरक्षित रहिथें।",
    timings_cg: "बिहनिया 06:00 - 10:30 अउ संझा 03:00 - 06:00 (जुलाई से अक्टूबर तक बंद रहिथे)",
    routes_cg: "रायपुर से 100 किमी दूर हे। हाईवे 53 ले पिथौरा जाके अभयारण्य के रद्दा मिलही।",
    bestTime_cg: "नवंबर से अप्रैल (ये समय जानवर अउ चिरई मन आसानी से दिखथें)",
    seasonalAdvice_cg: "गर्मी अउ ठंड म खुली जिप्सी सफारी चलथे। जंगल म सफारी बर जाव त हरियर या खाकी कपड़ा पहिरव।",
    safety_cg: "चमकीला कपड़ा झन पहिरव। सफारी गाड़ी से बाहर झन उतरव। जानवर मन ला खाय के सामान झन देव।",
    localInsights_cg: "देवधारा जलप्रपात तीर म गाड़ी रोकवाव, इहां दोपहर के समय जानवर मन पानी पिए बर आथें।",
    ecoGuidance_cg: "जंगल म हल्ला झन करव, मोबाइल ला साइलेंट रखव। कैमरा के फ्लैशलाइट झन जलाओ, भालू मन चिढ़ जाथें।",
    localFood_cg: "जंगली आंवला मुरब्बा, लाल धान के पोहा अउ काढ़ा (जंगली चाय)।",
    photographySpots_cg: "बिहनिया 6:30 बजे मचान ले (जिहां ले पानी पियत गौर मन के फोटो खिंचाथे)।"
  },
  {
    id: "achanakmar",
    name: "Achanakmar Tiger Reserve",
    category: "forests",
    district: "Bilaspur",
    tagline: "Lost in the Sal-Teak Heartland of Central India",
    coordinates: { lat: 22.5300, lng: 81.8800, mapX: 55, mapY: 22 },
    heroImage: "https://images.unsplash.com/photo-1589656966895-2f331719b5d9?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Last Bastion of the Central Indian Tiger",
    story: "Achanakmar Tiger Reserve sprawls across the Maikal Hills, a forgotten highland corridor linking Kanha and Pench tiger reserves. Ancient tribal communities have coexisted with the forest's tigers for centuries, developing sacred groves ('Dev Vans') where no trees are ever felled. Local oral tradition holds that the spirit of the forest tiger is the guardian of the tribal boundary — its roar signals both danger and protection.",
    timings: "06:00 AM - 10:00 AM & 03:00 PM - 05:30 PM",
    routes: "Located 175 km from Bilaspur city. Take NH-130C and enter at the Lamni gate. Prior online booking is mandatory.",
    bestTime: "November to March (Peak wildlife activity and dry-season water pooling)",
    seasonalAdvice: "Reserve is closed from July to October during monsoons. Temperature drops significantly in winter — carry warm layers for dawn safaris.",
    safety: "Stay inside safari vehicles at all times. Do not use flash photography near wildlife. Maintain strict silence near waterholes and salt licks.",
    nearby: ["Khutaghat Dam", "Amarkantak Pilgrimage", "Bilaspur City"],
    localInsights: "Ask your guide to visit the ancient Dhouda waterfall inside the reserve — it is rarely shown to tourists and provides spectacular opportunities to spot sambar deer.",
    ecoGuidance: "Achanakmar is a UNESCO-recognised biosphere reserve. Carry zero plastic. All biodegradable waste must be packed out. Leave only footprints.",
    biodiversityScore: 96,
    crowdCapacity: 250,
    rating: 4.8,
    localFood: "Tribal honey-glazed forest bamboo shoots, and wild gooseberry chutneys from local forest cooperative stalls at the reserve gate.",
    photographySpots: "The elevated machan watchtower overlooking the main meadow at 06:30 AM for spectacular tiger pugmark tracking and spotted deer groupings.",

    // Hindi Localized properties
    name_hi: "अचानकमार टाइगर रिजर्व",
    tagline_hi: "मध्य भारत के साल-सागौन के हृदय स्थल में स्थित",
    storyTitle_hi: "मध्य भारतीय बाघ का अंतिम गढ़",
    story_hi: "अचानकमार टाइगर रिजर्व मैकल पहाड़ियों में फैला हुआ है, जो कान्हा और पेंच टाइगर रिजर्व को जोड़ने वाला एक पुराना पहाड़ी गलियारा है। प्राचीन आदिवासी समुदाय सदियों से जंगल के बाघों के साथ सह-अस्तित्व में रहे हैं, उन्होंने पवित्र वन ('देव वन') विकसित किए हैं जहाँ कभी कोई पेड़ नहीं काटा जाता है। स्थानीय मौखिक परंपरा मानती है कि जंगल का बाघ आदिवासी सीमा का रक्षक है - उसकी दहाड़ खतरे और सुरक्षा दोनों का संकेत देती है।",
    timings_hi: "सुबह 06:00 - 10:00 और दोपहर 03:00 - शाम 05:30",
    routes_hi: "बिलासपुर शहर से 175 किमी दूर स्थित। NH-130C लें और लमनी गेट से प्रवेश करें। पूर्व ऑनलाइन बुकिंग अनिवार्य है।",
    bestTime_hi: "नवंबर से मार्च (वन्यजीव गतिविधि और शुष्क मौसम के जल स्रोतों पर जमाव के कारण)",
    seasonalAdvice_hi: "मानसून के दौरान जुलाई से अक्टूबर तक रिजर्व बंद रहता है। सर्दियों में तापमान काफी गिर जाता है - सुबह की सफारी के लिए गर्म कपड़े साथ रखें।",
    safety_hi: "हर समय सफारी वाहनों के अंदर रहें। वन्यजीवों के पास फ्लैश फोटोग्राफी का उपयोग न करें। जलस्रोतों के पास पूर्ण शांति बनाए रखें।",
    localInsights_hi: "अपने गाइड से रिजर्व के भीतर स्थित प्राचीन धौड़ा जलप्रपात दिखाने का अनुरोध करें - यह पर्यटकों को कम ही दिखाया जाता है और सांभर हिरण को देखने का शानदार मौका प्रदान करता है।",
    ecoGuidance_hi: "अचानकमार यूनेस्को द्वारा मान्यता प्राप्त बायोस्फीयर रिजर्व है। प्लास्टिक बिल्कुल न ले जाएं। सभी कचरा वापस लाएं। केवल पदचिह्न छोड़ें।",
    localFood_hi: "आदिवासी महुआ शहद में लिपटे वन बांस के अंकुर, और मुख्य द्वार पर स्थानीय वन सहकारी स्टालों से जंगली आंवले की चटनी।",
    photographySpots_hi: "सुबह 06:30 बजे मुख्य घास के मैदान की निगरानी करने वाला ऊंचा मचान, जो बाघों के पदचिह्न और हिरणों के झुंड की सुंदर तस्वीरें देता है।",

    // Chhattisgarhi Localized properties
    name_cg: "अचानकमार टाइगर रिजर्व",
    tagline_cg: "मैकल पहाड़ के साल-सागौन के घना जंगल",
    storyTitle_cg: "महादेव पहाड़ के शेर मन के आखिरी गढ़",
    story_cg: "अचानकमार रिजर्व ह मैकल पहाड़ी म फैले हे, जउन ह कान्हा अउ पेंच नेशनल पार्क ला आपस म जोड़थे। इहां के आदिवासी भाई मन सदियों से शेर मन के संग रहत हंव अउ ओ मन जंगल ला भगवान मानके 'देव वन' बनाय हंव जिहां लकड़ी काटना मना हे। पुरखा गोठ हे कि शेर के दहाड़ ह जंगल अउ गांव के रक्षा के संदेसा ए।",
    timings_cg: "बिहनिया 06:00 - 10:00 अउ संझा 03:00 - 05:30",
    routes_cg: "बिलासपुर से 175 किमी दूर हे। NH-130C के रद्दा ले लमनी गेट ले भीतर जाना होथे। पहिले से टिकट बुक कराना जरूरी हे।",
    bestTime_cg: "नवंबर से मार्च (ये समय शेर अउ दूसरा जानवर मन आसानी से दिखथें)",
    seasonalAdvice_cg: "चौमास म (जुलाई से अक्टूबर) रिजर्व बंद रहिथे। जाड़ म सुबह सफारी म बहुत ठंड रहिथे त गर्म कपड़ा पहिरव।",
    safety_cg: "सफारी गाड़ी से बाहर झन उतरव। जानवर मन ला देखके कैमरा के फ्लैश झन जलाओ अउ हल्ला झन करव।",
    localInsights_cg: "गाइड भाई मन से धौड़ा जलप्रपात लैजाय बर कहव, ओ जगहा म सांभर हिरण मन के झुंड दिखथे।",
    ecoGuidance_cg: "अचानकमार ह यूनेस्को के सुरक्षित जैव क्षेत्र ए। प्लास्टिक अउ कचरा झन फैलाओ, अपन कचरा वापस लाओ।",
    localFood_cg: "महुआ शहद म पके बांस करील (बांस भाजी) अउ गेट तीर के दुकान के आंवला चटनी।",
    photographySpots_cg: "बिहनिया 6:30 बजे मचान ले (जिहां ले शेर के पंजा के निशान अउ हिरण मन के फोटो खिंचाथे)।"
  },
  {
    id: "gangrel-dam",
    name: "Gangrel Dam & Reservoir",
    category: "waterfalls",
    district: "Durg",
    tagline: "The Largest Reservoir of Chhattisgarh",
    coordinates: { lat: 20.6667, lng: 81.4833, mapX: 38, mapY: 60 },
    heroImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4e0f11?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "The Man-Made Sea of Chhattisgarh",
    story: "Built across the Mahanadi River, the Gangrel (Ravishankar Sagar) Dam is the largest reservoir in Chhattisgarh. It is the birthplace of the Mahanadi water story — this colossal water body feeds the plains of Odisha and sustains 40% of the state's agriculture. During the monsoon overflow discharge, the dam's spillway thunder can be heard from 5 km away, as 36 gates open simultaneously in a breathtaking water spectacle.",
    timings: "06:00 AM - 07:00 PM (Garden and viewpoint; dam structure restricted)",
    routes: "Located 35 km from Dhamtari and 80 km from Raipur. Well-paved highway connectivity via SH-4.",
    bestTime: "August to November (Monsoon overflow discharge is spectacular)",
    seasonalAdvice: "Overflow discharge season (August-September) provides the best visual experience but expect large weekend crowds. Winters are peaceful and excellent for birdwatching.",
    safety: "Do not cross safety barriers near the spillway. Strong undertow currents exist near the dam base. Children must be supervised near water edges at all times.",
    nearby: ["Dhamtari City", "Sihawa Sacred Hills", "Raipur Airport"],
    localInsights: "Visit the Garden of Eden park built on the reservoir shore for sunset views over the glittering water. Local fishermen sell fresh Rohu catches right on the dam road at dawn.",
    ecoGuidance: "The reservoir is a Ramsar-nominated migratory bird habitat. Do not litter or discharge cleaning agents near the water. Avoid disturbing waterfowl colonies on the southern shore islands.",
    biodiversityScore: 82,
    crowdCapacity: 1500,
    rating: 4.4,
    localFood: "Fresh Mahanadi Rohu fish curried in local turmeric-mustard gravy, and sweet rice Kheer from dam-side dhabas.",
    photographySpots: "The main dam walkway at overflow discharge (36 gates open) captures a once-a-year spectacle, and the southern bird sanctuary shore at sunrise.",

    // Hindi Localized properties
    name_hi: "गंगरेल बांध और जलाशय",
    tagline_hi: "छत्तीसगढ़ का सबसे बड़ा जलाशय",
    storyTitle_hi: "छत्तीसगढ़ का मानव निर्मित समुद्र",
    story_hi: "महानदी नदी पर बना गंगरेल (रविशंकर सागर) बांध छत्तीसगढ़ का सबसे बड़ा जलाशय है। यह महानदी जल यात्रा का उद्गम स्थल है - यह विशाल जल निकाय ओडिशा के मैदानों को सींचता है और राज्य के 40% कृषि को सहारा देता है। मानसून के दौरान जब इसके 36 गेट एक साथ खोले जाते हैं, तो बांध की पानी की गर्जना 5 किमी दूर तक सुनी जा सकती है।",
    timings_hi: "सुबह 06:00 - शाम 07:00 (उद्यान और व्यूपॉइंट; मुख्य बांध संरचना प्रतिबंधित है)",
    routes_hi: "धमतरी से 35 किमी और रायपुर से 80 किमी दूर। SH-4 के माध्यम से अच्छी सड़क कनेक्टिविटी।",
    bestTime_hi: "अगस्त से नवंबर (मानसून के समय जब इसके गेट खुलते हैं तो नजारा अद्भुत होता है)",
    seasonalAdvice_hi: "गेट खुलने का समय सबसे अच्छा होता है लेकिन सप्ताहांत पर भीड़ अधिक होती है। सर्दियों का समय पक्षी देखने के लिए बहुत अच्छा होता है।",
    safety_hi: "स्पिलवे के पास सुरक्षा बैरियर पार न करें। पानी के किनारों पर बच्चों की कड़ी निगरानी रखें। गहरे पानी में जाने से बचें।",
    localInsights_hi: "जलाशय के किनारे बने गार्डन ऑफ ईडन पार्क से सूर्यास्त का सुंदर नजारा देखें। सुबह-सुबह बांध के पास स्थानीय मछुआरे ताजी मछलियां बेचते हैं।",
    ecoGuidance_hi: "यह जलाशय प्रवासी पक्षियों का एक महत्वपूर्ण आवास है। पानी के पास कचरा न फैलाएं। दक्षिणी तट पर पक्षियों के घोंसलों को परेशान न करें।",
    localFood_hi: "स्थानीय हल्दी-सरसों की ग्रेवी में बनी ताजी महानदी की रोहू मछली, और बांध के पास के ढाबों की मीठी खीर।",
    photographySpots_hi: "जब बांध के 36 गेट खुलते हैं तब मुख्य बांध का रास्ता, और सुबह के समय दक्षिणी पक्षी अभयारण्य का किनारा।",

    // Chhattisgarhi Localized properties
    name_cg: "गंगरेल बांध",
    tagline_cg: "छत्तीसगढ़ के सबले बड़े बांध",
    storyTitle_cg: "छत्तीसगढ़ के मानव निर्मित समुंदर",
    story_cg: "महानदी म बने गंगरेल (रविशंकर सागर) बांध ह छत्तीसगढ़ के सबले बड़े बांध ए। यह बांध ह उड़ीसा तक पानी पहुंचाथे अउ हमर छत्तीसगढ़ के 40% खेती-किसानी ला पानी देथे। चौमास म जब एकर 36 गेट मन ला एक संग खोले जाथे, त एकर पानी के गर्जना ह 5 किमी दूर तक सुनाई देथे।",
    timings_cg: "बिहनिया 06:00 - संझा 07:00 (बगीचा अउ व्यूपॉइंट; मुख्य बांध भीतर जाना मना हे)",
    routes_cg: "धमतरी से 35 किमी अउ रायपुर से 80 किमी दूर हे। SH-4 हाईवे ले आसानी से गाड़ी म आ जाही।",
    bestTime_cg: "अगस्त से नवंबर (जब बांध के गेट खुलथे त पानी के नजारा गजब सुंदर रहिथे)",
    seasonalAdvice_cg: "अगस्त-सितंबर म घूमे बर बढ़िया दिन ए पर रविवार के दिन बहुत भीड़ रहिथे। ठंड म इहां चिरई मन ला देखे बर बढ़िया मौसम रहिथे।",
    safety_cg: "पानी तीर म सुरक्षा घेरा ला झन पार करव। लइका मन ला पानी तीर म अकेले झन छोड़व, इहां पानी बहुत गहरा हे।",
    localInsights_cg: "गार्डन ऑफ ईडन ले संझा के सुरुज डूबत देखना बहुत सुंदर लगथे। बिहनिया बांध तीर म केवट भाई मन ताज़ा रोहू मछली बेचथें।",
    ecoGuidance_cg: "ये जलाशय म बाहर देश ले चिरई मन आथें। इहां कचरा झन फैलाओ अउ चिरई मन के घोंसला ला झन छुअ।",
    localFood_cg: "ताजा महानदी के रोहू मछली के तरी-भात अउ बांध तीर के होटल म मीठा खीर।",
    photographySpots_cg: "36 गेट खुले के समय मुख्य बांध के रद्दा अउ बिहनिया सुरुज उगत समय पक्षी अभयारण्य के घाट।"
  }
];

export function getDestinationById(id: string): Destination | undefined {
  return DESTINATIONS.find(d => d.id === id);
}
