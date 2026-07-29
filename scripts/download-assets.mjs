// Downloads real assets from github.com/sindresorhus/awesome for the clone.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public");

const assets = [
  // README hero + sponsor images (from the repo and its sponsor assets)
  { url: "https://raw.githubusercontent.com/sindresorhus/awesome/main/media/logo.svg", dest: "images/readme/logo.svg" },
  { url: "https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg", dest: "images/readme/standwithukraine-banner.svg" },
  { url: "https://sindresorhus.com/assets/thanks/depot-logo-dark.svg", dest: "images/readme/depot-logo-dark.svg" },
  { url: "https://sindresorhus.com/assets/thanks/depot-logo-light.svg", dest: "images/readme/depot-logo-light.svg" },
  { url: "https://sindresorhus.com/assets/thanks/circleback-logo.png", dest: "images/readme/circleback-logo.png" },
  // Sponsor platform badges
  { url: "https://github.githubassets.com/assets/open_collective-0a706523753d.svg", dest: "images/badges/open-collective.svg" },
  { url: "https://github.githubassets.com/assets/buy_me_a_coffee-63ed78263f6e.svg", dest: "images/badges/buy-me-a-coffee.svg" },
  // Owner + latest-committer avatars
  { url: "https://github.com/sindresorhus.png", dest: "images/avatars/sindresorhus.png" },
  { url: "https://github.com/dar5hak.png", dest: "images/avatars/dar5hak.png" },
  // Top contributor avatars
  { url: "https://github.com/davisonio.png", dest: "images/avatars/davisonio.png" },
  { url: "https://github.com/RichardLitt.png", dest: "images/avatars/RichardLitt.png" },
  { url: "https://github.com/arthurvr.png", dest: "images/avatars/arthurvr.png" },
  { url: "https://github.com/kdeldycke.png", dest: "images/avatars/kdeldycke.png" },
  { url: "https://github.com/AllThingsSmitty.png", dest: "images/avatars/AllThingsSmitty.png" },
  { url: "https://github.com/PatrickJS.png", dest: "images/avatars/PatrickJS.png" },
  { url: "https://github.com/RayBB.png", dest: "images/avatars/RayBB.png" },
  { url: "https://github.com/stevestock.png", dest: "images/avatars/stevestock.png" },
  { url: "https://github.com/johnjago.png", dest: "images/avatars/johnjago.png" },
  { url: "https://github.com/fabacab.png", dest: "images/avatars/fabacab.png" },
  { url: "https://github.com/egeerardyn.png", dest: "images/avatars/egeerardyn.png" },
  { url: "https://github.com/mischah.png", dest: "images/avatars/mischah.png" },
  { url: "https://github.com/vinkla.png", dest: "images/avatars/vinkla.png" },
];

async function downloadOne({ url, dest }) {
  const target = path.join(OUT, dest);
  await mkdir(path.dirname(target), { recursive: true });
  const res = await fetch(url, { headers: { "User-Agent": "asset-downloader" } });
  if (!res.ok) {
    console.error(`FAILED ${url} -> ${res.status}`);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(target, buf);
  console.log(`OK ${dest} (${buf.length} bytes)`);
}

async function run() {
  const batchSize = 4;
  for (let i = 0; i < assets.length; i += batchSize) {
    const batch = assets.slice(i, i + batchSize);
    await Promise.all(batch.map(downloadOne));
  }
}

run();
