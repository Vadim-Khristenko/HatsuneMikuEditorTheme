import { writeFileSync } from "node:fs";
import { join } from "node:path";

// Snapshot of the bang list Helium ships (https://helium.computer/bangs), MIT, Kagi Search and imput.
const SOURCE = "https://files.helium.computer/bangs.json";
const dataDir = join(import.meta.dir, "..", "data");

type Raw = { s: string; t?: string; ts?: string[]; u: string; f?: number };

const text = await (await fetch(SOURCE, { headers: { Accept: "application/json" } })).text();
const header = text.match(/^(\/\/.*\n)+/)?.[0] ?? "";
const raw: Raw[] = JSON.parse(text.replace(/^\/\/.*$/gm, "").replace(/,(\s*])/g, "$1"));

const rows = raw.map((b) => {
  const triggers = [...new Set([b.t, ...(b.ts ?? [])].filter((t): t is string => typeof t === "string"))];
  const row: (string | number)[] = [b.s, triggers.join(" "), b.u];
  if (b.f !== undefined) row.push(b.f);
  return row;
});

writeFileSync(join(dataDir, "bangs.json"), JSON.stringify(rows));
writeFileSync(join(dataDir, "BANGS_LICENSE.txt"), header.replace(/^\/\/ ?/gm, "") + `\nSource: ${SOURCE}\n`);
console.log(`bangs: ${rows.length}`);
