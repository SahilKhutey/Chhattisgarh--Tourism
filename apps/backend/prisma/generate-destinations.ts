import * as fs from 'fs';
import * as path from 'path';

// Generate 100 unique destination names across CG districts
const NAMES_DB = {
  waterfalls: ['Amrit Dhara', 'Tiger Point', 'Tamra Ghoomar', 'Mendri Ghoomar', 'Kothally', 'Malanjhkudum', 'Ranidah', 'Rajpuri', 'Danaghat', 'Kendai', 'Devpahari', 'Ramdaha', 'Gupteshwar', 'Bane', 'Ghatarani', 'Jatmai', 'Tirathgarh Falls', 'Chitrakote Falls', 'Chingra Page', 'Khanda', 'Dugdhdhara', 'Sitamadi', 'Rakasganda', 'Akuri Nala', 'Bunga'],
  forests: ['Sitanadi', 'Udanti', 'Gomarda', 'Tamor Pingla', 'Semarsot', 'Bhairamgarh', 'Pamed', 'Badalkhol', 'Sanjay National Park', 'Guru Ghasidas', 'Kanger Valley', 'Barnawapara', 'Achanakmar', 'Mainpat', 'Kunkuri', 'Tatapani', 'Kendai Forest', 'Kotumsar Cave Environs', 'Kailash Cave Environs', 'Dandak Cave Environs', 'Chirmiri Hills', 'Hasdeo River Basin', 'Koriya Hills', 'Jashpur Highlands', 'Gariaband Woods'],
  temples: ['Bambleshwari Temple', 'Mahamaya Temple', 'Chandrahasini Temple', 'Rajiv Lochan', 'Champaran', 'Laxman Temple', 'Madku Dweep', 'Patal Bhairavi', 'Banjari Mata', 'Bhoramdeo Temple', 'Sirpur Heritage', 'Danteshwari Temple', 'Pithampur Shiv Mandir', 'Kuleshwar Mahadev', 'Ganga Maiya', 'Maa Pitambara Peeth', 'Kuleshwarnath', 'Amarkantak Gateway', 'Shivrinarayan', 'Giraudhpuri Dham', 'Damakheda', 'Sonakhan', 'Keshkal Mata', 'Jalleshwar Mahadev', 'Bilha Shiv Temple'],
  villages: ['Kondagaon Craft Village', 'Narayanpur Haat', 'Bastar Haat', 'Purkhauti Muktangan', 'Tirathgarh Village', 'Tulsi Village', 'Chhura', 'Gariaband Handlooms', 'Sakti Village', 'Champa Weavers', 'Janjgir Silk Village', 'Kawardha Village', 'Dhamtari Eco Village', 'Rajnandgaon Rural', 'Bhilai Tribal Settlement', 'Sukma Outpost', 'Bijapur Village', 'Dantewada Market', 'Kanker Palace Village', 'Jagdalpur Artisan Colony', 'Pendra Tribal Belt', 'Marwahi Forests', 'Raigarh Dhokra Village', 'Jashpur Oraon Village', 'Surguja Korwa Settlement']
};

const DISTRICTS = ['Bastar', 'Surguja', 'Raipur', 'Bilaspur', 'Durg', 'Korba', 'Raigarh', 'Rajnandgaon', 'Koriya', 'Jashpur', 'Dantewada', 'Kanker', 'Mahasamund', 'Dhamtari', 'Gariaband'];

function generateDestinations() {
  const destinations = [];
  let idCounter = 1;

  for (const [category, names] of Object.entries(NAMES_DB)) {
    for (const name of names) {
      const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
      const lat = 18.0 + Math.random() * 5.0; // Random lat between 18.0 and 23.0
      const lng = 80.0 + Math.random() * 4.0; // Random lng between 80.0 and 84.0
      
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Select a CDN video based on category
      const videoType = category === 'villages' ? 'village.mp4' : (category === 'temples' ? 'temple.mp4' : (category === 'forests' ? 'forest.mp4' : 'waterfall.mp4'));
      
      destinations.push({
        slug: slug,
        name: name,
        categorySlug: category,
        district: district,
        tagline: `Experience the beauty of ${name} in ${district}`,
        latitude: parseFloat(lat.toFixed(4)),
        longitude: parseFloat(lng.toFixed(4)),
        heroImage: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 10000000000)}?auto=format&fit=crop&w=1200&q=80`, // Random unpslash-like id
        bestTime: "October to March is the ideal time to visit.",
        safety: "Maintain caution around remote areas and hire local guides where necessary.",
        ecoGuidance: "Zero plastic tolerance zone. Leave no trace and respect local tribal boundaries.",
        story: `${name} is a majestic location situated in the heart of ${district}. It represents the rich natural and cultural tapestry of Chhattisgarh. With increasing tourism, it remains a pristine destination for authentic exploration.`,
        media: [
          { url: `/cdn/videos/${videoType}`, type: 'VIDEO' },
          { url: `https://images.unsplash.com/photo-${1600000000000 + Math.floor(Math.random() * 10000000000)}?auto=format&fit=crop&w=1200&q=80`, type: 'IMAGE' }
        ],
        translations: {
          hi: {
            name: name,
            description: `${district} में स्थित एक सुंदर स्थल`,
            history: `${name} छत्तीसगढ़ की संस्कृति और प्रकृति का एक शानदार उदाहरण है।`,
            bestSeason: "अक्टूबर से मार्च",
            safetyInfo: "सुदूर क्षेत्रों में सावधानी बरतें।",
            rules: "प्लास्टिक का उपयोग सख्त मना है।"
          },
          cg: {
            name: name,
            description: `${district} म स्थित एक सुघ्घर जगह`,
            history: `${name} ह छत्तीसगढ़ के संस्कृति अउ प्रकृति के एक बढ़िया उदाहरण ए।`,
            bestSeason: "अक्टूबर से मार्च",
            safetyInfo: "दूरिहा के जगह म संभल के जाव।",
            rules: "प्लास्टिक के उपयोग एकदम मना हे।"
          },
          en: {
            name: name,
            description: `Experience the beauty of ${name} in ${district}`,
            history: `${name} is a majestic location situated in the heart of ${district}. It represents the rich natural and cultural tapestry of Chhattisgarh. With increasing tourism, it remains a pristine destination for authentic exploration.`,
            bestSeason: "October to March is the ideal time to visit.",
            safetyInfo: "Maintain caution around remote areas and hire local guides where necessary.",
            rules: "Zero plastic tolerance zone. Leave no trace and respect local tribal boundaries."
          }
        }
      });
      idCounter++;
    }
  }

  const outPath = path.join(__dirname, 'data', 'destinations', 'batch_01.json');
  fs.writeFileSync(outPath, JSON.stringify(destinations, null, 2));
  console.log(`Successfully generated ${destinations.length} destinations to ${outPath}`);
}

generateDestinations();
