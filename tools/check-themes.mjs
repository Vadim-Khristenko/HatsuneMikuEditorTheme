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
const looks = loadJson(join(root, "palette/palette.json"))?.looks ?? [];
const jbDir = "jetbrains/src/main/resources/themes";
const jsonTargets = ["vsc/package.json", ...looks.map((l) => `vsc/themes/${l.names.vsc}.json`), ...[...new Set(looks.map((l) => l.names.zedFile))].map((f) => `zed/themes/${f}.json`)];
for (const f of readdirSync(join(root, jbDir))) if (f.endsWith(".json")) jsonTargets.push(jbDir + "/" + f);
for (const f of readdirSync(join(root, "sublime"))) if (f.endsWith(".sublime-color-scheme")) jsonTargets.push("sublime/" + f);
for (const f of jsonTargets) {
  const t = loadJson(join(root, f));
  if (t) ok(`${f} parses`);
}

// 2. Palette conformance: every 6-digit hex in a port file must exist in the
//    canonical VSC theme of the matching look (colors + tokenColors).
const canon = {};
for (const l of looks) {
  const t = loadJson(join(root, "vsc/themes/" + l.names.vsc + ".json"));
  const set = new Set();
  if (t) {
    for (const v of Object.values(t.colors)) set.add(v.toLowerCase().slice(0, 7));
    for (const r of t.tokenColors) if (r.settings?.foreground) set.add(r.settings.foreground.toLowerCase().slice(0, 7));
  }
  canon[l.code] = set;
}
// Which look a port file belongs to, by the name each port gives it.
const lookOf = (dir, f) => looks.find((l) => {
  const n = l.names;
  return [`${n.nvim}.lua`, `${n.label}.sublime-color-scheme`, `${n.npp}.xml`, `${n.jb}.theme.json`].includes(f);
});
const portDirs = [
  [jbDir, /\.theme\.json$/],
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
    const look = lookOf(dir, f);
    if (!look) {
      fail(`${dir}/${f}: no look in palette/palette.json has this file`);
      continue;
    }
    const code = look.code;
    const text = readFileSync(join(p, f), "utf8");
    const bare = [...text.matchAll(/\b(?:fgColor|bgColor)="([0-9a-fA-F]{6})"/g)].map((m) => "#" + m[1]);
    const used = new Set([...(text.match(hexRe) || []), ...bare].map(h => h.toLowerCase().slice(0, 7)));
    const bad = [...used].filter(h => !canon[code].has(h));
    if (bad.length) fail(`${dir}/${f} [${code}] unknown hex: ${bad.join(", ")}`);
    else ok(`${dir}/${f} [${code}] palette conforms (${used.size} unique)`);
  }
}

console.log(failures ? `\n${failures} failure(s)` : "\nALL PASS");
process.exit(failures ? 1 : 0);
