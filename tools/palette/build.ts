// Palette 1.0: writes every port of every look from the templates in palette/templates.
//
//   bun tools/palette/build.ts           write everything
//   bun tools/palette/build.ts --check   fail if anything on disk differs from what would be written
//
// Templates are the hand-written v1 files of the four original looks. Edit a template, run this, and
// the change lands in that look and every look drawn from it, recolored.
import { $ } from "bun";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LOOKS, rolesOf, type Look } from "./looks";
import { namesOf, TEMPLATE_CODE } from "./names";
import { ColorMap } from "./recolor";

const ROOT = join(import.meta.dir, "..", "..");
const T = (...p: string[]) => join(ROOT, "palette", "templates", ...p);
const R = (...p: string[]) => join(ROOT, ...p);
const check = process.argv.includes("--check");
const drift: string[] = [];

/** Writes a file, or in --check mode notes that it would change. */
function put(path: string, text: string) {
  const now = existsSync(path) ? readFileSync(path, "utf8").replace(/\r\n/g, "\n") : null;
  if (now === text) return;
  if (check) drift.push(path.slice(ROOT.length + 1));
  else writeFileSync(path, text);
}

const read = (p: string) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";
const tpl = (look: Look) => namesOf(TEMPLATE_CODE[look.template]);
const maps = new Map(LOOKS.map((l) => [l.code, ColorMap.forLook(l)]));
const mapOf = (l: Look) => maps.get(l.code)!;

// The canon: every role of every look, for the ports that read roles directly.
put(R("palette", "palette.json"), json({
  looks: LOOKS.map((l) => ({ ...l, names: namesOf(l), roles: rolesOf(l) })),
}));

// VS Code: one theme per look, and the list in package.json.
for (const l of LOOKS) {
  const t = JSON.parse(mapOf(l).recolor(read(T("vsc", tpl(l).vsc + ".json"))));
  t.name = namesOf(l).label;
  put(R("vsc", "themes", namesOf(l).vsc + ".json"), json(t));
}
{
  const pkg = JSON.parse(read(R("vsc", "package.json")));
  pkg.contributes.themes = LOOKS.map((l) => ({ label: namesOf(l).label, uiTheme: l.dark ? "vs-dark" : "vs", path: `./themes/${namesOf(l).vsc}.json` }));
  put(R("vsc", "package.json"), json(pkg));
}

// Zed: one file per family with its dark and light theme.
for (const file of [...new Set(LOOKS.map((l) => namesOf(l).zedFile))]) {
  const looks = LOOKS.filter((l) => namesOf(l).zedFile === file);
  const source = JSON.parse(read(T("zed", tpl(looks[0]).zedFile + ".json")));
  source.name = namesOf(looks[0]).zedFamily;
  source.themes = source.themes.map((theme: { appearance: string }) => {
    const l = looks.find((x) => x.dark === (theme.appearance === "dark"))!;
    const out = JSON.parse(mapOf(l).recolor(JSON.stringify(theme)));
    out.name = namesOf(l).label;
    return out;
  });
  put(R("zed", "themes", file + ".json"), json(source));
}

// Neovim, Sublime Text, Notepad++.
for (const l of LOOKS) {
  const n = namesOf(l), from = tpl(l), m = mapOf(l);
  const lua = m.recolor(read(T("neovim", from.nvim + ".lua")))
    .replace(/^-- .*: Neovim colorscheme$/m, `-- ${l.title}: Neovim colorscheme`)
    .replace(/vim\.g\.colors_name = "[^"]+"/, `vim.g.colors_name = "${n.nvim}"`);
  put(R("neovim", "colors", n.nvim + ".lua"), lua);

  const sub = JSON.parse(m.recolor(read(T("sublime", from.label + ".sublime-color-scheme"))));
  sub.name = n.label;
  put(R("sublime", n.label + ".sublime-color-scheme"), json(sub));

  const npp = m.recolorAttributes(m.recolor(read(T("notepadpp", from.npp + ".xml"))), ["fgColor", "bgColor"]);
  put(R("notepadpp", n.npp + ".xml"), npp);
}

