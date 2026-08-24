// tools/check-themes.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
let failures = 0;
const fail = (msg) => { failures++; console.error("FAIL " + msg); };
const ok = (msg) => console.log("ok   " + msg);

function loadJson(p) {
  try { return JSON.parse(readFileSync(p, "utf8")); }
  catch (e) { fail(`${p}: invalid JSON (${e.message})`); return null; }
}

// 1. All JSON everywhere parses
const jsonTargets = [
  "vsc/package.json",
  "vsc/themes/mikuV1-dark.json", "vsc/themes/mikuV1-light.json",
  "vsc/themes/sakuraV1-dark.json", "vsc/themes/sakuraV1-light.json",
  "zed/themes/mikuV1.json", "zed/themes/sakuraV1.json",
];
for (const dir of ["jetbrains/themes"]) {
  const p = join(root, dir);
  if (existsSync(p)) for (const f of readdirSync(p)) if (f.endsWith(".json")) jsonTargets.push(dir + "/" + f);
}
if (existsSync(join(root, "sublime"))) {
  for (const f of readdirSync(join(root, "sublime"))) if (f.endsWith(".sublime-color-scheme")) jsonTargets.push("sublime/" + f);
}
for (const f of jsonTargets) {
  const t = loadJson(join(root, f));
  if (t) ok(`${f} parses`);
}

// 2. Palette conformance: every 6-digit hex in a port file must exist in the
//    canonical VSC theme of the matching variant (colors + tokenColors).
const canon = {};
for (const [code, file] of [["MD","mikuV1-dark"],["ML","mikuV1-light"],["SD","sakuraV1-dark"],["SL","sakuraV1-light"]]) {
  const t = loadJson(join(root, "vsc/themes/" + file + ".json"));
  const set = new Set();
  if (t) {
    for (const v of Object.values(t.colors)) set.add(v.toLowerCase().slice(0, 7));
    for (const r of t.tokenColors) if (r.settings?.foreground) set.add(r.settings.foreground.toLowerCase().slice(0, 7));
  }
  canon[code] = set;
}
const portDirs = [
  ["jetbrains/themes", /\.theme\.json$/],
  ["neovim/colors", /\.lua$/],
  ["sublime", /\.sublime-color-scheme$/],
  ["notepadpp", /\.xml$/],
];
const hexRe = /#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?/g;
for (const [dir, re] of portDirs) {
  const p = join(root, dir);
  if (!existsSync(p)) continue;
  for (const f of readdirSync(p)) {
    if (!re.test(f)) continue;
    const code = /sakura/i.test(f) ? (/light/i.test(f) ? "SL" : "SD") : (/light/i.test(f) ? "ML" : "MD");
    const text = readFileSync(join(p, f), "utf8");
    const used = new Set((text.match(hexRe) || []).map(h => h.toLowerCase().slice(0, 7)));
    const bad = [...used].filter(h => !canon[code].has(h));
    if (bad.length) fail(`${dir}/${f} [${code}] unknown hex: ${bad.join(", ")}`);
    else ok(`${dir}/${f} [${code}] palette conforms (${used.size} unique)`);
  }
}

console.log(failures ? `\n${failures} failure(s)` : "\nALL PASS");
process.exit(failures ? 1 : 0);
