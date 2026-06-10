const http = require('http');

async function checkUrl(url) {
  if (!url || !url.startsWith('http')) return false;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function run() {
  console.log("Fetching places from backend...");
  try {
    const res = await fetch('http://localhost:4000/api/v1/places');
    if (!res.ok) {
      console.error("Failed to fetch places", res.status);
      return;
    }
    const data = await res.json();
    const places = data.data || [];
    console.log(`Fetched ${places.length} places. Verifying...`);
    
    let issues = 0;
    for (const p of places) {
      const missingFields = [];
      if (!p.name) missingFields.push('name');
      if (!p.description) missingFields.push('description');
      if (!p.history) missingFields.push('history');
      if (p.latitude == null) missingFields.push('latitude');
      if (p.longitude == null) missingFields.push('longitude');
      
      let imageOk = true;
      if (!p.heroImage) {
        missingFields.push('heroImage');
        imageOk = false;
      }
      
      if (missingFields.length > 0) {
        console.log(`[Warning] Place '${p.name || p.slug}' missing fields: ${missingFields.join(', ')}`);
        issues++;
      }
    }
    
    console.log(`Verification complete. Found issues in ${issues} places.`);
  } catch (e) {
    console.error("Error connecting to backend:", e.message);
  }
}

run();
