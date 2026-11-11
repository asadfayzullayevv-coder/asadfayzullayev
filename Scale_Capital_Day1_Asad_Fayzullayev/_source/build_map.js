// Renders a geographically correct map (Natural Earth 50m via world-atlas) to PNG
// and exports marker positions (as fractions of image size) for editable labels in the deck.
const fs = require("fs");
const path = require("path");
const d3 = require("d3-geo");
const topojson = require("topojson-client");
const sharp = require("sharp");

const world = require("world-atlas/countries-50m.json");
const countries = topojson.feature(world, world.objects.countries).features;

let W = 2600, H = 1300;
// ISO 3166-1 numeric
const MARKETS = {
  "860": { ru: "Узбекистан", home: true },
  "398": { ru: "Казахстан" },
  "417": { ru: "Кыргызстан" },
  "031": { ru: "Азербайджан" },
  "268": { ru: "Грузия" },
  "792": { ru: "Турция" },
  "604": { ru: "Перу" },
};

let projection, pathGen;
function setView(w, h, coords, rot) {
  W = w; H = h;
  const bbox = { type: "Feature", geometry: { type: "MultiPoint", coordinates: coords } };
  projection = (rot ? d3.geoNaturalEarth1().rotate(rot) : d3.geoNaturalEarth1()).fitSize([W, H], bbox);
  pathGen = d3.geoPath(projection);
}

function color(id, out) {
  const m = MARKETS[id];
  if (!m) return out.land;
  return m.home ? out.home : out.hl;
}

function render(theme, file) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  for (const f of countries) {
    const d = pathGen(f);
    if (!d) continue;
    svg += `<path d="${d}" fill="${color(f.id, theme)}" stroke="${theme.stroke}" stroke-width="1.2" stroke-linejoin="round"/>`;
  }
  svg += `</svg>`;
  return sharp(Buffer.from(svg)).png().toFile(file);
}

(async () => {
  const outDir = path.join(__dirname, "assets");
  fs.mkdirSync(outDir, { recursive: true });
  const theme = { land: "#E2E8F0", hl: "#0D9488", home: "#F59E0B", stroke: "#FFFFFF" };
  const out = {};
  const views = {
    world: { w: 2400, h: 1200, c: [[-95, -45], [95, 65], [-95, 65], [95, -45]] },
    region: { w: 2400, h: 1300, c: [[26, 35], [80, 55], [26, 55], [80, 35]], rot: [-53, 0] },
  };
  for (const [name, v] of Object.entries(views)) {
    setView(v.w, v.h, v.c, v.rot);
    await render(theme, path.join(outDir, `map_${name}.png`));
    const markers = {};
    for (const f of countries) {
      if (!MARKETS[f.id]) continue;
      const [x, y] = projection(d3.geoCentroid(f));
      markers[f.id] = { ...MARKETS[f.id], fx: x / W, fy: y / H };
    }
    out[name] = { W, H, markers };
  }
  fs.writeFileSync(path.join(outDir, "map_markers.json"), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out.region.markers));
})();
