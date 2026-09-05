const places = ["Kanger Valley National Park", "Tirathgarh Falls", "Barnawapara Wildlife Sanctuary", "Achanakmar Tiger Reserve", "Gangrel Dam", "Sirpur"];
async function run() {
  for (let q of places) {
    let res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&prop=pageimages&pithumbsize=1000&format=json`);
    let data = await res.json();
    let pages = data.query?.pages;
    if (pages) {
      let url = Object.values(pages).find(p => p.thumbnail)?.thumbnail?.source;
      console.log(q, url);
    }
  }
}
run();