// JetBrains: the palette its generators read, a theme.json per look, and the providers in plugin.xml.
{
  const base = JSON.parse(read(T("jb-palette.json"))) as Record<string, Record<string, string>>;
  const out: Record<string, Record<string, string>> = {};
  for (const l of LOOKS) {
    const src = base[TEMPLATE_CODE[l.template]];
    const m = mapOf(l);
    const entry: Record<string, string> = {};
    for (const [k, v] of Object.entries(src)) entry[k] = /^#[0-9a-f]{6}/i.test(v) ? m.recolor(v) : v;
    entry.file = namesOf(l).jb;
    entry.name = namesOf(l).label;
    out[l.code] = entry;
    const theme = JSON.parse(m.recolor(read(T("jetbrains", tpl(l).jb + ".theme.json"))));
    theme.name = namesOf(l).label;
    theme.editorScheme = `/themes/${namesOf(l).jb}.xml`;
    put(R("jetbrains", "src", "main", "resources", "themes", namesOf(l).jb + ".theme.json"), json(theme));
  }
  put(R("tools", "jb-palette.json"), json(out));

  const xmlPath = R("jetbrains", "src", "main", "resources", "META-INF", "plugin.xml");
  const xml = read(xmlPath);
  const providers = LOOKS.map((l) => `    <themeProvider id="hatsunemiku.${l.id === "miku-dark" ? "dark" : l.id === "miku-light" ? "light" : l.id.replace("-", "")}" path="/themes/${namesOf(l).jb}.theme.json"/>`).join("\n");
  put(xmlPath, xml.replace(/( {4}<themeProvider [^\n]*\n)+/, providers + "\n"));
}

// Spicetify: one scheme per look. user.css reads every color through these, so it fits all of them.
{
  const scheme = (l: Look) => l.family[0].toUpperCase() + l.family.slice(1) + (l.dark ? "Dark" : "Light");
  const sections = LOOKS.map((l) => {
    const r = rolesOf(l);
    const keys: [string, string][] = [
      ["text", r.fg], ["subtext", r.muted], ["sidebar-text", r.fg],
      ["main", r.bg], ["sidebar", r.alt], ["player", r.alt], ["card", r.raised], ["shadow", "#000000"],
      ["selected-row", r.accent], ["button", r.accent], ["button-active", r.accentHover], ["button-disabled", r.faint],
      ["tab-active", r.accent], ["notification", r.accent], ["notification-error", r.red], ["misc", r.line],
      ["highlight", r.hover], ["highlight-elevated", r.secondary], ["accent2", r.second], ["on-button", r.onAccent],
    ];
    return `[${scheme(l)}]\n; ${l.title}\n` + keys.map(([k, v]) => `${k.padEnd(19)}= ${v.slice(1)}`).join("\n");
  });
  put(R("spicetify", "HatsuneMiku", "color.ini"), `; Hatsune Miku for Spicetify. Generated by tools/palette/build.ts from palette 1.0, do not edit by hand.\n\n${sections.join("\n\n")}\n`);
}

// The JetBrains wallpaper art draws with the new tab's accents, so its enum comes from the browser palettes.
{
  const { PALETTES } = await import("../../browser/src/palette");
  const javaPath = R("jetbrains", "src", "main", "java", "com", "github", "vadimkhristenko", "hatsunemikutheme", "MikuTheme.java");
  const java = read(javaPath);
  const hex = (h: string) => "0x" + h.slice(1).toLowerCase();
  const rows = LOOKS.map((l) => {
    const p = PALETTES[l.id as keyof typeof PALETTES];
    return `    ${l.id.replace("-", "_").toUpperCase()}("${namesOf(l).label}", "${l.id}", ${l.dark}, ${hex(p.accent)}, ${hex(p.accent2)})`;
  });
  put(javaPath, java.replace(/(public enum MikuTheme \{\n)[\s\S]*?;\n/, `$1${rows.join(",\n")};\n`).replace(/\/\*\* The (four|\w+) looks\./, `/** The ${LOOKS.length} looks.`));
}

if (check) {
  if (drift.length) {
    console.error(`palette: these files differ from what tools/palette/build.ts writes:\n  ${drift.join("\n  ")}\nRun bun tools/palette/build.ts.`);
    process.exit(1);
  }
  console.log("ok   palette: every port matches the templates");
} else {
  // The JetBrains generators patch the theme.json files and write the editor schemes from jb-palette.json.
  await $`node tools/gen-jb-ui.mjs && node tools/gen-jb-schemes.mjs`.cwd(ROOT).quiet();
  console.log(`palette: ${LOOKS.length} looks written`);
}
