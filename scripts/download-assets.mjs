// Downloads the linen.ai assets and client modules this clone serves from public/.
// Usage: node scripts/download-assets.mjs
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";

const ORIGIN = "https://linen.ai";
const root = path.resolve(import.meta.dirname, "..");
const list = JSON.parse(await readFile(path.join(import.meta.dirname, "linen-asset-list.json"), "utf8"));

async function fetchOne(p) {
  const dest = path.join(root, "public", p);
  try { await access(dest); return "skip"; } catch {}
  const res = await fetch(ORIGIN + p);
  if (!res.ok) throw new Error(`${res.status} ${p}`);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return "ok";
}

let ok = 0, skip = 0;
const failed = [];
for (let i = 0; i < list.length; i += 4) {
  const results = await Promise.allSettled(list.slice(i, i + 4).map(fetchOne));
  results.forEach((r) => {
    if (r.status === "rejected") failed.push(String(r.reason.message));
    else if (r.value === "ok") ok++; else skip++;
  });
}
console.log(`downloaded ${ok}, skipped ${skip}, failed ${failed.length}`);
failed.forEach((f) => console.log("  FAIL", f));
