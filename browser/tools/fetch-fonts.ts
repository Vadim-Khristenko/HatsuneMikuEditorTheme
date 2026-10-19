import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";
const QUERY = "family=Onest:wght@100..900&family=Unbounded:wght@200..900&family=JetBrains+Mono:wght@100..800&family=M+PLUS+Rounded+1c:wght@400;700;800&display=swap";
const SUBSETS = new Set(["latin", "latin-ext", "cyrillic", "cyrillic-ext"]);
const outDir = join(import.meta.dir, "..", "static", "fonts");

const css = await (await fetch(`https://fonts.googleapis.com/css2?${QUERY}`, { headers: { "User-Agent": UA } })).text();
const blocks = [...css.matchAll(/\/\* ([a-z-]+) \*\/\s*@font-face \{([^}]+)\}/g)];
mkdirSync(outDir, { recursive: true });

let out = "";
for (const [, subset, body] of blocks) {
  if (!SUBSETS.has(subset)) continue;
  const family = /font-family: '([^']+)'/.exec(body)![1];
  const weight = /font-weight: ([0-9 ]+);/.exec(body)![1];
  const url = /url\((https:[^)]+\.woff2)\)/.exec(body)![1];
  const range = /unicode-range: ([^;]+);/.exec(body)![1];
  const file = `${family.toLowerCase().replace(/\s+/g, "-")}-${weight.replace(" ", "-")}-${subset}.woff2`;
  writeFileSync(join(outDir, file), new Uint8Array(await (await fetch(url)).arrayBuffer()));
  out += `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url(./${file}) format('woff2');unicode-range:${range}}\n`;
}
writeFileSync(join(outDir, "fonts.css"), out);
console.log(`fonts: ${out.split("\n").length - 1} faces`);
