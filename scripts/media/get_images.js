const places = [
  "Chitrakote Falls", "Sirpur", "Bhoramdeo Temple", "Kanger Ghati National Park",
  "Tirathgarh Falls", "Achanakmar Tiger Reserve", "Mainpat", "Danteshwari Temple"
];

async function run() {
  for (let p of places) {
    let res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(p)}&prop=pageimages&format=json&pithumbsize=1000`);
    let data = await res.json();
    let pages = data.query.pages;
    let url = Object.values(pages)[0]?.thumbnail?.source;
    console.log(p, url);
  }
}
run();
