// Downloads real assets from github.com/fishaudio/fish-speech for the clone.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public");

const assets = [
  // README hero images (from the repo itself)
  { url: "https://raw.githubusercontent.com/fishaudio/fish-speech/main/docs/assets/totalability.png", dest: "images/readme/totalability.png" },
  { url: "https://raw.githubusercontent.com/fishaudio/fish-speech/main/docs/assets/chattemplate.png", dest: "images/readme/chattemplate.png" },
  // README badges (shields.io / producthunt / trendshift)
  { url: "https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=1023740&theme=light&period=daily", dest: "images/badges/producthunt.svg" },
  { url: "https://trendshift.io/api/badge/repositories/7014", dest: "images/badges/trendshift.svg" },
  { url: "https://img.shields.io/discord/1214047546020728892?color=%23738ADB&label=Discord&logo=discord&logoColor=white&style=flat-square", dest: "images/badges/discord.svg" },
  { url: "https://img.shields.io/docker/pulls/fishaudio/fish-speech?style=flat-square&logo=docker", dest: "images/badges/docker-pulls.svg" },
  { url: "https://img.shields.io/badge/QQ-blue?logo=tencentqq", dest: "images/badges/qq.svg" },
  { url: "https://img.shields.io/badge/%F0%9F%A4%97%20-models-orange", dest: "images/badges/models.svg" },
  { url: "https://img.shields.io/badge/Blog-Fish_Audio_S2-1f7a8c?style=flat-square&logo=readme&logoColor=white", dest: "images/badges/blog.svg" },
  { url: "https://img.shields.io/badge/Paper-Technical_Report-b31b1b?style=flat-square", dest: "images/badges/paper.svg" },
  // Org + contributor avatars
  { url: "https://github.com/fishaudio.png", dest: "images/avatars/fishaudio.png" },
  { url: "https://avatars.githubusercontent.com/u/25119060?v=4", dest: "images/avatars/leng-yue.png" },
  { url: "https://avatars.githubusercontent.com/u/122108331?v=4", dest: "images/avatars/AnyaCoder.png" },
  { url: "https://avatars.githubusercontent.com/u/148920650?v=4", dest: "images/avatars/PoTaTo-Mika.png" },
  { url: "https://avatars.githubusercontent.com/u/52093397?v=4", dest: "images/avatars/Stardust-minus.png" },
  { url: "https://avatars.githubusercontent.com/u/70465000?v=4", dest: "images/avatars/Whale-Dolphin.png" },
  { url: "https://avatars.githubusercontent.com/in/68672?v=4", dest: "images/avatars/pre-commit-ci.png" },
  { url: "https://avatars.githubusercontent.com/u/181805460?v=4", dest: "images/avatars/wishhyt.png" },
  { url: "https://avatars.githubusercontent.com/u/1423701?v=4", dest: "images/avatars/Enucatl.png" },
  { url: "https://avatars.githubusercontent.com/u/63702646?v=4", dest: "images/avatars/Tps-F.png" },
  { url: "https://avatars.githubusercontent.com/u/1288038?v=4", dest: "images/avatars/v3ucn.png" },
  { url: "https://avatars.githubusercontent.com/u/40709280?v=4", dest: "images/avatars/PriesiaMioShirakana.png" },
  { url: "https://avatars.githubusercontent.com/u/135560346?v=4", dest: "images/avatars/Picus303.png" },
  { url: "https://avatars.githubusercontent.com/u/31711261?v=4", dest: "images/avatars/OedoSoldier.png" },
  { url: "https://avatars.githubusercontent.com/u/22633385?v=4", dest: "images/avatars/eltociear.png" },
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
